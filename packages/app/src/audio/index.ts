import { REDUCED_MOTION } from '@critter-crumbs/shared';
import type { GameSettings, SoundCue, SoundToken } from '../world/index.js';
import { SAMPLES, type MusicTrack, type SampleName } from './assets.js';
import { createAudioBank } from './bank.js';
import { createSoundEngine } from './engine.js';
import { createMusicPlayer, type MusicPlayer } from './music.js';
import { soundTokens } from './plan.js';
export { planToken, soundTokens, pentatonicFrequency } from './plan.js';
export { renderVoice, audioGraph } from './voices.js';
export type { MusicTrack } from './assets.js';
/**
 * The events that may start sound. A browser lets audio begin only on a user's action, and which event counts depends
 * on the device: a mouse press, a touch as the finger lifts (never as it lands), a click from assistive technology, a key.
 */
export const UNLOCK_EVENTS = ['pointerdown', 'pointerup', 'click', 'keydown'] as const;
/**
 * The live sound host. Nothing is created, fetched or played before the first gesture (`unlock`); then the recorded
 * effects and stings load, and each screen's music when it is first wanted. Sound stops while the tab is hidden.
 */
export function createAudio(initial: GameSettings) {
  let context: AudioContext | null = null, engine: ReturnType<typeof createSoundEngine> | null = null, player: MusicPlayer | null = null, settings = initial, hidden = false, destroyed = false;
  let track: MusicTrack | null = null, ducked = false;
  let timer: ReturnType<typeof setInterval> | null = null, musicTimer: ReturnType<typeof setInterval> | null = null;
  const listeners = new Set<() => void>(), heard = () => { for (const listener of listeners) listener(); };
  function stopTimer() { if(timer) clearInterval(timer); timer=null; }
  function pump() { if(context && engine) { engine.pump(context.currentTime); if (!engine.inspect().pouring) stopTimer(); } }
  /** The loop's next pass is scheduled from a slow timer of its own; a pass lasts a minute or more. */
  function watchMusic() {
    const wanted = !!context && !!player?.active() && !hidden && !destroyed;
    if (wanted && !musicTimer) musicTimer = setInterval(() => { if(context) player?.pump(context.currentTime); },1000);
    if (!wanted && musicTimer) { clearInterval(musicTimer); musicTimer=null; }
  }
  function cue(event: SoundCue) {
    if (event.action === 'stop') { if(context) engine?.cue(event,context.currentTime); stopTimer(); return; }
    if (!context || context.state !== 'running' || !engine || hidden || !settings.effects || destroyed) return;
    engine.cue(event,context.currentTime);
    if (engine.inspect().pouring && !timer) { pump(); timer = setInterval(pump,25); }
  }
  function clear() { stopTimer(); if(context) engine?.stop(context.currentTime); }
  function start(created: AudioContext) {
    const bank = createAudioBank({ fetch: url => fetch(url).then(response => { if(!response.ok) throw new Error(url); return response.arrayBuffer(); }), decode: bytes => created.decodeAudioData(bytes) });
    // A recording that failed to load is asked for again the next time its cue plays.
    const made = createSoundEngine(created,created.destination,Math.random,(name: SampleName) => bank.get(SAMPLES[name].url) ?? (void bank.load(SAMPLES[name].url), undefined));
    const loops = createMusicPlayer(created,made.music,bank,made.musicalUntil); engine = made; player = loops;
    for (const sample of Object.values(SAMPLES)) void bank.load(sample.url);
    made.setEffects(settings.effects,created.currentTime); loops.setEnabled(settings.music,created.currentTime); loops.duck(ducked,created.currentTime); loops.play(track,created.currentTime);
  }
  return {
    unlock() { if(destroyed) return; try { if(!context) { context = new AudioContext({ latencyHint:'interactive' }); context.addEventListener('statechange',heard); } if(!engine) start(context); if(!hidden) void context.resume().then(heard).catch(() => {}); watchMusic(); } catch { /* The DOM always carries the complete state if audio is unavailable. */ } },
    cue,
    play(token: SoundToken) { cue({ token, pitchStep:0, level:soundTokens[token].db + (settings.still || settings.reducedMotion ? REDUCED_MOTION.dampingDb : 0), action:'trigger', durationMs:0 }); },
    /** The music under the screen now showing, or null for quiet. It starts once sound is unlocked and Music is on. */
    music(next: MusicTrack | null) { track=next; if(context) player?.play(next,context.currentTime); watchMusic(); },
    /** The music steps back while a statement is open. */
    duck(value: boolean) { ducked=value; if(context) player?.duck(value,context.currentTime); },
    setSettings(next: GameSettings) { if(!next.effects || (next.still && !settings.still) || (next.reducedMotion && !settings.reducedMotion)) clear(); settings=next; if(context) { engine?.setEffects(next.effects,context.currentTime); player?.setEnabled(next.music,context.currentTime); } watchMusic(); },
    setHidden(value: boolean) {
      const returning = hidden && !value; hidden=value;
      if(value) { stopTimer(); if(context) { engine?.silence(context.currentTime); void context.suspend().catch(() => {}); } } else if(context) { if(returning) player?.resume(context.currentTime); void context.resume().catch(() => {}); }
      watchMusic();
    },
    /** Whether sound can be heard now: a browser keeps it shut until the first gesture, and it pauses while the tab is hidden. */
    running: () => context?.state === 'running',
    /** Tells a listener whenever `running` may have changed. */
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    /** Stops the effects; the music plays on from screen to screen. */
    stop:clear,
    inspect: () => ({ created:!!context, ...(engine?.inspect() ?? { activeVoices:0, recordings:0, pouring:false }), running:context?.state === 'running', music:player?.inspect() ?? { track:null, wanted:track } }),
    destroy() { destroyed=true; clear(); watchMusic(); if(context) { context.removeEventListener('statechange',heard); player?.dispose(context.currentTime); engine?.dispose(context.currentTime); void context.close().catch(() => {}); } player=null; engine=null; context=null; },
  };
}
export type Audio = ReturnType<typeof createAudio>;
