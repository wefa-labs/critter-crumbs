import type { SoundCue } from '../world/index.js';
import { SAMPLES, type SampleName } from './assets.js';
import { createPourSchedule, cutsOf, pentatonicFrequency, planSamples, planToken, replacesSynth, type Note, type SampleTrigger } from './plan.js';
import { renderLoop, renderSample, type LoopHandle } from './playback.js';
import { audioGraph, renderVoice, type VoiceHandle } from './voices.js';
/**
 * One recording plays at most this many deep: a large feast feeds faster than a nibble lasts. A recording is never cut
 * dead: it fades for at least SAMPLE_RELEASE_S, for LEAVE_S when a screen is left with a sting still ringing, and for
 * CUT_S when its own cue takes over from it (the feast cue under its resolve).
 */
const SAMPLE_DEPTH = 4, SAMPLE_RELEASE_S = .05, LEAVE_S = .25, CUT_S = .25;
interface Pour { gain: GainNode; rustle: GainNode; nodes: AudioNode[]; breath?: VoiceHandle; sparkle?: LoopHandle; start: number; cue: SoundCue; rate: number }
/**
 * Audio time is injected, so the same engine renders offline and in a live host. `recorded` hands over a recording once
 * it has loaded; until then a cue plays its synth version.
 */
export function createSoundEngine(context: BaseAudioContext, destination: AudioNode, random: () => number = Math.random, recorded: (name: SampleName) => AudioBuffer | undefined = () => undefined) {
  const graph = audioGraph(context,destination), music: AudioNode = graph.music, pool = new Set<VoiceHandle>(), samples = new Set<{ name: SampleName; handle: VoiceHandle }>(), grains = createPourSchedule();
  let pour: Pour | null = null;
  const retired: { at: number; nodes: AudioNode[] }[] = [];
  function prune(now: number) {
    for (const handle of pool) if (handle.end <= now) pool.delete(handle);
    // Physical disconnect follows the context's rendered time, not future lookahead.
    for (let i=retired.length-1;i>=0;i--) if (retired[i]!.at <= context.currentTime) { for (const node of retired[i]!.nodes) node.disconnect(); retired.splice(i,1); }
  }
  function voice(note: Note, at: number, now: number, target: AudioNode = graph.input) {
    prune(now); if (pool.size >= 16) { const oldest = [...pool].find(handle => handle !== pour?.breath) ?? pool.values().next().value!; oldest.stop(now); pool.delete(oldest); }
    let handle: VoiceHandle; handle = renderVoice(context,target,note,at,() => { pool.delete(handle); prune(context.currentTime); }); pool.add(handle); return handle;
  }
  /** Recorded sounds join the effects gain past the voices' compressor, so each lands at the level it was given. */
  function sample(trigger: SampleTrigger, buffer: AudioBuffer, at: number) {
    const same = [...samples].filter(entry => entry.name === trigger.sample);
    if (same.length >= SAMPLE_DEPTH) { same[0]!.handle.stop(at,SAMPLE_RELEASE_S); samples.delete(same[0]!); }
    const entry = { name: trigger.sample, handle: renderSample(context,graph.effects,buffer,trigger.gain,at+trigger.at,() => { samples.delete(entry); }) }; samples.add(entry);
  }
  function fadeOut(names: readonly SampleName[], at: number, seconds: number) { for (const entry of [...samples]) if (names.includes(entry.name)) { entry.handle.stop(at,seconds); samples.delete(entry); } }
  function stopPour(now: number, fade = .06) {
    grains.stop(); if (!pour) return;
    const previous = pour; pour = null;
    previous.gain.gain.cancelScheduledValues(now); previous.gain.gain.setValueAtTime(Math.max(0,Math.min(1,(now-previous.start)/.15)),now); previous.gain.gain.linearRampToValueAtTime(0,now+fade);
    previous.breath?.stop(now,fade); previous.sparkle?.stop(now+fade); retired.push({ at:now+fade, nodes:[previous.gain,previous.rustle,...previous.nodes] });
  }
  /** The bed under a pour's grains: the sparkle loop, or the breath voice until the sparkle has loaded. Both sit 10 dB under the grains. */
  function pourBed(event: SoundCue, start: number, now: number, rustle: GainNode): Pick<Pour, 'nodes' | 'breath' | 'sparkle'> {
    const buffer = recorded('sparkle');
    if (!buffer) return { nodes:[], breath:voice({ voice:'breath', at:0, duration:3600, gain:10 ** ((event.level-10)/20), frequency:pentatonicFrequency(event.pitchStep), cents:0 },start,now,rustle) };
    const level = context.createGain(); level.gain.value = 10 ** ((event.level-10-SAMPLES.sparkle.peakDb)/20); level.connect(rustle);
    const sparkle = renderLoop(context,level,buffer,start); sparkle.pump(now);
    return { nodes:[level], sparkle };
  }
  function cue(event: SoundCue, now: number) {
    prune(now);
    if (event.action === 'stop') { if(event.token === 'pour.hold' || event.token === 'pour.reverse') stopPour(now,event.durationMs/1000 || .06); else stop(now,event.durationMs/1000); return; }
    if (event.action === 'start' || event.action === 'update') {
      const rate = event.rate ?? 8;
      if (event.action === 'update' && pour?.cue.token === event.token) { pour.cue = event; pour.rate = rate; grains.rate(rate); pour.rustle.gain.setTargetAtTime(rate > 12 ? 1 : .15,now,.05); return; }
      stopPour(now); const start = now+.02, gain = context.createGain(), rustle = context.createGain(); gain.gain.setValueAtTime(0,start); gain.gain.linearRampToValueAtTime(1,start+.15); gain.connect(graph.input); rustle.gain.value = rate > 12 ? 1 : .15; rustle.connect(gain);
      pour = { gain, rustle, ...pourBed(event,start,now,rustle), start, cue:event, rate }; grains.start(start,rate); return;
    }
    const at = now+.02; let lead = false;
    fadeOut(cutsOf(event.token),at,CUT_S);
    for (const [index,trigger] of planSamples(event.token,{ level:event.level }).entries()) { const buffer = recorded(trigger.sample); if (!buffer) continue; sample(trigger,buffer,at); lead ||= index === 0; }
    if (lead && replacesSynth(event.token)) return;
    for (const note of planToken(event.token,{ pitchStep:event.pitchStep, level:event.level, durationMs:event.durationMs, random })) voice(note,at,now);
  }
  function pump(now: number) {
    prune(now); if (!pour) return;
    pour.sparkle?.pump(now);
    for (const at of grains.grains(now+.02)) {
      const note = planToken(pour.cue.token === 'pour.reverse' ? 'crumb.remove' : 'crumb.add', { pitchStep:pour.cue.pitchStep, level:pour.cue.level - (pour.rate > 12 ? 6 : 0), random })[0]!;
      voice(note,Math.max(now,at),now,pour.gain);
    }
  }
  function end(now: number, voices: number, recordings: number) {
    stopPour(now,voices); for (const handle of [...pool]) handle.stop(now,voices); pool.clear();
    for (const entry of [...samples]) entry.handle.stop(now,recordings); samples.clear();
  }
  /** Stops everything on the effects bus: at once for the voices, or over `seconds` when a cue asks for a fade (skipping the feast). */
  const stop = (now: number, seconds?: number) => end(now,seconds ?? 0,seconds === undefined ? LEAVE_S : Math.max(seconds,SAMPLE_RELEASE_S));
  /** Ends everything at once, for a context about to be suspended: its clock stops, so a fade would be left to play on return. */
  const silence = (now: number) => end(now,0,0);
  return { cue, pump, stop, silence,
    /** Where the music plays into the mix. */
    music,
    /** When the sting or feast cue now sounding will have finished, or 0: a loop about to start waits for it. */
    musicalUntil: () => Math.max(0,...[...samples].filter(entry => SAMPLES[entry.name].musical).map(entry => entry.handle.end)),
    setEffects(on: boolean, now: number) { if (!on) stop(now); graph.effects.gain.setTargetAtTime(on ? 1 : 0,now,.01); },
    inspect: () => ({ activeVoices:pool.size, recordings:samples.size, pouring:!!pour }),
    dispose(now: number) { stop(now); for(const item of retired) for(const node of item.nodes) node.disconnect(); retired.length=0; graph.dispose(); },
  };
}
