// Searches each track for bar-aligned loop points: a start S after the opening and an end E near the end of the
// full-bodied music, a whole number of bars apart, where the music before and after S matches the music before and
// after E. Then aligns the two points to the sample by cross-correlating the waveform.
// Usage: node loops.mjs <pcm dir> [track]   prints candidates as JSON lines and a summary.
import { SR, loadF32, onsetEnvelope, trackBeats, beatFeatures, cosine, correlation, align, rmsDb } from './dsp.mjs';

const dir = process.argv[2], only = process.argv[3];
const TRACKS = { burrow: 112.35, square: 95.7, feeding: 92.29, full: 83.35 };
const results = {};

for (const [name, bpm] of Object.entries(TRACKS)) {
  if (only && only !== name) continue;
  const audio = loadF32(`${dir}/${name}.shipped.f32`), D = audio.n / SR;
  const onset = onsetEnvelope(audio.M), beats = trackBeats(onset, bpm);
  const feats = beatFeatures(audio.M, beats), B = feats.length;
  // Per-track standardised band profiles so timbre counts as much as harmony.
  const sim = (a, b) => {
    const fa = feats[a], fb = feats[b];
    return 0.5 * cosine(fa.chroma, fb.chroma) + 0.3 * correlation(fa.bands, fb.bands) + 0.2 * Math.exp(-Math.abs(fa.energy - fb.energy) / 3);
  };
  // Downbeat phase: harmony changes most often on the first beat of a bar.
  const novelty = feats.map((_, b) => b < 2 || b + 2 > B ? 0 : 1 - cosine(feats[b - 2].chroma.map((v, k) => v + feats[b - 1].chroma[k]), feats[b].chroma.map((v, k) => v + feats[b + 1].chroma[k])));
  const phaseScore = [0, 1, 2, 3].map(p => { let n = 0, s = 0; for (let b = p; b < B; b += 4) { s += novelty[b]; n++; } return s / n; });
  const downPhase = phaseScore.indexOf(Math.max(...phaseScore));
  const W = 8; // two bars of context either side
  const candidates = [];
  const minLoop = Math.max(32, Math.round((D * 0.45) / (60 / bpm)));
  for (let i = W; i < B * 0.35; i++) {
    for (let j = i + minLoop; j + W < B; j++) {
      if ((j - i) % 4) continue;
      let s = 0; for (let w = -W; w < W; w++) s += sim(i + w, j + w);
      const before = (() => { let v = 0; for (let w = -W; w < 0; w++) v += sim(i + w, j + w); return v / W; })();
      const after = (() => { let v = 0; for (let w = 0; w < W; w++) v += sim(i + w, j + w); return v / W; })();
      candidates.push({ i, j, score: s / (2 * W), before, after, bars: (j - i) / 4, onDownbeat: (i - downPhase) % 4 === 0 });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  // Keep the best few distinct candidates, then align each at the sample level.
  const picked = [];
  for (const c of candidates) {
    if (picked.length >= 12) break;
    if (picked.some(p => Math.abs(p.i - c.i) < 4 && Math.abs(p.j - c.j) < 4)) continue;
    picked.push(c);
  }
  for (const c of picked) {
    const S = Math.round(beats[c.i] * SR), E = Math.round(beats[c.j] * SR);
    const fine = align(audio.M, E, S, Math.round(0.75 * SR), Math.round(0.03 * SR));
    c.start = S + fine.lag; c.end = E; c.ncc = fine.ncc;
    c.startS = c.start / SR; c.endS = c.end / SR; c.loopS = (c.end - c.start) / SR;
    c.levelStep = rmsDb(audio.M, c.start, SR) - rmsDb(audio.M, c.end, SR);
  }
  picked.sort((a, b) => (b.score + b.ncc) - (a.score + a.ncc));
  results[name] = { D, bpm, beats: beats.length, downPhase, phaseScore, picked };
  console.log(`\n== ${name}: ${D.toFixed(2)} s, ${bpm} bpm, ${B} beats, downbeat phase ${downPhase} (${phaseScore.map(v => v.toFixed(3)).join(' ')})`);
  for (const c of picked) console.log(`  S ${c.startS.toFixed(3)} s (beat ${c.i}${c.onDownbeat ? ', downbeat' : ''})  E ${c.endS.toFixed(3)} s (beat ${c.j})  ${c.bars} bars  ${c.loopS.toFixed(2)} s  context ${c.score.toFixed(3)} (before ${c.before.toFixed(3)}, after ${c.after.toFixed(3)})  waveform ${c.ncc.toFixed(3)}  level step ${c.levelStep.toFixed(1)} dB`);
}
if (process.argv.includes('--json')) console.log(JSON.stringify(results));
