// Section boundaries: Foote's checkerboard novelty over the beat-level self-similarity matrix (a semitone spectrum and
// chroma), with a four-bar kernel. Prints each beat's bar position and the novelty peaks, plus the level per bar.
// Usage: node sections.mjs <pcm dir> <track> <downbeat phase>
import { SR, loadF32, onsetEnvelope, trackBeats, stft, cosine, correlation, rmsDb } from './dsp.mjs';

const [dir, name, phaseArg] = process.argv.slice(2);
const BPM = { burrow: 112.35, square: 95.7, feeding: 92.29, full: 83.35 }[name];
const audio = loadF32(`${dir}/${name}.shipped.f32`), beats = trackBeats(onsetEnvelope(audio.M), BPM);
const N = 8192, hop = 1024, frames = stft(audio.M, N, hop), rate = SR / hop;
const feats = beats.slice(0, -1).map((t, i) => {
  const a = Math.floor(t * rate), z = Math.max(a + 1, Math.floor(beats[i + 1] * rate)), spec = new Float64Array(72), chroma = new Array(12).fill(0);
  for (let f = a; f < z && f < frames.length; f++) for (let k = 1; k < frames[f].length; k++) { const fr = k * SR / N, m = Math.round(12 * Math.log2(fr / 65.406)); if (m >= 0 && m < 72) { const p = frames[f][k] ** 2; spec[m] += p; chroma[m % 12] += p; } }
  return { t, log: Array.from(spec, v => Math.log10(v + 1e-9)), chroma };
});
const B = feats.length, S = (a, b) => 0.5 * correlation(feats[a].log, feats[b].log) + 0.5 * cosine(feats[a].chroma, feats[b].chroma);
const K = 16, novelty = new Array(B).fill(0);
for (let c = K; c < B - K; c++) {
  let v = 0;
  for (let a = -K; a < K; a++) for (let b = -K; b < K; b++) { const sign = (a < 0) === (b < 0) ? 1 : -1, w = Math.exp(-0.5 * ((a + 0.5) ** 2 + (b + 0.5) ** 2) / (K * 0.6) ** 2); v += sign * w * S(c + a, c + b); }
  novelty[c] = v;
}
const max = Math.max(...novelty);
const phase = Number(phaseArg ?? 0);
console.log(`${name}: ${B} beats; bars from beat ${phase}`);
const peaks = [];
for (let c = 1; c < B - 1; c++) if (novelty[c] > novelty[c - 1] && novelty[c] >= novelty[c + 1] && novelty[c] > 0.35 * max) peaks.push(c);
console.log('novelty peaks: ' + peaks.map(c => `beat ${c} (${feats[c].t.toFixed(2)} s, bar ${Math.floor((c - phase) / 4) + 1} beat ${((c - phase) % 4 + 4) % 4 + 1}, ${(novelty[c] / max).toFixed(2)})`).join('; '));
const bars = [];
for (let b = phase; b + 4 <= B; b += 4) {
  const t = feats[b].t, level = rmsDb(audio.M, Math.round(t * SR), Math.round(4 * 60 / BPM * SR));
  const nv = Math.max(...novelty.slice(Math.max(0, b - 1), b + 2)) / max;
  bars.push(`${String((b - phase) / 4 + 1).padStart(2)} ${t.toFixed(2).padStart(6)}s ${level.toFixed(1).padStart(6)}dB ${'#'.repeat(Math.max(0, Math.round(nv * 20)))}`);
}
console.log(bars.join('\n'));
