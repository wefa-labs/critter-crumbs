// Regenerate the review auditions from the four existing shipped tracks. No generation service or new dependency.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root = fileURLToPath(new URL('../../../', import.meta.url)), here = fileURLToPath(new URL('./', import.meta.url));
const pcm = join(root, '.scratch/music-review-pcm'), media = join(here, 'media'), seams = join(media, 'seams');
mkdirSync(pcm, { recursive: true }); mkdirSync(seams, { recursive: true });
for (const name of ['burrow', 'square', 'feeding', 'full']) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', join(root, `packages/app/public/audio/music/${name}.mp3`), '-ar', '44100', '-ac', '2', '-f', 'f32le', join(pcm, `${name}.shipped.f32`)]);
}
const run = (file, args) => execFileSync(process.execPath, [join(here, 'tools', file), ...args], { stdio: 'inherit' });
run('evaluate.mjs', [pcm, seams, '--json', join(media, 'evaluate.json')]);
for (const file of readdirSync(seams).filter(name => name.endsWith('.wav'))) {
  const source = join(seams, file);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', source, '-codec:a', 'libmp3lame', '-q:a', '2', source.replace(/\.wav$/, '.mp3')]); rmSync(source);
}
run('render.mjs', [pcm, join(media, 'evaluate.json'), join(media, 'auditions')]);
run('verify.mjs', [join(media, 'auditions')]);
run('audition-page.mjs', [media]);
run('provenance.mjs', []);
// Preserve the exact decoded-audio convention alongside the rebuilt files.
writeFileSync(join(media, 'sample-rate.json'), JSON.stringify({ sampleRate: 44100, channels: 2, frameIndexBasis: 'decoded shipped MP3' }, null, 2) + '\n');
