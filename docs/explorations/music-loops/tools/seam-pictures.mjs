// Pictures of a seam, for looking at what a jump does: three spectrogram rows on one time axis, the cut at the same x.
//   1. the file around E, as it was written (what the music did next)
//   2. the file around S (what the jump lands in, with what came before it)
//   3. the spliced result: the file up to E, then from S, with the seam fade
// Usage: node seam-pictures.mjs <pcm dir> <evaluate.json> <out dir>
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { SR, loadF32, wav } from './dsp.mjs';
import { spliceExcerpt, currentExcerpt, SEAM_FADE_S } from './evaluate.mjs';

const [dir, reportPath, out] = process.argv.slice(2), report = JSON.parse(readFileSync(reportPath, 'utf8'));
mkdirSync(out, { recursive: true });
const BEFORE = 4, AFTER = 2.5;
const segment = (a, from, length) => { const L = new Float32Array(length), R = new Float32Array(length); for (let n = 0; n < length; n++) { const i = from + n; if (i >= 0 && i < a.n) { L[n] = a.L[i]; R[n] = a.R[i]; } } return { L, R }; };
function picture(rows, target) {
  const parts = rows.map((row, k) => {
    const w = `${out}/tmp-${k}.wav`, p = `${out}/tmp-${k}.png`;
    writeFileSync(w, wav(row.L, row.R));
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', w, '-lavfi', 'showspectrumpic=s=1300x200:legend=0:scale=log:fscale=log:color=intensity:mode=combined:start=80:stop=8000', p]);
    return p;
  });
  // a red line at the cut, BEFORE seconds into each row
  execFileSync('magick', [...parts, '-append', '-stroke', 'red', '-strokewidth', '1', '-draw', `line ${Math.round(1300 * BEFORE / (BEFORE + AFTER))},0 ${Math.round(1300 * BEFORE / (BEFORE + AFTER))},${200 * rows.length}`, target]);
  parts.forEach(p => rmSync(p)); rows.forEach((_, k) => rmSync(`${out}/tmp-${k}.wav`));
}
for (const [name, { rows }] of Object.entries(report)) {
  const a = loadF32(`${dir}/${name}.shipped.f32`), nb = Math.round(BEFORE * SR), na = Math.round(AFTER * SR);
  // the current seam: the end of the file over the start of the file, and the two-second blend
  const D = a.n, cur = currentExcerpt(a, BEFORE, AFTER);
  picture([segment(a, D - 2 * SR - nb, nb + na), segment(a, -nb, nb + na), cur], `${out}/${name}-current.png`);
  rows.forEach((r, k) => {
    if (r.error) return;
    picture([segment(a, r.E - nb, nb + na), segment(a, r.S - nb, nb + na), spliceExcerpt(a, r.E, r.S, SEAM_FADE_S, BEFORE, AFTER)], `${out}/${name}-${String.fromCharCode(97 + k)}-bar${r.sBar}-${r.eBar}.png`);
  });
  console.log(`${name}: pictures written`);
}
