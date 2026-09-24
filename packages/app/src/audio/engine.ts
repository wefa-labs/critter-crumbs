import type { SoundCue } from '../world/index.js';
import { createPourSchedule, pentatonicFrequency, planToken, type Note } from './plan.js';
import { audioGraph, renderVoice, type VoiceHandle } from './voices.js';
/** Audio time is injected, so the same engine renders offline and in a live host. */
export function createSoundEngine(context: BaseAudioContext, destination: AudioNode, random: () => number = Math.random) {
  const graph = audioGraph(context,destination), pool = new Set<VoiceHandle>(), grains = createPourSchedule();
  let pour: { gain: GainNode; rustle: GainNode; breath: VoiceHandle; start: number; cue: SoundCue; rate: number } | null = null;
  const retired: { at: number; gain: GainNode; rustle: GainNode }[] = [];
  function prune(now: number) {
    for (const handle of pool) if (handle.end <= now) pool.delete(handle);
    // Physical disconnect follows the context's rendered time, not future lookahead.
    for (let i=retired.length-1;i>=0;i--) if (retired[i]!.at <= context.currentTime) { retired[i]!.gain.disconnect(); retired[i]!.rustle.disconnect(); retired.splice(i,1); }
  }
  function voice(note: Note, at: number, now: number, target: AudioNode = graph.input) {
    prune(now); if (pool.size >= 16) { const oldest = [...pool].find(handle => handle !== pour?.breath) ?? pool.values().next().value!; oldest.stop(now); pool.delete(oldest); }
    let handle: VoiceHandle; handle = renderVoice(context,target,note,at,() => { pool.delete(handle); prune(context.currentTime); }); pool.add(handle); return handle;
  }
  function stopPour(now: number, fade = .06) {
    grains.stop(); if (!pour) return;
    const previous = pour; pour = null;
    previous.gain.gain.cancelScheduledValues(now); previous.gain.gain.setValueAtTime(Math.max(0,Math.min(1,(now-previous.start)/.15)),now); previous.gain.gain.linearRampToValueAtTime(0,now+fade);
    previous.breath.stop(now,fade); retired.push({ at:now+fade, gain:previous.gain, rustle:previous.rustle });
  }
  function cue(event: SoundCue, now: number) {
    prune(now);
    if (event.action === 'stop') { if(event.token === 'pour.hold' || event.token === 'pour.reverse') stopPour(now,event.durationMs/1000 || .06); else stop(now,event.durationMs/1000); return; }
    if (event.action === 'start' || event.action === 'update') {
      const rate = event.rate ?? 8;
      if (event.action === 'update' && pour?.cue.token === event.token) { pour.cue = event; pour.rate = rate; grains.rate(rate); pour.rustle.gain.setTargetAtTime(rate > 12 ? 1 : .15,now,.05); return; }
      stopPour(now); const start = now+.02, gain = context.createGain(), rustle = context.createGain(); gain.gain.setValueAtTime(0,start); gain.gain.linearRampToValueAtTime(1,start+.15); gain.connect(graph.input); rustle.gain.value = rate > 12 ? 1 : .15; rustle.connect(gain);
      const breath = voice({ voice:'breath', at:0, duration:3600, gain:10 ** ((event.level-10)/20), frequency:pentatonicFrequency(event.pitchStep), cents:0 },start,now,rustle);
      pour = { gain, rustle, breath, start, cue:event, rate }; grains.start(start,rate); return;
    }
    for (const note of planToken(event.token,{ pitchStep:event.pitchStep, level:event.level, durationMs:event.durationMs, random })) voice(note,now+.02,now);
  }
  function pump(now: number) {
    prune(now); if (!pour) return;
    for (const at of grains.grains(now+.02)) {
      const note = planToken(pour.cue.token === 'pour.reverse' ? 'crumb.remove' : 'crumb.add', { pitchStep:pour.cue.pitchStep, level:pour.cue.level - (pour.rate > 12 ? 6 : 0), random })[0]!;
      voice(note,Math.max(now,at),now,pour.gain);
    }
  }
  function stop(now: number, fade = 0) { stopPour(now,fade); for (const handle of [...pool]) handle.stop(now,fade); pool.clear(); }
  return { cue, pump, stop,
    setEffects(on: boolean, now: number) { if (!on) stop(now); graph.effects.gain.setTargetAtTime(on ? 1 : 0,now,.01); },
    inspect: () => ({ activeVoices:pool.size, pouring:!!pour }),
    dispose(now: number) { stop(now); for(const item of retired) { item.gain.disconnect(); item.rustle.disconnect(); } retired.length=0; graph.dispose(); },
  };
}
