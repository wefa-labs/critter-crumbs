// Bar-aligned splice candidates, ranked. A loop plays the file from its start to E, then jumps back to S and
// repeats S..E. Both points sit on downbeats a whole number of bars apart. For each pair this measures:
//   context  similarity of the two bars before and after S and E (harmony, a semitone spectrum, level)
//   ncc      normalised cross-correlation of the waveform around the points, after aligning S to the sample
//   residual energy of (audio around E) − (aligned audio around S), relative to the audio, over ±0.3 s (lower is closer)
//   tail     level of the half second before S minus the half second before E (what the jump cuts off vs what it lands in)
//   step     level of the two seconds after S minus the two seconds before E
// Usage: node splices.mjs <pcm dir> [track] [--json out.json]
import { writeFileSync } from 'node:fs';
import { SR, loadF32, onsetEnvelope, trackBeats, stft, cosine, correlation, align, rmsDb } from './dsp.mjs';

const args = process.argv.slice(2), dir = args[0], only = args[1] && !args[1].startsWith('--') ? args[1] : null;
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
export const TRACKS = { burrow: { bpm: 112.35, down: 0 }, square: { bpm: 95.7, down: 3 }, feeding: { bpm: 92.29, down: 0 }, full: { bpm: 83.35, down: 0 } };

/** A semitone spectrum (C2–B7, 72 bins) and chroma per beat. */
function semitoneFeatures(x, beats) {
  const N = 8192, hop = 1024, frames = stft(x, N, hop), rate = SR / hop, bin = new Int16Array(N / 2 + 1).fill(-1);
  for (let k = 1; k <= N / 2; k++) { const f = k * SR / N, m = Math.round(12 * Math.log2(f / 65.406)); if (m >= 0 && m < 72) bin[k] = m; }
  return beats.slice(0, -1).map((t, i) => {
    const a = Math.floor(t * rate), z = Math.max(a + 1, Math.floor(beats[i + 1] * rate)), spec = new Float64Array(72);
    for (let f = a; f < z && f < frames.length; f++) { const mag = frames[f]; for (let k = 1; k < mag.length; k++) if (bin[k] >= 0) spec[bin[k]] += mag[k] * mag[k]; }
    const log = Array.from(spec, v => Math.log10(v / (z - a) + 1e-9)), chroma = new Array(12).fill(0);
    spec.forEach((v, m) => { chroma[m % 12] += v; });
    return { t, log, chroma, level: 10 * Math.log10(spec.reduce((s, v) => s + v, 0) / (z - a) + 1e-12) };
  });
}

export function analyse(name, audio) {
  const { bpm, down } = TRACKS[name], D = audio.n / SR, beat = 60 / bpm;
  const beats = trackBeats(onsetEnvelope(audio.M), bpm), feats = semitoneFeatures(audio.M, beats), B = feats.length;
  const sim = (a, b) => a < 0 || b < 0 || a >= B || b >= B ? 0 : 0.45 * correlation(feats[a].log, feats[b].log) + 0.35 * cosine(feats[a].chroma, feats[b].chroma) + 0.2 * Math.exp(-Math.abs(feats[a].level - feats[b].level) / 3);
  const downbeats = []; for (let b = down; b < B; b += 4) downbeats.push(b);
  const W = 8, minLoopBeats = Math.round(0.38 * D / beat), pairs = [];
  for (const i of downbeats) {
    if (feats[i].t > 0.5 * D) break;
    for (const j of downbeats) {
      if (j - i < minLoopBeats || j + W > B) continue;
      let before = 0, after = 0; for (let w = 1; w <= W; w++) { before += sim(i - w, j - w); after += sim(i + w - 1, j + w - 1); }
      pairs.push({ i, j, before: before / W, after: after / W, context: (before + after) / (2 * W) });
    }
  }
  pairs.sort((a, b) => b.context - a.context);
  const rated = pairs.slice(0, 48).map(p => {
    const E = Math.round(beats[p.j] * SR), S0 = Math.round(beats[p.i] * SR);
    const fine = align(audio.M, E, S0, Math.round(0.6 * SR), Math.round(0.03 * SR)), S = S0 + fine.lag;
    let diff = 0, ref = 0; for (let n = -Math.round(0.3 * SR); n < Math.round(0.3 * SR); n++) { const e = audio.M[E + n] ?? 0, s = audio.M[S + n] ?? 0; diff += (e - s) ** 2; ref += e * e; }
    return { ...p, S, E, ncc: fine.ncc, residual: 10 * Math.log10(diff / (ref || 1)), tail: rmsDb(audio.M, S - SR / 2, SR / 2) - rmsDb(audio.M, E - SR / 2, SR / 2), step: rmsDb(audio.M, S, 2 * SR) - rmsDb(audio.M, E - 2 * SR, 2 * SR), bars: (p.j - p.i) / 4, loopS: (E - S) / SR };
  });
  rated.forEach(r => { r.rank = r.context + 0.6 * r.ncc - 0.02 * Math.max(0, r.residual) - 0.03 * Math.abs(r.step) - 0.02 * Math.max(0, -r.tail - 3) + 0.002 * r.bars; });
  rated.sort((a, b) => b.rank - a.rank);
  return { D, bpm, beat, down, beats, rated };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const all = {};
  for (const name of Object.keys(TRACKS)) {
    if (only && only !== name) continue;
    const audio = loadF32(`${dir}/${name}.shipped.f32`), r = analyse(name, audio);
    all[name] = { D: r.D, bpm: r.bpm, beats: r.beats, rated: r.rated.slice(0, 10) };
    console.log(`\n== ${name}  ${r.D.toFixed(2)} s  ${r.bpm} bpm (bar ${(4 * r.beat).toFixed(3)} s)`);
    for (const c of r.rated.slice(0, 10)) console.log(`  S ${(c.S / SR).toFixed(3)} (bar ${(c.i - r.down) / 4 + 1})  E ${(c.E / SR).toFixed(3)} (bar ${(c.j - r.down) / 4 + 1})  ${c.bars} bars ${c.loopS.toFixed(2)} s | context ${c.context.toFixed(3)} (b ${c.before.toFixed(2)} a ${c.after.toFixed(2)}) ncc ${c.ncc.toFixed(3)} residual ${c.residual.toFixed(1)} dB tail ${c.tail.toFixed(1)} dB step ${c.step.toFixed(1)} dB`);
  }
  if (jsonOut) writeFileSync(jsonOut, JSON.stringify(all));
}
