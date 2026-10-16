// Checks the seams of the rendered auditions. Measured on the decoded MP3 files where noted.
//   grid    how far the next pass's beat grid sits from the playing pass's, in ms: the jump length minus the nearest
//           whole number of beats, on the beat period fitted to each track (today's jump is the file length minus the
//           2 s overlap; a proposed jump is E − S). Today's offset is also where the next pass's beats fall during the blend.
//   bar     where the next pass's first downbeat lands in the playing pass's bar (1 = on the downbeat)
//   level   loudness (RMS) of the 3 s after the seam minus the 3 s before, measured on the rendered file; for today's
//           seams the windows skip the 2 s blend
//   click   the sharpest sample-to-sample change in the proposed fade window against the 99.9th percentile of the 4 s
//           around it, measured on the rendered file (below 1: nothing sharper than the music itself)
// Usage: node verify.mjs <auditions dir>
import { readFileSync, writeFileSync } from 'node:fs';
import { SR, decode, rmsDb } from './dsp.mjs';

const dir = process.argv[2], manifest = JSON.parse(readFileSync(`${dir}/manifest.json`, 'utf8'));
/** Beat periods and grid offsets fitted by a straight line through the tracked beats of each shipped file. */
export const GRID = { burrow: { period: 0.535759, offset: 0.0250 }, square: { period: 0.625136, offset: 0.3353 }, feeding: { period: 0.652169, offset: 0.0220 }, full: { period: 0.718429, offset: 0.1752 } };
const results = {};
for (const [name, entry] of Object.entries(manifest)) {
  const { period } = GRID[name]; results[name] = [];
  for (const v of entry.versions) {
    const a = decode(`${dir}/${v.file}`);
    const jump = v.id === 'current' ? entry.seconds - 2 : v.loopS, beatsIn = jump / period, offset = (beatsIn - Math.round(beatsIn)) * period * 1000;
    const bar = ((Math.round(beatsIn) % 4) + 4) % 4 + 1;
    const skip = v.id === 'current' ? 1 : 0;
    const checks = v.seams.map(s => {
      const level = rmsDb(a.M, Math.round((s + skip) * SR), 3 * SR) - rmsDb(a.M, Math.round((s - skip - 3) * SR), 3 * SR);
      let click = null;
      if (v.id !== 'current') {
        const c = Math.round(s * SR), d2 = i => Math.abs(a.M[i + 1] - 2 * a.M[i] + a.M[i - 1]), ref = [];
        for (let i = c - 2 * SR; i < c + 2 * SR; i += 3) if (i > 1 && i < a.n - 1) ref.push(d2(i));
        ref.sort((p, q) => p - q);
        let peak = 0; for (let i = c - Math.round((v.fadeMs / 1000 + 0.002) * SR); i < c - Math.round(0.001 * SR); i++) peak = Math.max(peak, d2(i));
        click = peak / (ref[Math.floor(ref.length * 0.999)] || 1);
      }
      return { seam: s, levelDb: level, click };
    });
    results[name].push({ id: v.id, file: v.file, jumpS: jump, gridMs: offset, landsOnBeat: bar, checks });
    console.log(`${name.padEnd(8)} ${v.id.padEnd(11)} jump ${jump.toFixed(3)} s = ${beatsIn.toFixed(3)} beats → grid ${offset >= 0 ? '+' : ''}${offset.toFixed(0)} ms, downbeat lands on beat ${bar} | ` + checks.map(k => `${k.seam.toFixed(1)} s: level ${k.levelDb >= 0 ? '+' : ''}${k.levelDb.toFixed(1)} dB${k.click === null ? '' : `, click ×${k.click.toFixed(2)}`}`).join('; '));
  }
}
writeFileSync(`${dir}/verify.json`, JSON.stringify(results, null, 1));
