// Small, dependency-free signal tools for the loop study: decoding through ffmpeg, an FFT, onset strength, tempo,
// a dynamic-programming beat tracker, beat-synchronous chroma and band energy, and waveform alignment.
// Everything works on 44.1 kHz stereo float PCM. Nothing here listens; it measures.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

export const SR = 44100;

/** Decode any file ffmpeg reads into stereo float PCM at 44.1 kHz. ffmpeg trims an MP3's encoder delay from its LAME header. */
export function decode(path) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', String(SR), '-'], { maxBuffer: 1 << 30 });
  return fromInterleaved(new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4));
}
export function loadF32(path) {
  const raw = readFileSync(path);
  return fromInterleaved(new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4));
}
function fromInterleaved(f) {
  const n = f.length / 2, L = new Float32Array(n), R = new Float32Array(n), M = new Float32Array(n);
  for (let i = 0; i < n; i++) { L[i] = f[2 * i]; R[i] = f[2 * i + 1]; M[i] = (L[i] + R[i]) / 2; }
  return { L, R, M, n };
}

/** In-place iterative radix-2 FFT on separate real and imaginary arrays. */
const plans = new Map();
function plan(N) {
  if (plans.has(N)) return plans.get(N);
  const rev = new Uint32Array(N), bits = Math.log2(N);
  for (let i = 0; i < N; i++) { let r = 0; for (let b = 0; b < bits; b++) r |= ((i >> b) & 1) << (bits - 1 - b); rev[i] = r; }
  const cos = new Float64Array(N / 2), sin = new Float64Array(N / 2);
  for (let i = 0; i < N / 2; i++) { cos[i] = Math.cos(-2 * Math.PI * i / N); sin[i] = Math.sin(-2 * Math.PI * i / N); }
  const hann = new Float64Array(N);
  for (let i = 0; i < N; i++) hann[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N);
  const p = { rev, cos, sin, hann };
  plans.set(N, p); return p;
}
export function fft(re, im) {
  const N = re.length, { rev, cos, sin } = plan(N);
  for (let i = 0; i < N; i++) { const j = rev[i]; if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
  for (let size = 2; size <= N; size <<= 1) {
    const half = size >> 1, step = N / size;
    for (let start = 0; start < N; start += size) {
      for (let k = 0; k < half; k++) {
        const wr = cos[k * step], wi = sin[k * step], a = start + k, b = a + half;
        const tr = re[b] * wr - im[b] * wi, ti = re[b] * wi + im[b] * wr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
      }
    }
  }
}

/** Magnitude spectrogram of a mono signal: frames[t] is a Float32Array of N/2 + 1 magnitudes, frame t centred at t * hop. */
export function stft(x, N, hop) {
  const { hann } = plan(N), frames = [], count = Math.floor(x.length / hop);
  const re = new Float64Array(N), im = new Float64Array(N);
  for (let t = 0; t < count; t++) {
    const centre = t * hop;
    for (let i = 0; i < N; i++) { const at = centre - N / 2 + i; re[i] = (at >= 0 && at < x.length ? x[at] : 0) * hann[i]; im[i] = 0; }
    fft(re, im);
    const mag = new Float32Array(N / 2 + 1);
    for (let k = 0; k <= N / 2; k++) mag[k] = Math.hypot(re[k], im[k]);
    frames.push(mag);
  }
  return frames;
}

/** Onset strength: log-magnitude spectral flux between 30 Hz and 8 kHz, local mean removed, half-wave rectified. */
export function onsetEnvelope(x, N = 2048, hop = 512) {
  const frames = stft(x, N, hop), lo = Math.floor(30 * N / SR), hi = Math.ceil(8000 * N / SR);
  const env = new Float32Array(frames.length);
  let prev = null;
  for (let t = 0; t < frames.length; t++) {
    const log = new Float32Array(hi - lo);
    for (let k = lo; k < hi; k++) log[k - lo] = Math.log1p(1000 * frames[t][k]);
    if (prev) { let flux = 0; for (let k = 0; k < log.length; k++) { const d = log[k] - prev[k]; if (d > 0) flux += d; } env[t] = flux; }
    prev = log;
  }
  const w = Math.round(0.4 * SR / hop), out = new Float32Array(env.length);
  for (let t = 0; t < env.length; t++) {
    let sum = 0, n = 0;
    for (let k = Math.max(0, t - w); k <= Math.min(env.length - 1, t + w); k++) { sum += env[k]; n++; }
    out[t] = Math.max(0, env[t] - sum / n);
  }
  let max = 0; for (const v of out) max = Math.max(max, v);
  for (let t = 0; t < out.length; t++) out[t] /= max || 1;
  return { env: out, hop, rate: SR / hop };
}

/** Tempo candidates from the autocorrelation of the onset envelope, weighted towards a prior tempo (the prompt's). */
export function tempo(onset, priorBpm, range = [50, 220]) {
  const { env, rate } = onset, results = [];
  const minLag = Math.floor(60 * rate / range[1]), maxLag = Math.ceil(60 * rate / range[0]);
  const ac = new Float64Array(maxLag + 2);
  for (let lag = minLag - 1; lag <= maxLag + 1; lag++) { let s = 0; for (let t = lag; t < env.length; t++) s += env[t] * env[t - lag]; ac[lag] = s / (env.length - lag); }
  for (let lag = minLag; lag <= maxLag; lag++) {
    if (ac[lag] > ac[lag - 1] && ac[lag] >= ac[lag + 1]) {
      const a = ac[lag - 1], b = ac[lag], c = ac[lag + 1], shift = 0.5 * (a - c) / (a - 2 * b + c || 1);
      const bpm = 60 * rate / (lag + shift), weight = Math.exp(-0.5 * (Math.log2(bpm / priorBpm) / 0.5) ** 2);
      results.push({ bpm, strength: b, score: b * weight });
    }
  }
  return results.sort((p, q) => q.score - p.score).slice(0, 6);
}

/** Dan Ellis's dynamic-programming beat tracker (2007) on the onset envelope, for a fixed tempo. Returns beat times in seconds. */
export function trackBeats(onset, bpm, tightness = 400) {
  const { env, rate } = onset, period = 60 * rate / bpm, n = env.length;
  const sigma = period / 32, half = Math.ceil(4 * sigma), kernel = [];
  for (let i = -half; i <= half; i++) kernel.push(Math.exp(-0.5 * (i / sigma) ** 2));
  const local = new Float64Array(n);
  for (let t = 0; t < n; t++) { let s = 0; for (let i = -half; i <= half; i++) { const at = t + i; if (at >= 0 && at < n) s += env[at] * kernel[i + half]; } local[t] = s; }
  const score = new Float64Array(n), back = new Int32Array(n).fill(-1);
  for (let t = 0; t < n; t++) {
    let best = -Infinity, arg = -1;
    for (let prev = Math.round(t - 2 * period); prev <= Math.round(t - period / 2); prev++) {
      if (prev < 0) continue;
      const v = score[prev] - tightness * Math.log((t - prev) / period) ** 2;
      if (v > best) { best = v; arg = prev; }
    }
    score[t] = local[t] + (arg >= 0 ? best : 0); back[t] = arg;
  }
  let end = n - 1, best = -Infinity;
  for (let t = Math.max(0, Math.floor(n - period)); t < n; t++) if (score[t] > best) { best = score[t]; end = t; }
  const beats = [];
  for (let t = end; t >= 0; t = back[t]) beats.push(t / rate);
  return beats.reverse();
}

/** Chroma (12 pitch classes from C) and 16 log-spaced band energies, from an 8192-point STFT, averaged between beat times. */
export function beatFeatures(x, beats, N = 8192, hop = 1024) {
  const frames = stft(x, N, hop), rate = SR / hop;
  const pc = new Int8Array(N / 2 + 1).fill(-1), band = new Int8Array(N / 2 + 1).fill(-1);
  for (let k = 1; k <= N / 2; k++) {
    const f = k * SR / N;
    if (f >= 80 && f <= 5000) pc[k] = ((Math.round(12 * Math.log2(f / 261.6256)) % 12) + 12) % 12;
    if (f >= 40 && f <= 16000) band[k] = Math.min(15, Math.floor(16 * Math.log2(f / 40) / Math.log2(16000 / 40)));
  }
  const frameFeatures = frames.map(mag => {
    const c = new Float64Array(12), b = new Float64Array(16);
    for (let k = 1; k < mag.length; k++) { const p = mag[k] * mag[k]; if (pc[k] >= 0) c[pc[k]] += p; if (band[k] >= 0) b[band[k]] += p; }
    return { c, b };
  });
  const out = [];
  for (let i = 0; i + 1 < beats.length; i++) {
    const a = Math.floor(beats[i] * rate), z = Math.max(a + 1, Math.floor(beats[i + 1] * rate));
    const c = new Float64Array(12), b = new Float64Array(16);
    for (let t = a; t < z && t < frameFeatures.length; t++) { for (let k = 0; k < 12; k++) c[k] += frameFeatures[t].c[k]; for (let k = 0; k < 16; k++) b[k] += frameFeatures[t].b[k]; }
    const cn = Math.hypot(...c) || 1, chroma = Array.from(c, v => v / cn);
    const bands = Array.from(b, v => 10 * Math.log10(v / (z - a) + 1e-12));
    out.push({ t: beats[i], chroma, bands, energy: 10 * Math.log10(b.reduce((s, v) => s + v, 0) / (z - a) + 1e-12) });
  }
  return out;
}

export const cosine = (a, b) => { let s = 0, na = 0, nb = 0; for (let i = 0; i < a.length; i++) { s += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; } return s / (Math.sqrt(na * nb) || 1); };
export const correlation = (a, b) => {
  const n = a.length, ma = a.reduce((s, v) => s + v, 0) / n, mb = b.reduce((s, v) => s + v, 0) / n;
  let s = 0, va = 0, vb = 0; for (let i = 0; i < n; i++) { s += (a[i] - ma) * (b[i] - mb); va += (a[i] - ma) ** 2; vb += (b[i] - mb) ** 2; }
  return s / (Math.sqrt(va * vb) || 1);
};

/** Root-mean-square level in dBFS of a window of a channel. */
export function rmsDb(x, start, length) {
  let s = 0; const a = Math.max(0, start), z = Math.min(x.length, start + length);
  for (let i = a; i < z; i++) s += x[i] * x[i];
  return 10 * Math.log10(s / Math.max(1, z - a) + 1e-20);
}

/**
 * Best lag d (in samples, within ±maxLag) so that x[b + d + n] matches x[a + n] over n in [-win, win): normalised
 * cross-correlation on the mid channel, coarse on a decimated signal then refined at full rate.
 */
export function align(x, a, b, win, maxLag) {
  const ncc = d => { let s = 0, ea = 0, eb = 0; for (let n = -win; n < win; n++) { const p = x[a + n], q = x[b + d + n]; s += p * q; ea += p * p; eb += q * q; } return s / (Math.sqrt(ea * eb) || 1); };
  let best = -2, arg = 0;
  for (let d = -maxLag; d <= maxLag; d += 8) { const v = ncc(d); if (v > best) { best = v; arg = d; } }
  for (let d = arg - 8; d <= arg + 8; d++) { const v = ncc(d); if (v > best) { best = v; arg = d; } }
  return { lag: arg, ncc: best };
}

/** Write stereo float PCM to a 16-bit WAV file's bytes. */
export function wav(L, R) {
  const n = L.length, buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(L[i] * 32767))), 44 + i * 4);
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(R[i] * 32767))), 46 + i * 4);
  }
  return buf;
}
