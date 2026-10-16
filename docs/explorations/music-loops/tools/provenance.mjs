import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../../../', import.meta.url)), media = fileURLToPath(new URL('../media/', import.meta.url));
const entry = path => { const bytes = readFileSync(path); return { file: relative(root, path), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') }; };
const sources = ['burrow', 'square', 'feeding', 'full'].map(name => entry(join(root, `packages/app/public/audio/music/${name}.mp3`)));
const reviews = ['auditions', 'seams'].flatMap(folder => readdirSync(join(media, folder)).sort().map(file => entry(join(media, folder, file))));
writeFileSync(join(media, 'provenance.json'), JSON.stringify({ sampleRate: 44100, source: 'Existing shipped mixed MP3 files', validation: 'Measured candidates; listening review pending', sources, reviews }, null, 2) + '\n');
