import { MUSIC, type MusicTrack } from './assets.js';
import type { AudioBank } from './bank.js';
import { MUSIC_MIX } from './music-plan.js';
import { renderLoop, type LoopHandle } from './playback.js';

/** A track starts a little ahead on the audio clock, as the cues do. */
const START_AHEAD_S = .05;
/**
 * The looping music under a screen (docs/explorations/sound-direction-2026-10.md): one track at a time, fetched when a
 * screen first wants it and let go when the next takes over. A new track waits for a sting or the feast cue still
 * sounding (`holdUntil`), and the music steps back under an open statement.
 */
export function createMusicPlayer(context: BaseAudioContext, bus: AudioNode, bank: AudioBank, holdUntil: () => number = () => 0) {
  const duck = context.createGain(); duck.connect(bus);
  let wanted: MusicTrack | null = null, on = true, ducked = false, current: { track: MusicTrack; gain: GainNode; loop: LoopHandle } | null = null;
  const leaving: { until: number; gain: GainNode }[] = [];
  const duckLevel = () => ducked ? 10 ** (MUSIC_MIX.duckDb / 20) : 1;
  function prune(now: number) { for (let i = leaving.length - 1; i >= 0; i--) if (leaving[i]!.until <= now) { leaving[i]!.gain.disconnect(); leaving.splice(i, 1); } }
  function leave(now: number) {
    if (!current) return;
    const old = current; current = null;
    // setTargetAtTime fades from wherever the gain is, including part-way through its fade in.
    old.gain.gain.cancelScheduledValues(now); old.gain.gain.setTargetAtTime(0, now, MUSIC_MIX.fadeOutS / 4);
    old.loop.stop(now + MUSIC_MIX.fadeOutS); leaving.push({ until: now + MUSIC_MIX.fadeOutS, gain: old.gain });
    bank.release(MUSIC[old.track].url);
  }
  function sync(now: number) {
    prune(now);
    const next = on ? wanted : null;
    if ((current?.track ?? null) === next) return;
    leave(now);
    if (!next) return;
    const url = MUSIC[next].url, buffer = bank.get(url);
    if (!buffer) {
      // A track that never arrives stays quiet; one that arrives after the screen has moved on is let go.
      void bank.load(url).then(loaded => { if (!loaded) return; if (on && wanted === next) sync(context.currentTime); else bank.release(url); });
      return;
    }
    const at = Math.max(now + START_AHEAD_S, holdUntil() - MUSIC_MIX.stingTailS), gain = context.createGain();
    gain.gain.value = 0; gain.gain.setTargetAtTime(1, at, MUSIC_MIX.fadeInS / 4); gain.connect(duck);
    const loop = renderLoop(context, gain, buffer, at); loop.pump(now);
    current = { track: next, gain, loop };
  }
  return {
    /** The track the screen wants, or null for quiet. */
    play(track: MusicTrack | null, now: number) { wanted = track; sync(now); },
    /** The Music toggle. */
    setEnabled(value: boolean, now: number) { on = value; sync(now); },
    duck(value: boolean, now: number) { ducked = value; duck.gain.setTargetAtTime(duckLevel(), now, MUSIC_MIX.duckS); },
    /** Back from a hidden tab: the music returns over a second rather than at once. */
    resume(now: number) { duck.gain.cancelScheduledValues(now); duck.gain.setValueAtTime(0, now); duck.gain.setTargetAtTime(duckLevel(), now, MUSIC_MIX.resumeS / 4); },
    /** Keeps the loop's next pass scheduled; call it about once a second while `active`. */
    pump(now: number) { prune(now); current?.loop.pump(now); },
    active: () => on && wanted !== null,
    inspect: () => ({ track: current?.track ?? null, wanted }),
    dispose(now: number) { wanted = null; current?.loop.stop(now); current?.gain.disconnect(); current = null; for (const item of leaving) item.gain.disconnect(); leaving.length = 0; duck.disconnect(); },
  };
}
export type MusicPlayer = ReturnType<typeof createMusicPlayer>;
