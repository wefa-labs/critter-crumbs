import { REDUCED_MOTION } from '@critter-crumbs/shared';
import type { GameSettings, SoundCue, SoundToken } from '../world/index.js';
import { soundTokens } from './plan.js';
import { createSoundEngine } from './engine.js';
export { planToken, soundTokens, pentatonicFrequency } from './plan.js';
export { renderVoice, audioGraph } from './voices.js';
/** GQ1: no ambient file has been selected. No request is made for this placeholder. */
export const ambienceAsset: { opus: string | null; mp3: string | null } = { opus:null, mp3:null };
export function createAudio(initial: GameSettings) {
  let context: AudioContext | null = null, engine: ReturnType<typeof createSoundEngine> | null = null, settings = initial, hidden = false, destroyed = false;
  let timer: ReturnType<typeof setInterval> | null = null;
  function stopTimer() { if(timer) clearInterval(timer); timer=null; }
  function pump() { if(context && engine) { engine.pump(context.currentTime); if (!engine.inspect().pouring) stopTimer(); } }
  function cue(event: SoundCue) {
    if (event.action === 'stop') { if(context) engine?.cue(event,context.currentTime); stopTimer(); return; }
    if (!context || context.state !== 'running' || !engine || hidden || !settings.effects || destroyed) return;
    engine.cue(event,context.currentTime);
    if (engine.inspect().pouring && !timer) { pump(); timer = setInterval(pump,25); }
  }
  function clear() { stopTimer(); if(context) engine?.stop(context.currentTime); }
  return {
    unlock() { if(destroyed) return; try { context ??= new AudioContext({ latencyHint:'interactive' }); engine ??= createSoundEngine(context,context.destination); engine.setEffects(settings.effects,context.currentTime); if(!hidden) void context.resume().catch(() => {}); } catch { /* The DOM always carries the complete state if audio is unavailable. */ } },
    cue,
    play(token: SoundToken) { cue({ token, pitchStep:0, level:soundTokens[token].db + (settings.still || settings.reducedMotion ? REDUCED_MOTION.dampingDb : 0), action:'trigger', durationMs:0 }); },
    setSettings(next: GameSettings) { if(!next.effects || (next.still && !settings.still) || (next.reducedMotion && !settings.reducedMotion)) clear(); settings=next; if(context) engine?.setEffects(next.effects,context.currentTime); },
    setHidden(value: boolean) { hidden=value; if(value) { clear(); if(context) void context.suspend().catch(() => {}); } else if(context) void context.resume().catch(() => {}); },
    stop:clear,
    inspect: () => ({ created:!!context, ...(engine?.inspect() ?? { activeVoices:0, pouring:false }), running:context?.state === 'running', ambienceAvailable:!!(ambienceAsset.opus || ambienceAsset.mp3) }),
    destroy() { destroyed=true; clear(); if(context) { engine?.dispose(context.currentTime); void context.close().catch(() => {}); } engine=null; context=null; },
  };
}
export type Audio = ReturnType<typeof createAudio>;
