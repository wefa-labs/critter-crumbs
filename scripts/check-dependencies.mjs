import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const json = (file) => JSON.parse(readFileSync(path.resolve(root, file), 'utf8'));
const runtime = json('scripts/runtime-dependencies.json');
const dev = json('scripts/dev-dependencies.json');
const lock = json('package-lock.json');
const overrides = json('scripts/dev-overrides.json');
const manifests = ['package.json', ...['shared', 'core', 'app'].map((name) => `packages/${name}/package.json`)];
const found = new Map();
const fail = (message) => { throw new Error(message); };
const permissive = new Set(['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'OFL-1.1']);
for (const file of manifests) {
  const manifest = json(file);
  for (const [name, version] of Object.entries(manifest.dependencies ?? {})) {
    if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version)) fail(`${file}: ${name} must use an exact version.`);
    if (name.startsWith('@critter-crumbs/')) continue;
    if (found.has(name)) fail(`${name} has multiple runtime owners.`);
    found.set(name, version);
  }
  for (const [name, version] of Object.entries(manifest.devDependencies ?? {})) {
    if (dev[name] !== version) fail(`${file}: unreviewed development dependency ${name}@${version}.`);
  }
}
if (found.size !== runtime.length) fail('Runtime dependencies differ from the reviewed §11 list.');
for (const item of runtime) {
  if (found.get(item.name) !== item.version) fail(`Unreviewed version of ${item.name}.`);
  const directory = `node_modules/${item.name}`;
  const installed = json(`${directory}/package.json`);
  if (installed.version !== item.version || installed.license !== item.manifestLicense) fail(`${item.name}: installed metadata changed.`);
  if (!permissive.has(item.license) || !permissive.has(installed.license)) fail(`${item.name}: licence requires human review.`);
  const notice = readFileSync(path.resolve(root, item.notice ? `${directory}/${item.notice}` : item.sourceNotice));
  if (createHash('sha256').update(notice).digest('hex') !== item.noticeSha256) fail(`${item.name}: own licence changed; verify it again.`);
  if (lock.packages[directory]?.integrity !== item.integrity) fail(`${item.name}: archive integrity differs from measured evidence.`);
  if (!(item.gzipArchiveBytes > 0)) fail(`${item.name}: missing gzip measurement.`);
}
const rootManifest = json('package.json');
if (JSON.stringify(rootManifest.overrides) !== JSON.stringify(overrides)) fail('Development overrides differ from the reviewed list.');
if (JSON.stringify(Object.entries(rootManifest.devDependencies).sort()) !== JSON.stringify(Object.entries(dev).sort())) fail('Development dependencies differ from the reviewed list.');
console.log(`${runtime.length} exact runtime dependencies: own permissive licences, archive integrity, and gzip evidence verified.`);
