// Literal repeats: for every lag of a whole number of bars, how much of the track matches the track that many bars
// later at the waveform level (normalised cross-correlation of 2 s windows, ±15 ms of slack). A high score means the
// generator reused the same passage, so a splice inside it is a cut between identical audio.
// Usage: node repeats.mjs <pcm dir>
import { SR, loadF32, onsetEnvelope, trackBeats } from './dsp.mjs';

const dir = process.argv[2];
const TRACKS = { burrow: { bpm: 112.35, first: 0.023 }, square: { bpm: 95.7, first: 0.302 }, feeding: { bpm: 92.29, first: 0.023 }, full: { bpm: 83.35, first: 0.174 } };
const R = 4, rate = SR / R; // work at 11 025 Hz
for (const [name, { bpm }] of Object.entries(TRACKS)) {
  const a = loadF32(`${dir}/${name}.shipped.f32`), n = Math.floor(a.n / R), x = new Float32Array(n);
  for (let i = 0; i < n; i++) { let s = 0; for (let k = 0; k < R; k++) s += a.M[i * R + k]; x[i] = s / R; }
  // the bar from a straight-line fit through the tracked beats: the median interval is quantised to the onset hop
  const beats = trackBeats(onsetEnvelope(a.M), bpm), m = beats.length, mx = (m - 1) / 2, my = beats.reduce((s, v) => s + v, 0) / m;
  let sxy = 0, sxx = 0; beats.forEach((t, i) => { sxy += (i - mx) * (t - my); sxx += (i - mx) ** 2; });
  const bar = 4 * (sxy / sxx) * rate, win = Math.round(2 * rate), slack = Math.round(0.015 * rate);
  const ncc = (p, q) => { let s = 0, ea = 0, eb = 0; for (let k = 0; k < win; k++) { s += x[p + k] * x[q + k]; ea += x[p + k] ** 2; eb += x[q + k] ** 2; } return s / (Math.sqrt(ea * eb) || 1); };
  console.log(`\n== ${name}`);
  const lines = [];
  for (let L = 4; L <= 36; L++) {
    const lag = Math.round(L * bar), hits = [];
    let total = 0, count = 0;
    for (let t = 0; t + lag + win + slack < n; t += Math.round(0.5 * rate)) {
      let best = -1; for (let d = -slack; d <= slack; d += 2) best = Math.max(best, ncc(t, t + lag + d));
      total += best; count++; if (best > 0.6) hits.push(t / rate);
    }
    if (!count) continue;
    // join hits into spans
    const spans = []; for (const t of hits) { const last = spans.at(-1); if (last && t - last[1] <= 0.6) last[1] = t; else spans.push([t, t]); }
    const long = spans.filter(s => s[1] - s[0] >= 3).map(s => `${s[0].toFixed(1)}–${(s[1] + 2).toFixed(1)} s`);
    lines.push(`  ${String(L).padStart(2)} bars (${(lag / rate).toFixed(2)} s): mean ${(total / count).toFixed(3)}, matching ${(100 * hits.length / count).toFixed(0)} %${long.length ? '  spans ' + long.join(', ') : ''}`);
  }
  console.log(lines.join('\n'));
}
