// Refreshes the two dependency allowlists (scripts/runtime-dependencies.json and
// scripts/dev-dependencies.json) after a version bump, such as a Dependabot pull request, so
// that the bump passes check:licenses with one reviewable commit. It never accepts a licence
// change: a bumped package whose licence or own licence text differs from the reviewed version
// stops the refresh, as do a new or removed runtime dependency, a new development dependency,
// and a bump of a patched package. Those need a person's review and a decisions entry.
//
// Pure: every read of the installed tree or the registry comes in through `sources`, so the
// rules can be tested without a network or an install.

export class RefreshRefused extends Error {}

const refuse = (message) => {
  throw new RefreshRefused(message);
};

/**
 * @param {object} input
 * @param {Array<object>} input.runtime the reviewed runtime list
 * @param {Record<string, string>} input.dev the reviewed development list
 * @param {Map<string, string>} input.runtimeVersions runtime name -> version, from every manifest
 * @param {Record<string, string>} input.devVersions the root manifest's devDependencies
 * @param {object} sources
 * @param {(name: string) => {version: string, license: string}} sources.installed
 * @param {(item: object) => string} sources.noticeSha256 the SHA-256 of the item's installed licence notice
 * @param {(name: string) => string | undefined} sources.lockIntegrity
 * @param {(name: string, version: string) => Promise<string>} sources.registryLicense
 * @param {(name: string, version: string) => Promise<{size: number, integrity: string}>} sources.registryArchive
 */
export async function refreshAllowlists({ runtime, dev, runtimeVersions, devVersions }, sources) {
  const changes = [];
  const reviewed = new Set(runtime.map((item) => item.name));
  for (const name of runtimeVersions.keys()) {
    if (!reviewed.has(name)) refuse(`${name} is a new runtime dependency: it needs the Technical Spec §11 review and a decisions entry, not a refresh.`);
  }
  const nextRuntime = [];
  for (const item of runtime) {
    const version = runtimeVersions.get(item.name);
    if (version === undefined) refuse(`${item.name} is no longer a runtime dependency: remove it from the reviewed list by hand, with a decisions entry.`);
    if (version === item.version) {
      nextRuntime.push(item);
      continue;
    }
    if (item.patch) refuse(`${item.name} is patched (${item.patch}): moving it from ${item.version} to ${version} needs the patch reviewed again.`);
    const installed = sources.installed(item.name);
    if (installed.version !== version) refuse(`${item.name}: ${installed.version} is installed, not ${version}. Run bun install --frozen-lockfile --ignore-scripts first.`);
    if (installed.license !== item.manifestLicense) refuse(`${item.name} ${version} declares licence ${installed.license}, where ${item.version} declared ${item.manifestLicense}: review it by hand.`);
    const noticeSha256 = sources.noticeSha256(item);
    if (noticeSha256 !== item.noticeSha256) refuse(`${item.name} ${version} ships a different licence text from ${item.version}: verify it again by hand.`);
    const integrity = sources.lockIntegrity(item.name);
    const archive = await sources.registryArchive(item.name, version);
    if (!integrity || archive.integrity !== integrity) refuse(`${item.name} ${version}: the lockfile's integrity does not match the registry archive.`);
    if (!(archive.size > 0)) refuse(`${item.name} ${version}: the registry archive has no size.`);
    nextRuntime.push({ ...item, version, integrity, gzipArchiveBytes: archive.size });
    changes.push({ kind: 'runtime', name: item.name, from: item.version, to: version, license: installed.license, gzipArchiveBytes: archive.size });
  }

  const nextDev = {};
  for (const [name, version] of Object.entries(devVersions)) {
    const before = dev[name];
    if (before === undefined) refuse(`${name} is a new development dependency: it needs a decisions entry, not a refresh.`);
    if (before !== version) {
      const [was, now] = await Promise.all([sources.registryLicense(name, before), sources.registryLicense(name, version)]);
      if (was !== now) refuse(`${name} ${version} declares licence ${now}, where ${before} declared ${was}: review it by hand.`);
      changes.push({ kind: 'dev', name, from: before, to: version, license: now });
    }
    nextDev[name] = version;
  }
  // Keep the reviewed list's own order, so the diff shows only the bumped lines.
  const orderedDev = Object.fromEntries(Object.keys(dev).filter((name) => name in nextDev).map((name) => [name, nextDev[name]]));
  return { runtime: nextRuntime, dev: orderedDev, changes };
}
