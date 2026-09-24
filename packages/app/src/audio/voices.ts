import type { Note } from './plan.js';
export interface VoiceHandle { end: number; stop: (at: number, fade?: number) => void }
export function seededNoise(seed = 73491) { let value = seed >>> 0; return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; }; }
export function audioGraph(context: BaseAudioContext, destination: AudioNode) {
  const input = context.createDynamicsCompressor(), lowpass = context.createBiquadFilter(), effects = context.createGain(), bed = context.createGain();
  input.threshold.value = -18; input.ratio.value = 3; input.attack.value = .005; input.release.value = .12;
  lowpass.type = 'lowpass'; lowpass.frequency.value = 6000;
  // Gain before the shared linear filter leaves the ambience independently controllable.
  input.connect(effects); effects.connect(lowpass); bed.connect(lowpass); lowpass.connect(destination);
  return { input, effects, bed, dispose() { input.disconnect(); effects.disconnect(); bed.disconnect(); lowpass.disconnect(); } };
}
/** Five recipes, usable with a live or OfflineAudioContext. No browser clock reads. */
export function renderVoice(context: BaseAudioContext, destination: AudioNode, note: Note, start: number, onEnd: () => void = () => {}): VoiceHandle {
  const at = start + note.at, end = at + note.duration, gain = context.createGain(); gain.connect(destination);
  const sources: AudioScheduledSourceNode[] = [], nodes: AudioNode[] = [gain];
  const attack = Math.min(note.duration / 4, { tick:.002, pluck:.004, thump:.003, breath:.04, drone:.2 }[note.voice]);
  const peak = Math.max(.000001, note.gain);
  const sustain = note.voice === 'breath' || note.voice === 'drone';
  const decayAt = sustain ? Math.max(at + attack, end - Math.min(.12,note.duration/3)) : at + Math.max(attack,Math.min(note.duration*.85, { tick:.07, pluck:.16, thump:.11 }[note.voice as 'tick' | 'pluck' | 'thump']));
  const decayGain = sustain ? peak : Math.max(.000001,peak*.04);
  const envelope = (time: number) => { if(time <= at) return .000001; if(time < at+attack) return .000001 + (peak-.000001)*(time-at)/attack; if(time < decayAt) return sustain ? peak : peak*(decayGain/peak)**((time-at-attack)/(decayAt-at-attack)); if(time >= end) return 0; return decayGain*(.000001/decayGain)**Math.min(1,(time-decayAt)/(end-.001-decayAt)); };
  gain.gain.setValueAtTime(.000001, at); gain.gain.linearRampToValueAtTime(peak, at + attack);
  if (note.voice === 'breath' || note.voice === 'drone') {
    gain.gain.setValueAtTime(peak, Math.max(at + attack, end - Math.min(.12, note.duration / 3)));
  } else {
    const decay = Math.min(note.duration * .85, { tick:.07, pluck:.16, thump:.11 }[note.voice]);
    gain.gain.exponentialRampToValueAtTime(Math.max(.000001, peak * .04), at + Math.max(attack, decay));
  }
  gain.gain.exponentialRampToValueAtTime(.000001, end - .001); gain.gain.linearRampToValueAtTime(0, end);
  const source = (node: AudioScheduledSourceNode, target: AudioNode, stop = end) => { node.connect(target); node.start(at); node.stop(stop); sources.push(node); nodes.push(node); };
  const oscillator = (type: OscillatorType, frequency: number, target: AudioNode, cents = note.cents, endFrequency?: number, bend = .03) => {
    const node = context.createOscillator(); node.type = type; node.frequency.setValueAtTime(frequency, at); node.detune.value = cents;
    if (endFrequency) node.frequency.exponentialRampToValueAtTime(endFrequency, Math.min(end, at + bend)); source(node, target); return node;
  };
  const noise = (target: AudioNode, duration = note.duration) => {
    const length = Math.max(128, Math.ceil(context.sampleRate * Math.min(1, duration))), buffer = context.createBuffer(1, length, context.sampleRate), data = buffer.getChannelData(0), random = seededNoise(Math.floor(note.frequency * 31 + (note.cents + 30) * 53));
    for(let i=0;i<length;i++) data[i] = random() * 2 - 1;
    const node = context.createBufferSource(); node.buffer = buffer; node.loop = duration > 1; source(node, target, at + duration);
  };
  if (note.voice === 'tick') {
    const tone = context.createGain(); tone.gain.value = .8; tone.connect(gain); nodes.push(tone);
    oscillator('sine',620 * note.frequency / 261.625565,tone,note.cents,380 * note.frequency / 261.625565);
    const filter = context.createBiquadFilter(), burst = context.createGain(); filter.type = 'bandpass'; filter.frequency.value = 2500; filter.Q.value = 1.5;
    burst.gain.setValueAtTime(.2,at); burst.gain.exponentialRampToValueAtTime(.000001,at+.012); filter.connect(burst); burst.connect(gain); nodes.push(filter,burst); noise(filter, .012);
  } else if (note.voice === 'pluck') {
    const filter = context.createBiquadFilter(), blend = context.createGain(); filter.type = 'lowpass'; filter.frequency.value = 1800; blend.gain.value = .5; filter.connect(blend); blend.connect(gain); nodes.push(filter,blend);
    oscillator('triangle',note.frequency,filter); oscillator('triangle',note.frequency,filter,note.cents+6);
  } else if (note.voice === 'thump') oscillator('sine',note.frequency,gain,note.cents,note.frequency*2/3,.06);
  else if (note.voice === 'breath') {
    const filter = context.createBiquadFilter(), modulation = context.createGain(), depth = context.createGain();
    filter.type = 'bandpass'; filter.frequency.setValueAtTime(900,at); filter.frequency.exponentialRampToValueAtTime(2400,end); filter.Q.value = .7;
    modulation.gain.value = .65; depth.gain.value = .3; depth.connect(modulation.gain); filter.connect(modulation); modulation.connect(gain); nodes.push(filter,modulation,depth);
    noise(filter); oscillator('sine', 12 + (note.frequency % 7), depth, 0);
  } else {
    const blend = context.createGain(), modulation = context.createGain(), depth = context.createGain(); blend.gain.value = .5; modulation.gain.value = .7; depth.gain.value = .2;
    blend.connect(modulation); depth.connect(modulation.gain); modulation.connect(gain); nodes.push(blend,modulation,depth);
    oscillator('sine',65,blend,0); oscillator('sine',130,blend,0); oscillator('sine',.3,depth,0);
  }
  let disposed = false;
  const dispose = () => { if (disposed) return; disposed = true; for (const node of nodes) node.disconnect(); onEnd(); };
  sources[0]!.onended = dispose;
  return { end, stop(when, fade = 0) { if (disposed) return; gain.gain.cancelScheduledValues(when); gain.gain.setValueAtTime(envelope(when),when); gain.gain.linearRampToValueAtTime(0,when+fade); for(const node of sources) { try { node.stop(when+fade); } catch { /* A naturally ended source is already silent. */ } } if (!fade) dispose(); } };
}
