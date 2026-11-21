import assert from 'node:assert/strict';
import { test } from 'node:test';
import { refreshAllowlists, RefreshRefused } from './dependency-refresh.mjs';

const three = { name: 'three', version: '0.186.1', manifestLicense: 'MIT', license: 'MIT', notice: 'LICENSE', sourceNotice: null, noticeSha256: 'mit-text', gzipArchiveBytes: 4648523, integrity: 'sha512-old' };
const koota = { name: 'koota', version: '0.6.6', manifestLicense: 'ISC', license: 'ISC', notice: 'LICENSE', sourceNotice: null, noticeSha256: 'isc-text', gzipArchiveBytes: 1, integrity: 'sha512-k', patch: 'patches/koota@0.6.6.patch', patchSha256: 'p' };

// A bumped tree as Dependabot leaves it: three 0.187.0 and @types/three 0.187.0, same licences.
const bump = (over = {}) => ({
  input: {
    runtime: [three, koota],
    dev: { vite: '7.3.7', '@types/three': '0.186.0' },
    runtimeVersions: new Map([['three', '0.187.0'], ['koota', '0.6.6']]),
    devVersions: { vite: '7.3.7', '@types/three': '0.187.0' },
    ...over.input,
  },
  sources: {
    installed: () => ({ version: '0.187.0', license: 'MIT' }),
    noticeSha256: () => 'mit-text',
    lockIntegrity: () => 'sha512-new',
    registryLicense: async () => 'MIT',
    registryArchive: async () => ({ size: 4700000, integrity: 'sha512-new' }),
    ...over.sources,
  },
});
const run = ({ input, sources }) => refreshAllowlists(input, sources);
const refused = (over, pattern) => assert.rejects(run(bump(over)), (error) => error instanceof RefreshRefused && pattern.test(error.message));

test('a bump with unchanged licences rewrites only the bumped entries', async () => {
  const { runtime, dev, changes } = await run(bump());
  assert.deepEqual(runtime[0], { ...three, version: '0.187.0', integrity: 'sha512-new', gzipArchiveBytes: 4700000 });
  assert.equal(runtime[1], koota);
  assert.deepEqual(dev, { vite: '7.3.7', '@types/three': '0.187.0' });
  assert.deepEqual(changes.map((change) => `${change.kind} ${change.name} ${change.from} -> ${change.to}`), ['runtime three 0.186.1 -> 0.187.0', 'dev @types/three 0.186.0 -> 0.187.0']);
});

test('a development dependency whose licence changed stops the refresh', async () => {
  await refused({ sources: { registryLicense: async (name, version) => (version === '0.187.0' ? 'BUSL-1.1' : 'MIT') } }, /@types\/three 0\.187\.0 declares licence BUSL-1\.1, where 0\.186\.0 declared MIT/);
});

test('a runtime dependency whose declared licence or licence text changed stops the refresh', async () => {
  await refused({ sources: { installed: () => ({ version: '0.187.0', license: 'GPL-3.0' }) } }, /three 0\.187\.0 declares licence GPL-3\.0/);
  await refused({ sources: { noticeSha256: () => 'other-text' } }, /three 0\.187\.0 ships a different licence text/);
});

test('new, removed and patched dependencies are left to a person', async () => {
  await refused({ input: { runtimeVersions: new Map([['three', '0.186.1'], ['koota', '0.6.6'], ['lodash', '4.17.21']]) } }, /lodash is a new runtime dependency/);
  await refused({ input: { runtimeVersions: new Map([['three', '0.186.1']]) } }, /koota is no longer a runtime dependency/);
  await refused({ input: { runtimeVersions: new Map([['three', '0.186.1'], ['koota', '0.6.7']]) } }, /koota is patched/);
  await refused({ input: { devVersions: { vite: '7.3.7', '@types/three': '0.186.0', biome: '2.4.0' } } }, /biome is a new development dependency/);
});

test('an install that does not match the manifest or the registry stops the refresh', async () => {
  await refused({ sources: { installed: () => ({ version: '0.186.1', license: 'MIT' }) } }, /0\.186\.1 is installed, not 0\.187\.0/);
  await refused({ sources: { lockIntegrity: () => 'sha512-tampered' } }, /integrity does not match the registry archive/);
});
