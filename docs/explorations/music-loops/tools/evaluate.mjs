// Evaluates hand-picked, bar-aligned loop candidates and writes a seam excerpt for each, beside the current seam.
// A candidate is [loopStart bar, loopEnd bar]; bars count from the downbeat each track's sections were read from.
// The cut at E is moved to just before the downbeat's attack; S is aligned to E by cross-correlating the second before
// the cut (the tail the jump lands in) and the quarter second after it.
// Usage: node evaluate.mjs <pcm dir> <out dir> [--json file]
import { mkdirSync, writeFileSync } from 'node:fs';
import { SR, loadF32, onsetEnvelope, trackBeats, stft, cosine, rmsDb, wav } from './dsp.mjs';

const [dir, out] = process.argv.slice(2), jsonOut = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;
export const STUDY = {
  burrow: { bpm: 112.35, phase: 0, candidates: [[17, 41], [9, 41], [25, 41], [17, 33], [21, 37], [9, 33]] },
  square: { bpm: 95.7, phase: 0, candidates: [[9, 33], [5, 29], [7, 31], [17, 33], [1, 25]] },
  feeding: { bpm: 92.29, phase: 0, candidates: [[7, 28], [5, 26], [6, 27], [8, 29], [10, 27]] },
  full: { bpm: 83.35, phase: 0, candidates: [[5, 17], [6, 18], [7, 19], [8, 20], [9, 17]] },
};
export const SEAM_FADE_S = 0.03; // equal-gain crossfade at the cut, in the pre-roll before the downbeat's attack
export const PRE_ATTACK_S = 0.008;

/** The attack nearest a beat: the steepest rise of 2–10 kHz energy within ±50 ms, at 2.9 ms resolution. */
function attackNear(x, at) {
  const hop = 128, N = 512, from = at - Math.round(0.08 * SR), frames = stft(x.subarray(from, from + Math.round(0.16 * SR) + N), N, hop);
  const lo = Math.floor(2000 * N / SR), hi = Math.ceil(10000 * N / SR), e = frames.map(m => { let s = 0; for (let k = lo; k < hi; k++) s += m[k] * m[k]; return Math.log10(s + 1e-12); });
  let best = -Infinity, arg = Math.round(0.08 * SR / hop);
  for (let t = 1; t < e.length; t++) { const centre = t * hop - Math.round(0.08 * SR); if (Math.abs(centre) > 0.05 * SR) continue; const rise = e[t] - e[t - 1]; if (rise > best) { best = rise; arg = t; } }
  return from + arg * hop - N / 4;
}
/** Lag of S that best matches the audio before (and just after) E, by normalised cross-correlation on both channels. */
function alignStereo(a, E, S, maxLag) {
  const pre = Math.round(1.0 * SR), post = Math.round(0.25 * SR);
  const score = d => { let s = 0, ea = 0, eb = 0; for (const ch of [a.L, a.R]) for (let n = -pre; n < post; n += 2) { const p = ch[E + n], q = ch[S + d + n]; s += p * q; ea += p * p; eb += q * q; } return s / (Math.sqrt(ea * eb) || 1); };
  let best = -2, arg = 0;
  for (let d = -maxLag; d <= maxLag; d += 6) { const v = score(d); if (v > best) { best = v; arg = d; } }
  for (let d = arg - 6; d <= arg + 6; d++) { const v = score(d); if (v > best) { best = v; arg = d; } }
  return { lag: arg, ncc: best };
}
function chromaOf(x, from, length) {
  const frames = stft(x.subarray(Math.max(0, from), from + length), 8192, 2048), c = new Array(12).fill(0);
  for (const m of frames) for (let k = 1; k < m.length; k++) { const f = k * SR / 8192; if (f < 80 || f > 5000) continue; c[((Math.round(12 * Math.log2(f / 261.6256)) % 12) + 12) % 12] += m[k] * m[k]; }
  return c;
}
const NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const topNotes = c => c.map((v, k) => [v, NAMES[k]]).sort((p, q) => q[0] - p[0]).slice(0, 3).map(p => p[1]).join(' ');

/** Plays [cutFrom, E) of pass k fading out over the fade, and [S − fade, ...) of pass k + 1 fading in: the proposed seam. */
export function spliceExcerpt(a, E, S, fade, before, after) {
  const F = Math.round(fade * SR), nb = Math.round(before * SR), na = Math.round(after * SR), L = new Float32Array(nb + na), R = new Float32Array(nb + na);
  for (let n = 0; n < nb + na; n++) {
    const t = n - nb; // 0 is the cut
    let gOut = t < -F ? 1 : t >= 0 ? 0 : 0.5 + 0.5 * Math.cos(Math.PI * (t + F) / F), gIn = 1 - gOut;
    const o = E + t, i = S + t;
    L[n] = (o < a.n && o >= 0 ? a.L[o] * gOut : 0) + (i >= 0 && i < a.n ? a.L[i] * gIn : 0);
    R[n] = (o < a.n && o >= 0 ? a.R[o] * gOut : 0) + (i >= 0 && i < a.n ? a.R[i] * gIn : 0);
  }
  return { L, R };
}
/** The current seam: the next pass starts two seconds before this one ends; sine up, cosine down (renderLoop). */
export function currentExcerpt(a, before, after, overlap = 2) {
  const D = a.n, O = Math.round(overlap * SR), nb = Math.round(before * SR), na = Math.round(after * SR), L = new Float32Array(nb + na), R = new Float32Array(nb + na);
  const start = D - O; // where the next pass starts, in this pass's frames
  for (let n = 0; n < nb + na; n++) {
    const t = start - nb + n + 0; // frame in the current pass, excerpt centred on the next pass's start
    const inOld = t >= 0 && t < D, k = t - start, inNew = k >= 0 && k < D;
    const gOld = !inOld ? 0 : t < start ? 1 : Math.cos(Math.PI / 2 * (t - start) / O), gNew = !inNew ? 0 : k >= O ? 1 : Math.sin(Math.PI / 2 * k / O);
    L[n] = (inOld ? a.L[t] * gOld : 0) + (inNew ? a.L[k] * gNew : 0);
    R[n] = (inOld ? a.R[t] * gOld : 0) + (inNew ? a.R[k] * gNew : 0);
  }
  return { L, R };
}

