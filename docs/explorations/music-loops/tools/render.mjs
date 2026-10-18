// Renders the auditions: each loop as the app plays it today (four passes overlapped by two seconds, sine up and
// cosine down) and as proposed (the file to E, then S..E three more times, joined by a short equal-gain fade just
// before E's downbeat). Checks every seam for a click and a level step, and writes a manifest for the audition page.
// Usage: node render.mjs <pcm dir> <evaluate.json> <out dir>
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { SR, loadF32, wav, rmsDb } from './dsp.mjs';

const [dir, reportPath, out] = process.argv.slice(2), report = JSON.parse(readFileSync(reportPath, 'utf8'));
mkdirSync(out, { recursive: true });
/** The choices: a primary loop and an alternative for each track, with the fade at the seam. */
export const CHOICES = {
  feeding: [{ id: 'proposed', bars: [7, 28], fadeMs: 30 }, { id: 'alternative', bars: [5, 26], fadeMs: 30 }],
  burrow: [{ id: 'proposed', bars: [17, 33], fadeMs: 60 }, { id: 'alternative', bars: [21, 37], fadeMs: 60 }],
  square: [{ id: 'proposed', bars: [9, 33], fadeMs: 60 }, { id: 'alternative', bars: [7, 31], fadeMs: 60 }],
  full: [{ id: 'proposed', bars: [5, 17], fadeMs: 120 }, { id: 'alternative', bars: [6, 18], fadeMs: 120 }],
};
const REPEATS = 3;

function current(a, passes = REPEATS + 1, overlap = 2) {
  const O = Math.round(overlap * SR), step = a.n - O, total = a.n + (passes - 1) * step, L = new Float32Array(total), R = new Float32Array(total), seams = [];
  for (let p = 0; p < passes; p++) {
    const at = p * step; if (p) seams.push((at + O / 2) / SR);
    for (let i = 0; i < a.n; i++) {
      let g = 1;
      if (p && i < O) g = Math.sin(Math.PI / 2 * i / O);
      if (i >= a.n - O && p < passes - 1) g *= Math.cos(Math.PI / 2 * (i - (a.n - O)) / O);
      L[at + i] += a.L[i] * g; R[at + i] += a.R[i] * g;
    }
  }
  return { L, R, seams };
}
function proposed(a, S, E, fadeMs, repeats = REPEATS) {
  const F = Math.round(fadeMs / 1000 * SR), loop = E - S, total = E + repeats * loop + F, L = new Float32Array(total), R = new Float32Array(total), seams = [];
  const fadeOut = i => 0.5 + 0.5 * Math.cos(Math.PI * i / F); // 1 → 0 over F, equal gain with 1 − it
  // pass 0: the file from 0 to E, fading out over the last F frames
  for (let i = 0; i < E; i++) { const g = i >= E - F ? fadeOut(i - (E - F)) : 1; L[i] += a.L[i] * g; R[i] += a.R[i] * g; }
  for (let p = 1; p <= repeats; p++) {
    const at = E - F + (p - 1) * loop; seams.push((at + F) / SR); // output time where the pass reaches S
    for (let i = S - F; i < E; i++) {
      const o = at + (i - (S - F)); let g = 1;
      if (i < S) g = 1 - fadeOut(i - (S - F));
      if (i >= E - F && p < repeats) g *= fadeOut(i - (E - F));
      L[o] += a.L[i] * g; R[o] += a.R[i] * g;
    }
  }
  return { L, R, seams };
}
/** A click shows as a spike in the second difference; compare the seam's ±15 ms with the 99.9th percentile of ±2 s around it. */
function clickRatio(x, at) {
  const c = Math.round(at * SR), d2 = i => Math.abs(x[i + 1] - 2 * x[i] + x[i - 1]);
  const around = []; for (let i = c - 2 * SR; i < c + 2 * SR; i += 3) if (Math.abs(i - c) > 0.05 * SR && i > 1 && i < x.length - 1) around.push(d2(i));
  around.sort((p, q) => p - q);
  let peak = 0; for (let i = c - Math.round(0.015 * SR); i < c + Math.round(0.015 * SR); i++) peak = Math.max(peak, d2(i));
  return peak / (around[Math.floor(around.length * 0.999)] || 1);
}
function encode(track, name) {
  const w = `${out}/${name}.wav`, m = `${out}/${name}.mp3`;
  writeFileSync(w, wav(track.L, track.R));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', w, '-c:a', 'libmp3lame', '-q:a', '2', '-id3v2_version', '0', '-map_metadata', '-1', m]);
  rmSync(w); return m.split('/').pop();
}
const manifest = {};
for (const [name, choices] of Object.entries(CHOICES)) {
  const a = loadF32(`${dir}/${name}.shipped.f32`), rows = report[name].rows, entry = manifest[name] = { frames: a.n, seconds: a.n / SR, versions: [] };
  const cur = current(a);
  entry.versions.push({ id: 'current', file: encode(cur, `${name}-current-x${REPEATS + 1}`), seams: cur.seams, checks: cur.seams.map(t => ({ t, click: clickRatio(cur.L, t), stepDb: rmsDb(cur.L, Math.round(t * SR), 2 * SR) - rmsDb(cur.L, Math.round((t - 2) * SR), 2 * SR) })) });
  for (const choice of choices) {
    const r = rows.find(row => row.sBar === choice.bars[0] && row.eBar === choice.bars[1]);
    const v = proposed(a, r.S, r.E, choice.fadeMs);
    entry.versions.push({ id: choice.id, bars: choice.bars, S: r.S, E: r.E, startS: r.S / SR, endS: r.E / SR, loopS: (r.E - r.S) / SR, fadeMs: choice.fadeMs, fadeFrames: Math.round(choice.fadeMs / 1000 * SR), ncc: r.ncc,
      file: encode(v, `${name}-${choice.id}-bars${choice.bars[0]}-${choice.bars[1]}-x${REPEATS + 1}`), seams: v.seams,
      checks: v.seams.map(t => ({ t, click: clickRatio(v.L, t), stepDb: rmsDb(v.L, Math.round(t * SR), 2 * SR) - rmsDb(v.L, Math.round((t - 2) * SR), 2 * SR) })) });
  }
  for (const v of entry.versions) console.log(`${name} ${v.id.padEnd(11)} ${v.file}  seams ${v.seams.map(t => t.toFixed(2)).join(', ')}  click ×${v.checks.map(c => c.click.toFixed(2)).join(' ')}  step ${v.checks.map(c => c.stepDb.toFixed(1)).join(' ')} dB`);
}
writeFileSync(`${out}/manifest.json`, JSON.stringify(manifest, null, 1));
