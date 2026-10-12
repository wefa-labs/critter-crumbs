import { gzipSync } from 'node:zlib';

export const limits = { shell: 120_000, three: 250_000 };

const lazyEntries = ['three', 'crypto'];
const chunksOf = (bundle) => Object.values(bundle).filter((item) => item.type === 'chunk');
/** Every chunk the given ones load with them: themselves and their static imports, all the way down. */
function reach(bundle, entries) {
  const found = new Set();
  const visit = (file) => {
    if (found.has(file)) return;
    const chunk = bundle[file];
    if (!chunk || chunk.type !== 'chunk') return;
    found.add(file);
    for (const imported of chunk.imports) visit(imported);
  };
  for (const chunk of entries) visit(chunk.fileName);
  return found;
}
/** The app shell: what the first screen loads, which is the page's entry and everything it imports statically. */
export const shellFiles = (bundle) => reach(bundle, chunksOf(bundle).filter((chunk) => chunk.isEntry && !lazyEntries.includes(chunk.name)));

export function measureBundle(bundle) {
  const chunks = chunksOf(bundle);
  const named = (name) => chunks.filter((chunk) => chunk.name === name);
  for (const name of lazyEntries) {
    if (!named(name).length) throw new Error(`Missing ${name} chunk; keep the lazy entries wired.`);
  }
  const shell = shellFiles(bundle);
  for (const name of lazyEntries) {
    if (named(name).some((chunk) => shell.has(chunk.fileName))) throw new Error(`${name} must stay outside the app shell's static imports.`);
  }
  const bytes = (files) => [...files].reduce((sum, file) => sum + gzipSync(bundle[file].code).byteLength, 0);
  // A lazy chunk is asked for by the chunks that import() it, and what those hold statically is on the page before they
  // ask. So its figure is what asking for it adds: its own static reach, less the shell's, less what every one of its
  // importers already holds. The game's own libraries are the game's, whichever lazy chunk also uses them.
  const heldBefore = (name) => {
    const files = named(name).map((chunk) => chunk.fileName);
    const importers = chunks.filter((chunk) => chunk.dynamicImports?.some((file) => files.includes(file)));
    if (!importers.length) return new Set();
    const held = importers.map((chunk) => reach(bundle, [chunk])).reduce((all, one) => new Set([...all].filter((file) => one.has(file))));
    if (files.some((file) => held.has(file))) throw new Error(`${name} must stay behind import() in the chunks that ask for it.`);
    return held;
  };
  const additional = (name) => {
    const held = heldBefore(name);
    return new Set([...reach(bundle, named(name))].filter((file) => !shell.has(file) && !held.has(file)));
  };
  const css = Object.values(bundle).filter((item) => item.type === 'asset' && item.fileName.endsWith('.css'));
  const sizes = {
    shell: bytes(shell) + css.reduce((sum, asset) => sum + gzipSync(asset.source).byteLength, 0),
    three: bytes(additional('three')),
    crypto: bytes(additional('crypto')),
  };
  for (const [name, limit] of Object.entries(limits)) {
    if (sizes[name] > limit) throw new Error(`${name}: ${sizes[name]} gzip bytes exceeds ${limit} bytes.`);
  }
  return sizes;
}