export function evaluate(name, a) {
  const { bpm, phase, candidates } = STUDY[name];
  const beats = trackBeats(onsetEnvelope(a.M), bpm), barAt = bar => beats[phase + (bar - 1) * 4];
  return candidates.map(([sBar, eBar]) => {
    const eBeat = barAt(eBar), sBeat = barAt(sBar);
    const Eraw = eBeat === undefined ? null : Math.round(eBeat * SR);
    if (Eraw === null || Eraw > a.n - Math.round(0.3 * SR)) return { sBar, eBar, error: 'loop end past the file' };
    const E = attackNear(a.M, Eraw) - Math.round(PRE_ATTACK_S * SR), S0 = attackNear(a.M, Math.round(sBeat * SR)) - Math.round(PRE_ATTACK_S * SR);
    const fit = alignStereo(a, E, S0, Math.round(0.02 * SR)), S = S0 + fit.lag;
    const F = Math.round(SEAM_FADE_S * SR);
    let diff = 0, ref = 0; for (let n = -F; n < Math.round(0.25 * SR); n++) for (const ch of [a.L, a.R]) { diff += (ch[E + n] - ch[S + n]) ** 2; ref += ch[E + n] ** 2; }
    const preE = chromaOf(a.M, E - 2 * SR, 2 * SR), preS = chromaOf(a.M, S - 2 * SR, 2 * SR), postS = chromaOf(a.M, S, 2 * SR), postE = E + 2 * SR < a.n ? chromaOf(a.M, E, 2 * SR) : null;
    return {
      sBar, eBar, bars: eBar - sBar, S, E, startS: S / SR, endS: E / SR, loopS: (E - S) / SR, ncc: fit.ncc,
      residualDb: 10 * Math.log10(diff / (ref || 1)), stepDb: rmsDb(a.M, S, 2 * SR) - rmsDb(a.M, E - 2 * SR, 2 * SR), tailDb: rmsDb(a.M, S - SR / 2, SR / 2) - rmsDb(a.M, E - SR / 2, SR / 2),
      harmonyBefore: cosine(preE, preS), harmonyAcross: cosine(preE, postS), harmonyAfter: postE ? cosine(postE, postS) : null,
      notesBeforeE: topNotes(preE), notesAfterS: topNotes(postS), notesBeforeS: topNotes(preS),
    };
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(out, { recursive: true });
  const report = {};
  for (const name of Object.keys(STUDY)) {
    const a = loadF32(`${dir}/${name}.shipped.f32`), rows = evaluate(name, a);
    report[name] = { frames: a.n, seconds: a.n / SR, rows };
    console.log(`\n== ${name} (${(a.n / SR).toFixed(3)} s, ${a.n} frames)`);
    const cur = currentExcerpt(a, 8, 8); writeFileSync(`${out}/${name}-seam-current.wav`, wav(cur.L, cur.R));
    rows.forEach((r, k) => {
      if (r.error) { console.log(`  [${r.sBar} → ${r.eBar}] ${r.error}`); return; }
      console.log(`  [bar ${r.sBar} → bar ${r.eBar}] ${r.bars} bars ${r.loopS.toFixed(3)} s | S ${r.startS.toFixed(4)} s (${r.S}) E ${r.endS.toFixed(4)} s (${r.E}) | ncc ${r.ncc.toFixed(3)} residual ${r.residualDb.toFixed(1)} dB | step ${r.stepDb.toFixed(1)} dB tail ${r.tailDb.toFixed(1)} dB | harmony before ${r.harmonyBefore.toFixed(2)} across ${r.harmonyAcross.toFixed(2)} after ${r.harmonyAfter?.toFixed(2) ?? '—'} | before E ${r.notesBeforeE}; after S ${r.notesAfterS}`);
      const ex = spliceExcerpt(a, r.E, r.S, SEAM_FADE_S, 8, 8); writeFileSync(`${out}/${name}-seam-${String.fromCharCode(97 + k)}-bar${r.sBar}-${r.eBar}.wav`, wav(ex.L, ex.R));
    });
  }
  if (jsonOut) writeFileSync(jsonOut, JSON.stringify(report, null, 1));
}
