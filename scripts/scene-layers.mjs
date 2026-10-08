// Pre-renders the layers a cropped scene is drawn from, as the scatter review page builds them
// (docs/explorations/scatter-layouts, cropToUrl): one floor tile mirrored four ways so it repeats without seams,
// the wall band and the two corners. Run after adding or changing a "crops" scene in
// packages/app/public/scenes/manifest.json: `node scripts/scene-layers.mjs` (needs ffmpeg on PATH).
// A painted floor-first plate ("plate") needs none of this.
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const directory = new URL('../packages/app/public/scenes/', import.meta.url);
const manifestUrl = new URL('manifest.json', directory);
const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
const crop = ({ x, y, w, h }) => `crop=iw*${w}:ih*${h}:iw*${x}:ih*${y}`;
const render = (source, filter, name) => {
  /* JPEG at about the review page's 0.88 quality; these layers sit under a wash and grain */
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', source, '-filter_complex', filter, '-frames:v', '1', '-q:v', '3', fileURLToPath(new URL(name, directory))]);
  return `/scenes/${name}`;
};

for (const scene of manifest) {
  const devices = Object.values(scene.devices);
  if (!devices.some(device => device.kind === 'crops')) continue;
  const images = new Set(devices.filter(device => device.kind === 'crops').map(device => device.image));
  if (images.size !== 1) throw new Error(`${scene.id}: crops scenes draw both devices from one painting`);
  const source = fileURLToPath(new URL([...images][0].replace(/^\/scenes\//, ''), directory));
  scene.layers = {
    floor: render(source, `[0]${crop(scene.floor)},split[a][b];[b]hflip[c];[a][c]hstack,split[d][e];[e]vflip[f];[d][f]vstack`, `${scene.id}-floor.jpg`),
    wall: render(source, `[0]${crop(scene.wall)}`, `${scene.id}-wall.jpg`),
    cornerL: render(source, `[0]${crop(scene.cornerL)}`, `${scene.id}-corner-left.jpg`),
    cornerR: render(source, `[0]${crop(scene.cornerR)}`, `${scene.id}-corner-right.jpg`),
  };
}
await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Rendered layers for ${manifest.filter(scene => scene.layers).map(scene => scene.id).join(', ')}.`);
