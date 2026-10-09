import { MUSIC_MIX } from './music-plan.js';
import type { Note } from './plan.js';
export interface VoiceHandle { end: number; stop: (at: number, fade?: number) => void }
export function seededNoise(seed = 73491) { let value = seed >>> 0; return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; }; }
/** The limiter that ends the chain: a hard knee 3 dB under full scale. */
const LIMITER = { db: -3, ratio: 20, attack: .003, release: .25 } as const;
/**
 * A DynamicsCompressorNode adds make-up gain of its own: the gain that would bring a full-scale input back to full scale,
 * raised to the power 0.6 (Web Audio §1.19.5). This undoes it, so a sound under the threshold leaves at the level it came in.
 */
const limiterTrim = 10 ** (.6 * LIMITER.db * (1 - 1 / LIMITER.ratio) / 20);
/** How long the mix takes to open once it is made (see `audioGraph`). A cue played sooner starts a little quiet. */
export const GRAPH_OPENS_S = .15;
/**
 * The mix (Game Design §5.4). Synth voices pass a gentle compressor into the effects gain, which is the Sounds toggle;
 * recorded sounds join them there at their own level; the music bus sits under both; the limiter ends the chain.
 */
export function audioGraph(context: BaseAudioContext, destination: AudioNode) {
  const input = context.createDynamicsCompressor(), effects = context.createGain(), music = context.createGain(), limiter = context.createDynamicsCompressor(), trim = context.createGain();
  input.threshold.value = -18; input.ratio.value = 3; input.attack.value = .005;
  limiter.threshold.value = LIMITER.db; limiter.knee.value = 0; limiter.ratio.value = LIMITER.ratio; limiter.attack.value = LIMITER.attack;
  music.gain.value = 10 ** (MUSIC_MIX.db / 20); trim.gain.value = limiterTrim;
  input.connect(effects); effects.connect(limiter); music.connect(limiter); limiter.connect(trim); trim.connect(destination);
  // A compressor node starts shut: its detector begins at zero, so it ducks the first few hundred milliseconds of the first
  // sound it is ever given. A moment of inaudible signal, with both releases quickened while it lasts, opens them before any cue.
  const opener = context.createConstantSource(), made = context.currentTime; opener.offset.value = 1e-6;
  opener.connect(input); opener.connect(limiter); opener.start(made); opener.stop(made + GRAPH_OPENS_S);
  for (const [node, release] of [[input, .12], [limiter, LIMITER.release]] as const) { node.release.setValueAtTime(.01, made); node.release.setValueAtTime(release, made + GRAPH_OPENS_S * .8); }
  return { input, effects, music, dispose() { for (const node of [opener, input, effects, music, limiter, trim]) node.disconnect(); } };
}
/** Five recipes, usable with a live or OfflineAudioContext. No browser clock reads. */
export function renderVoice(context: BaseAudioContext, destination: AudioNode, note: Note, start: number, onEnd: () => void = () => {}): VoiceHandle {
  const at = start + note.at, end = at + note.duration, gain = context.createGain(); gain.connect(destination);
  const sources: AudioScheduledSourceNode[] = [], nodes: AudioNode[] = [gain];
  const attack = Math.min(note.duration / 4, { tick:.002, thump:.003, breath:.04, drone:.2, bell:.002 }[note.voice]);
  const peak = Math.max(.000001, note.gain);
  const sustain = note.voice === 'breath' || note.voice === 'drone';
  const decayAt = sustain ? Math.max(at + attack, end - Math.min(.12,note.duration/3)) : at + Math.max(attack,Math.min(note.duration*.85, { tick:.07, thump:.11, bell:.22 }[note.voice as 'tick' | 'thump' | 'bell']));
  const decayGain = sustain ? peak : Math.max(.000001,peak*.04);
  const envelope = (time: number) => { if(time <= at) return .000001; if(time < at+attack) return .000001 + (peak-.000001)*(time-at)/attack; if(time < decayAt) return sustain ? peak : peak*(decayGain/peak)**((time-at-attack)/(decayAt-at-attack)); if(time >= end) return 0; return decayGain*(.000001/decayGain)**Math.min(1,(time-decayAt)/(end-.001-decayAt)); };
  gain.gain.setValueAtTime(.000001, at); gain.gain.linearRampToValueAtTime(peak, at + attack);
  if (note.voice === 'breath' || note.voice === 'drone') {
    gain.gain.setValueAtTime(peak, Math.max(at + attack, end - Math.min(.12, note.duration / 3)));
  } else {
    const decay = Math.min(note.duration * .85, { tick:.07, thump:.11, bell:.22 }[note.voice]);
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
  } else if (note.voice === 'thump') oscillator('sine',note.frequency,gain,note.cents,note.frequency*2/3,.06);
  else if (note.voice === 'bell') {
    // A struck bar: the fundamental, and the two partials of a free bar (2.76 and 5.4 times it) that ring bright and die away sooner.
    const body = context.createGain(), shine = context.createGain(), ping = context.createGain(); body.gain.value = .6; ping.gain.value = .3;
    shine.gain.setValueAtTime(.2,at); shine.gain.exponentialRampToValueAtTime(.01,at+note.duration*.6);
    body.connect(gain); ping.connect(shine); shine.connect(gain); nodes.push(body,shine,ping);
    oscillator('sine',note.frequency,body); oscillator('sine',note.frequency*2.756,shine); oscillator('sine',note.frequency*5.404,ping);
  }
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
