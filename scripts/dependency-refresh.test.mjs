import assert from "node:assert/strict";
import { test } from "node:test";
import { refreshAllowlists, RefreshRefused } from "./dependency-refresh.mjs";

const three = {
  name: "three",
  version: "0.186.1",
  manifestLicense: "MIT",
  license: "MIT",
  notice: "LICENSE",
  sourceNotice: null,
  noticeSha256: "mit-text",
  gzipArchiveBytes: 4648523,
  integrity: "sha512-old",
};
const koota = {
  name: "koota",
  version: "0.6.6",
  manifestLicense: "ISC",
  license: "ISC",
  notice: "LICENSE",
  sourceNotice: null,
  noticeSha256: "isc-text",
  gzipArchiveBytes: 1,
  integrity: "sha512-k",
  patch: "patches/koota@0.6.6.patch",
  patchSha256: "p",
};
const fiber = {
  name: "@react-three/fiber",
  version: "9.8.2",
  manifestLicense: "MIT",
  license: "MIT",
  notice: null,
  sourceNotice: "docs/research/licenses/react-three-fiber-LICENSE",
  noticeSha256: "kept-text",
  gzipArchiveBytes: 1,
  integrity: "sha512-f",
};

// An installed tree after Dependabot's bump: three 0.187.0 and @types/three 0.187.0, same licences.
// The fakes answer only for the package or notice they are asked about, so a lookup of the wrong
// one fails the test instead of passing quietly.
const tree = {
  three: { version: "0.187.0", license: "MIT" },
  "@types/three": { version: "0.187.0", license: "MIT" },
  vite: { version: "7.3.7", license: "MIT" },
};
const notices = { "node_modules/three/LICENSE": "mit-text" };
const registry = { "three@0.187.0": { size: 4700000, integrity: "sha512-new" } };
const bump = (over = {}) => ({
  input: {
    runtime: [three, koota],
    dev: { vite: "7.3.7", "@types/three": "0.186.0" },
    runtimeVersions: new Map([
      ["three", "0.187.0"],
      ["koota", "0.6.6"],
    ]),
    devVersions: { vite: "7.3.7", "@types/three": "0.187.0" },
    ...over.input,
  },
  sources: {
    installed: (name) => tree[name] ?? assert.fail(`installed() asked about ${name}`),
    noticeSha256: (item) =>
      notices[item.notice ? `node_modules/${item.name}/${item.notice}` : item.sourceNotice] ??
      assert.fail(`noticeSha256() asked about ${item.name}`),
    lockIntegrity: (name) =>
      ({ three: "sha512-new" })[name] ?? assert.fail(`lockIntegrity() asked about ${name}`),
    registryLicense: async () => "MIT",
    registryArchive: async (name, version) =>
      registry[`${name}@${version}`] ??
      assert.fail(`registryArchive() asked about ${name}@${version}`),
    ...over.sources,
  },
});
const run = ({ input, sources }) => refreshAllowlists(input, sources);
const refused = (over, pattern) =>
  assert.rejects(
    run(bump(over)),
    (error) => error instanceof RefreshRefused && pattern.test(error.message)
  );

test("a bump with unchanged licences rewrites only the bumped entries", async () => {
  const { runtime, dev, changes } = await run(bump());
  assert.deepEqual(runtime[0], {
    ...three,
    version: "0.187.0",
    integrity: "sha512-new",
    gzipArchiveBytes: 4700000,
  });
  assert.equal(runtime[1], koota);
  assert.deepEqual(dev, { vite: "7.3.7", "@types/three": "0.187.0" });
  assert.deepEqual(
    changes.map((change) => `${change.kind} ${change.name} ${change.from} -> ${change.to}`),
    ["runtime three 0.186.1 -> 0.187.0", "dev @types/three 0.186.0 -> 0.187.0"]
  );
});

test("a development dependency whose licence changed stops the refresh", async () => {
  await refused(
    {
      sources: {
        registryLicense: async (name, version) => (version === "0.187.0" ? "BUSL-1.1" : "MIT"),
      },
    },
    /@types\/three 0\.187\.0 declares licence BUSL-1\.1, where 0\.186\.0 declared MIT/
  );
  await refused(
    {
      sources: {
        installed: (name) => ({
          ...tree[name],
          ...(name === "@types/three" ? { license: "GPL-3.0" } : {}),
        }),
      },
    },
    /@types\/three 0\.187\.0 is installed with licence GPL-3\.0, where the registry declares MIT/
  );
});

test("a development version that is not exact stops the refresh", async () => {
  await refused(
    { input: { devVersions: { vite: ">=7.3.7 <7.3.8", "@types/three": "0.186.0" } } },
    /vite: >=7\.3\.7 <7\.3\.8 is not an exact version/
  );
});

test("a runtime dependency whose declared licence or licence text changed stops the refresh", async () => {
  await refused(
    { sources: { installed: (name) => ({ ...tree[name], license: "GPL-3.0" }) } },
    /three 0\.187\.0 declares licence GPL-3\.0/
  );
  await refused(
    { sources: { noticeSha256: () => "other-text" } },
    /three 0\.187\.0 ships a different licence text/
  );
  const missing = Object.assign(new Error("no such file"), { code: "ENOENT" });
  await refused(
    {
      sources: {
        noticeSha256: () => {
          throw missing;
        },
      },
    },
    /three 0\.187\.0 has no LICENSE where 0\.186\.1 had one \(ENOENT\)/
  );
});

test("a package whose licence text is kept in this repository is left to a person", async () => {
  await refused(
    { input: { runtime: [fiber], runtimeVersions: new Map([["@react-three/fiber", "9.9.0"]]) } },
    /@react-three\/fiber's licence text lives outside its archive/
  );
});

test("new, removed and patched dependencies are left to a person", async () => {
  await refused(
    {
      input: {
        runtimeVersions: new Map([
          ["three", "0.186.1"],
          ["koota", "0.6.6"],
          ["lodash", "4.17.21"],
        ]),
      },
    },
    /lodash is a new runtime dependency/
  );
  await refused(
    { input: { runtimeVersions: new Map([["three", "0.186.1"]]) } },
    /koota is no longer a runtime dependency/
  );
  await refused(
    {
      input: {
        runtimeVersions: new Map([
          ["three", "0.186.1"],
          ["koota", "0.6.7"],
        ]),
      },
    },
    /koota is patched/
  );
  await refused(
    { input: { devVersions: { vite: "7.3.7", "@types/three": "0.186.0", biome: "2.4.0" } } },
    /biome is a new development dependency/
  );
});

test("an install that does not match the manifest or the registry stops the refresh", async () => {
  await refused(
    { sources: { installed: (name) => ({ ...tree[name], version: "0.186.1" }) } },
    /0\.186\.1 is installed, not 0\.187\.0/
  );
  await refused(
    { sources: { lockIntegrity: () => "sha512-tampered" } },
    /integrity does not match the registry archive/
  );
  await refused(
    { sources: { registryArchive: async () => ({ size: 0, integrity: "sha512-new" }) } },
    /the registry archive has no size/
  );
});
