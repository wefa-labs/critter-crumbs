/**
 * A recording stand-in for the Web Audio nodes the sound code schedules on. It keeps what was asked of it (starts,
 * stops, gain events, connections) and makes no sound; the browser's own DSP is measured in tests/e2e/audio.spec.ts.
 */
export interface FakeParam { value: number; events: { kind: string; value?: number; at: number; span?: number }[] }
export interface FakeNode { kind: string; gain: FakeParam; outputs: FakeNode[] }
export interface FakeSource extends FakeNode { buffer: AudioBuffer | null; startedAt: number | null; stoppedAt: number | null; onended: (() => void) | null }

function param(value: number): FakeParam {
  const events: FakeParam['events'] = [];
  const add = (kind: string) => (target: number, at: number, span?: number) => { events.push({ kind, value: target, at, ...(span === undefined ? {} : { span }) }); };
  return Object.assign({ value, events }, {
    setValueAtTime: add('set'), linearRampToValueAtTime: add('ramp'), exponentialRampToValueAtTime: add('exponential'), setTargetAtTime: add('target'),
    setValueCurveAtTime(curve: Float32Array, at: number, span: number) { events.push({ kind: curve[0]! < curve[curve.length - 1]! ? 'rise' : 'fall', at, span }); },
    cancelScheduledValues(at: number) { for (let i = events.length - 1; i >= 0; i--) if (events[i]!.at >= at) events.splice(i, 1); },
  });
}
function node(kind: string) {
  const self = {
    kind, gain: param(1), outputs: [] as FakeNode[],
    connect(to: FakeNode) { self.outputs.push(to); },
    disconnect() { self.outputs.length = 0; },
  };
  return self;
}
function source(kind: string) {
  const self = Object.assign(node(kind), {
    buffer: null as AudioBuffer | null, startedAt: null as number | null, stoppedAt: null as number | null, onended: null as (() => void) | null,
    frequency: param(440), detune: param(0), type: 'sine', loop: false,
    start(at: number) { self.startedAt = at; },
    stop(at: number) { self.stoppedAt = at; },
  });
  return self;
}

export function fakeAudio() {
  const sources: FakeSource[] = [], oscillators: FakeSource[] = [];
  const context = {
    currentTime: 0, sampleRate: 48000, destination: node('destination'),
    createGain: () => node('gain'),
    createDynamicsCompressor: () => Object.assign(node('compressor'), { threshold: param(-24), knee: param(30), ratio: param(12), attack: param(.003), release: param(.25) }),
    createBiquadFilter: () => Object.assign(node('filter'), { frequency: param(350), Q: param(1), type: 'lowpass' }),
    createBuffer: (_channels: number, length: number, rate: number) => ({ duration: length / rate, getChannelData: () => new Float32Array(length) }),
    createOscillator() { const made = source('oscillator'); oscillators.push(made); return made; },
    createConstantSource: () => Object.assign(source('constant'), { offset: param(1) }),
    createBufferSource() { const made = source('source'); sources.push(made); return made; },
  };
  const endOf = (made: FakeSource) => Math.min(made.stoppedAt ?? Infinity, (made.startedAt ?? Infinity) + (made.buffer?.duration ?? Infinity));
  return {
    context: context as unknown as BaseAudioContext, sources, oscillators,
    /** The recorded sounds asked to play: every buffer source holding this buffer. */
    playing: (buffer: AudioBuffer) => sources.filter(made => made.buffer === buffer),
    /** Moves the audio clock on and ends every source whose time has passed, as the browser would. */
    advance(to: number) { context.currentTime = to; for (const made of [...sources, ...oscillators]) if (made.onended && endOf(made) <= to) { const ended = made.onended; made.onended = null; ended(); } },
  };
}
export const fakeBuffer = (duration: number) => ({ duration }) as unknown as AudioBuffer;
/** The node a signal reaches after `hops` connections. */
export const downstream = (from: FakeNode, hops = 1): FakeNode => hops ? downstream(from.outputs[0]!, hops - 1) : from;
