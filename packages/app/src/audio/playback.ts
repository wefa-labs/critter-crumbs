import { crossfadeFor, equalPower, nextStart } from './music-plan.js';
import type { VoiceHandle } from './voices.js';

/** A recorded sound played once at its own gain, usable with a live or OfflineAudioContext. */
export function renderSample(context: BaseAudioContext, destination: AudioNode, buffer: AudioBuffer, level: number, at: number, onEnd: () => void = () => {}): VoiceHandle {
  const source = context.createBufferSource(), gain = context.createGain(), end = at + buffer.duration;
  source.buffer = buffer; gain.gain.value = level; source.connect(gain); gain.connect(destination); source.start(at);
  let disposed = false, fading: { at: number; fade: number } | null = null;
  const dispose = () => { if (disposed) return; disposed = true; source.disconnect(); gain.disconnect(); onEnd(); };
  source.onended = dispose;
  return { end, stop(when, fade = 0) {
    if (disposed) return;
    // Stopped before it has begun, it never sounds: a fade from full level would let its first moment through.
    if (when <= at) { try { source.stop(0); } catch { /* A source that has ended is already silent. */ } dispose(); return; }
    // A second stop continues from where the first fade has reached, so the sound never steps back up.
    const from = fading ? level * Math.max(0, 1 - (when - fading.at) / fading.fade) : level;
    gain.gain.cancelScheduledValues(when); gain.gain.setValueAtTime(from, when); gain.gain.linearRampToValueAtTime(0, when + fade);
    try { source.stop(when + fade); } catch { /* A naturally ended source is already silent. */ }
    if (fade) fading = { at: when, fade }; else dispose();
  } };
}

export interface LoopHandle { pump: (now: number) => void; stop: (at: number) => void }
const FADE_POINTS = 33, rise = equalPower(FADE_POINTS, true), fall = equalPower(FADE_POINTS, false);
/**
 * A buffer looped as overlapping passes joined by an equal-power crossfade (Game Design G8), so its seam need not be
 * perfect. The first pass enters at full level: its owner fades it in. `pump` keeps one pass scheduled ahead of the one
 * playing, on the audio clock.
 */
export function renderLoop(context: BaseAudioContext, destination: AudioNode, buffer: AudioBuffer, start: number, crossfade = crossfadeFor(buffer.duration)): LoopHandle {
  const passes = new Set<AudioBufferSourceNode>();
  let next: number | null = start, first = true;
  function pass(at: number) {
    const source = context.createBufferSource(), gain = context.createGain(), end = at + buffer.duration;
    source.buffer = buffer; source.connect(gain); gain.connect(destination);
    if (!first) gain.gain.setValueCurveAtTime(rise, at, crossfade);
    gain.gain.setValueCurveAtTime(fall, end - crossfade, crossfade);
    source.onended = () => { source.disconnect(); gain.disconnect(); passes.delete(source); };
    source.start(at); passes.add(source); first = false;
  }
  return {
    pump(now) {
      // A pass scheduled late starts now, with its fades moved to match, rather than with fades that have already gone by.
      while (next !== null && next - now <= buffer.duration - crossfade) { const at = Math.max(next, now); pass(at); next = nextStart(at, buffer.duration, crossfade); }
    },
    stop(at) { next = null; for (const source of passes) { try { source.stop(at); } catch { /* A naturally ended pass is already silent. */ } } },
  };
}
