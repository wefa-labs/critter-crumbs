// Draws each track's beat-level self-similarity matrix (harmony and timbre) with bar lines, and its loudness over
// time, as PGM images for inspection. Repeated passages show as stripes parallel to the diagonal.
// Usage: node structure.mjs <pcm dir> <out dir>
import { writeFileSync } from 'node:fs';
import { SR, loadF32, onsetEnvelope, trackBeats, beatFeatures, cosine, correlation, rmsDb } from './dsp.mjs';

const [dir, out] = process.argv.slice(2);
const TRACKS = { burrow: [112.35, 0], square: [95.7, 3], feeding: [92.29, 0], full: [83.35, 0] };
for (const [name, [bpm, downPhase]] of Object.entries(TRACKS)) {
  const audio = loadF32(`${dir}/${name}.shipped.f32`);
  const beats = trackBeats(onsetEnvelope(audio.M), bpm), feats = beatFeatures(audio.M, beats), B = feats.length;
  const cell = 4, size = B * cell, img = Buffer.alloc(size * size);
  for (let a = 0; a < B; a++) for (let b = 0; b < B; b++) {
    const s = 0.6 * cosine(feats[a].chroma, feats[b].chroma) + 0.4 * correlation(feats[a].bands, feats[b].bands);
    const v = Math.max(0, Math.min(255, Math.round((s - 0.35) / 0.65 * 255)));
    for (let y = 0; y < cell; y++) for (let x = 0; x < cell; x++) img[(a * cell + y) * size + b * cell + x] = v;
  }
  // bar lines every four beats from the downbeat phase, every fourth bar darker
  for (let b = downPhase; b < B; b += 4) {
    const strong = ((b - downPhase) / 4) % 4 === 0;
    for (let k = 0; k < size; k++) { const v = strong ? 0 : 60; if (strong || k % 3 === 0) { img[k * size + b * cell] = v; img[b * cell * size + k] = v; } }
  }
  writeFileSync(`${out}/${name}-ssm.pgm`, Buffer.concat([Buffer.from(`P5\n${size} ${size}\n255\n`), img]));
  // loudness strip: one column per beat, height 60, with the beat's level
  const H = 80, strip = Buffer.alloc(size * H).fill(255);
  feats.forEach((f, b) => { const level = rmsDb(audio.M, Math.round(f.t * SR), Math.round(60 / bpm * SR)); const h = Math.max(0, Math.min(H, Math.round((level + 45) / 35 * H))); for (let y = H - h; y < H; y++) for (let x = 0; x < cell; x++) strip[y * size + b * cell + x] = 90; });
  writeFileSync(`${out}/${name}-level.pgm`, Buffer.concat([Buffer.from(`P5\n${size} ${H}\n255\n`), strip]));
  console.log(`${name}: ${B} beats; beat ${downPhase} is a downbeat; ${(beats[0]).toFixed(3)} s first beat; image ${size} px`);
  console.log(`  beat times: ${beats.map((t, i) => i % 16 === downPhase ? `[${i}] ${t.toFixed(2)}` : null).filter(Boolean).join('  ')}`);
}
