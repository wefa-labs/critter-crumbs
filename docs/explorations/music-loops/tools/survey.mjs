// First look at each loop: tempo, beat grid, level at the edges, and what the current two-second overlap lays on top
// of what. Usage: node survey.mjs <pcm dir>   (expects <track>.shipped.f32 and <track>.take.f32 from ffmpeg)
import { SR, loadF32, onsetEnvelope, tempo, trackBeats, beatFeatures, cosine, rmsDb } from './dsp.mjs';

const dir = process.argv[2];
const TRACKS = { burrow: 112, square: 96, feeding: 92, full: 84 }; // the prompts' tempos, used only as a prior
const median = values => { const s = [...values].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

for (const [name, prior] of Object.entries(TRACKS)) {
  const audio = loadF32(`${dir}/${name}.shipped.f32`), D = audio.n / SR;
  const onset = onsetEnvelope(audio.M);
  const candidates = tempo(onset, prior);
  const bpm = candidates[0].bpm, beats = trackBeats(onset, bpm);
  const intervals = beats.slice(1).map((t, i) => t - beats[i]);
  const period = median(intervals);
  console.log(`\n== ${name}: ${D.toFixed(3)} s, ${audio.n} frames`);
  console.log(`tempo candidates: ${candidates.map(c => `${c.bpm.toFixed(1)} (${c.strength.toFixed(4)})`).join(', ')}`);
  console.log(`beats: ${beats.length}, first ${beats[0].toFixed(3)} s, last ${beats.at(-1).toFixed(3)} s, median interval ${(period * 1000).toFixed(1)} ms = ${(60 / period).toFixed(2)} bpm, spread ${(Math.max(...intervals) * 1000).toFixed(0)}/${(Math.min(...intervals) * 1000).toFixed(0)} ms`);
  // Level at the edges, 400 ms windows.
  const levels = (from, to) => { const out = []; for (let t = from; t < to - 0.39; t += 0.4) out.push(rmsDb(audio.M, Math.round(t * SR), Math.round(0.4 * SR)).toFixed(0)); return out.join(' '); };
  console.log(`level first 4 s (dBFS per 0.4 s): ${levels(0, 4)}`);
  console.log(`level last 4 s:  ${levels(D - 4, D)}`);
  console.log(`body level (10–60 s): ${rmsDb(audio.M, 10 * SR, 50 * SR).toFixed(1)} dBFS`);
  // The current seam: the next pass starts 2 s before this one ends, so file time 0 sounds at D − 2.
  const overlap = 2, offset = D - overlap;
  const endBeats = beats.filter(t => t > D - overlap - 0.01), startBeats = beats.filter(t => t < overlap + 0.01).map(t => t + offset);
  const phase = startBeats.map(t => { const near = endBeats.reduce((best, b) => Math.abs(b - t) < Math.abs(best - t) ? b : best, Infinity); return ((t - near) * 1000).toFixed(0); });
  console.log(`seam: next pass's beats against this pass's beats inside the overlap (ms): ${phase.join(', ') || 'none'}`);
  const feats = beatFeatures(audio.M, beats);
  const window = (from, to) => { const c = new Array(12).fill(0); for (const f of feats) if (f.t >= from && f.t < to) for (let k = 0; k < 12; k++) c[k] += f.chroma[k]; return c; };
  const names = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const top = c => c.map((v, k) => [v, names[k]]).sort((a, b) => b[0] - a[0]).slice(0, 4).map(p => p[1]).join(' ');
  const endC = window(D - overlap, D), startC = window(0, overlap);
  console.log(`harmony, last 2 s: ${top(endC)}; first 2 s: ${top(startC)}; chroma similarity ${cosine(endC, startC).toFixed(3)}`);
  console.log(`level, last 2 s ${rmsDb(audio.M, Math.round((D - 2) * SR), 2 * SR).toFixed(1)} dBFS; first 2 s ${rmsDb(audio.M, 0, 2 * SR).toFixed(1)} dBFS`);
}
