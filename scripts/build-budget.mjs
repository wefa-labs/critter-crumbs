import { gzipSync } from 'node:zlib';

export const limits = { shell: 120_000, three: 250_000 };

export function measureBundle(bundle) {
  const chunks = Object.values(bundle).filter((item) => item.type === 'chunk');
  const named = (name) => chunks.filter((chunk) => chunk.name === name);
  const reach = (entries) => {
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
  };
  for (const name of ['three', 'crypto']) {
    if (!named(name).length) throw new Error(`Missing ${name} chunk; keep the lazy entries wired.`);
  }
  const shell = reach(chunks.filter((chunk) => chunk.isEntry && !['three', 'crypto'].includes(chunk.name)));
  for (const name of ['three', 'crypto']) {
    if (named(name).some((chunk) => shell.has(chunk.fileName))) throw new Error(`${name} must stay outside the app shell's static imports.`);
  }
  const bytes = (files) => [...files].reduce((sum, file) => sum + gzipSync(bundle[file].code).byteLength, 0);
  const additional = (name) => new Set([...reach(named(name))].filter((file) => !shell.has(file)));
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
