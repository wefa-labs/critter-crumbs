/**
 * The page's Content-Security-Policy (vercel.json, Technical Spec §2) has no 'unsafe-eval'. A script that makes code
 * from a string throws there, and one that does it while loading leaves the page blank. No test on the dev server
 * sees that, because the dev server sends no policy, so the build refuses such a script instead.
 */
const fromStrings = /\bnew\s+Function\b|(?<![.\w$])Function\s*\(|(?<![.\w$])eval\s*\(|\(\s*0\s*,\s*eval\s*\)/;

export function refuseCodeFromStrings(bundle) {
  const scripts = Object.values(bundle).filter(item => item.type === 'chunk' || item.fileName.endsWith('.js'));
  const found = scripts.filter(item => fromStrings.test(item.type === 'chunk' ? item.code : String(item.source))).map(item => item.fileName);
  if (found.length) throw new Error(`Code made from a string in ${found.join(', ')}: the page policy has no 'unsafe-eval', so it would throw in the browser.`);
}

/**
 * Two chunks that import each other cannot both load first. Whichever the browser evaluates first runs before the
 * other has made what it imports, and throws if it uses any of it straight away. The dev server serves modules one by
 * one and never shows this; in the bundle it stopped anyone connecting. So a ring of static imports fails the build.
 */
export function refuseChunkCycles(bundle) {
  const settled = new Set();
  const walk = (file, path) => {
    if (settled.has(file)) return;
    for (const next of bundle[file]?.type === 'chunk' ? bundle[file].imports : []) {
      const at = path.indexOf(next);
      if (at >= 0) throw new Error(`Chunks import each other: ${[...path.slice(at), next].join(' -> ')}. Keep their modules in one chunk (manualChunks in packages/app/vite.config.ts).`);
      walk(next, [...path, next]);
    }
    settled.add(file);
  };
  for (const file of Object.keys(bundle)) walk(file, [file]);
}
