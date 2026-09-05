# Bun package-manager policy

Checked 2026-09-05 UTC after the user explicitly selected the latest Bun. This supersedes the earlier npm package-manager recommendation. Node 22 remains the runtime for functions and development tools.

**Selected version:** Bun 1.4.2. GitHub's official latest-release API returned `bun-v1.4.2`, published `2026-09-05T05:55:48Z`, with both `prerelease` and `draft` false. Pin that version rather than a moving `latest` reference. [Bun 1.4.2 release](https://github.com/oven-sh/bun/releases/tag/bun-v1.4.2)

## Installation policy

The configuration below is supported by the documentation at the exact `bun-v1.4.2` tag, retrieved through GitHub's contents API:

```toml
[install]
exact = true
ignoreScripts = true
minimumReleaseAge = 604800

[run]
bun = false
```

`exact` saves exact dependency versions. `ignoreScripts` suppresses installation lifecycle scripts for the root project and trusted dependencies alike. `run.bun = false` disables Bun's substitution of itself for the `node` executable; Node must still be on `PATH`. [Tagged configuration documentation](https://github.com/oven-sh/bun/blob/bun-v1.4.2/docs/runtime/bunfig.mdx)

Release age is measured in seconds, so `604800` means seven days. It applies to new direct and transitive resolutions, including exact version requests. Existing entries in `bun.lock` remain unchanged. `minimumReleaseAgeExcludes` permits named exceptions; none is recommended here. A missing registry publication timestamp passes the filter. [Tagged installation documentation](https://github.com/oven-sh/bun/blob/bun-v1.4.2/docs/pm/cli/install.mdx#minimum-release-age)

Commit `bun.lock` and use `bun install --frozen-lockfile` in CI. A frozen installation must fail if the manifests disagree with the lockfile. Explicit Playwright browser installation remains a separate command. [Bun installation documentation](https://bun.com/docs/pm/cli/install)

## Audit and overrides

Use `bun audit --audit-level=high`. It reads `bun.lock`, requests vulnerability advisories from the registry, and exits unsuccessfully for matching findings or a failed registry request. It does not modify dependency files. With `--json`, the returned report remains unfiltered while the severity threshold controls the exit status. [Tagged audit documentation](https://github.com/oven-sh/bun/blob/bun-v1.4.2/docs/pm/cli/audit.mdx)

Bun 1.4.2 has no `audit signatures` subcommand: its command parser accepts only the ordinary audit or `fix`, rejecting other positional subcommands. Do not represent the vulnerability audit as registry signature or provenance-attestation verification. The earlier npm signature result describes the earlier npm tree only. [Tagged audit implementation](https://github.com/oven-sh/bun/blob/bun-v1.4.2/src/runtime/cli/audit_command.rs)

Version-qualified override keys are supported in Bun 1.4.2, including the shapes `undici@5` and `path-to-regexp@6.1.0`. Bun compares selectors with each dependent's declared version range, so verify the resulting versions after migration. Overrides are read from the root manifest; one parent level is supported. Nested or version-qualified rules produce `lockfileVersion` 3, which older Bun versions cannot read. Preserve the existing selectors rather than broadening them to unrelated major versions. [Tagged override documentation](https://github.com/oven-sh/bun/blob/bun-v1.4.2/docs/pm/overrides.mdx)

## CI and Vercel

The current `oven-sh/setup-bun` release is v2.2.0 at commit `0c5077e51419868618aeaa5fe8019c62421857d6`. Its `bun-version` input accepts an exact version:

```yaml
- uses: oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6
  with:
    bun-version: '1.4.2'
```

The action itself runs on Node 24 inside GitHub Actions; that does not replace the project's separate Node 22 setup. [Verified release commit](https://github.com/oven-sh/setup-bun/commit/0c5077e51419868618aeaa5fe8019c62421857d6), [pinned action definition](https://github.com/oven-sh/setup-bun/blob/0c5077e51419868618aeaa5fe8019c62421857d6/action.yml)

Vercel detects Bun from `bun.lock`, but its package-manager documentation does not promise exact Bun patch selection from `packageManager`. `bunVersion` in `vercel.json` selects the functions runtime; it currently accepts `1.4.x` or `1.x`, with managed patches. Keep it absent for this Node 22 foundation. [Vercel package managers](https://vercel.com/docs/package-managers), [Vercel Bun runtime](https://vercel.com/docs/functions/runtimes/bun)

The installed `@vercel/build-utils@14.6.1` source selects `/bun1` for a Bun lockfile and defaults to Node when both Node and Bun engines are declared without `bunVersion`. Its inspected code contains no `BUN_VERSION` environment hook. Neither this inspection nor the official documentation establishes that setting `BUN_VERSION` pins Vercel's installer. Use an explicit, version-checked installation command for Bun 1.4.2 and keep function runtime selection separate. [Vercel installation and runtime-selection source](https://github.com/vercel/vercel/blob/main/packages/build-utils/src/fs/run-user-scripts.ts)

## Licence and verification boundary

The exact release's own `LICENSE.md` identifies Bun itself as MIT and separately lists linked libraries, including JavaScriptCore under LGPL-2 and tinycc under LGPL-2.1. Bun is external package-manager tooling here; its binary is not a product runtime dependency or an app asset. Record that distinction without calling the entire binary MIT-only. [Bun 1.4.2 licence](https://github.com/oven-sh/bun/blob/bun-v1.4.2/LICENSE.md)

The implementation passed a clean frozen Bun installation, the licence and archive-integrity check, the complete check and build, all three workspace test commands, an explicit Chromium installation and launch, and the real Vercel workspace-output probe. A separate fixture verified root install-script suppression through bunfig.toml alone. Exact command output is in [foundation evidence](../foundation/evidence.md). No deployment, Vercel linking, or repository setting was changed.

## Implemented bootstrap and update tracking

CI and Vercel share `scripts/install-bun.mjs`, which downloads an official 1.4.2 release archive, checks its pinned SHA-256 from `scripts/bun-release.json`, verifies the executable version, and installs into ignored `.vercel/bun/bin`. The hashes were read from the release’s own [SHASUMS256.txt](https://github.com/oven-sh/bun/releases/download/bun-v1.4.2/SHASUMS256.txt). This keeps exact package-manager selection separate from the Node Functions runtime.

Dependabot uses `package-ecosystem: bun` with the existing weekly runtime and tooling groups. GitHub documents the Bun ecosystem and text `bun.lock` support. [GitHub Dependabot reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference), [supported ecosystems](https://docs.github.com/en/code-security/reference/supply-chain-security/supported-ecosystems-and-repositories).

Both Vercel’s configured build and its function-builder fallback now use `vercel-build`, which invokes `.vercel/bun/bin/bun` explicitly and prepends that directory for nested commands. This also covers the builder’s managed-Bun launcher; the root and function-directory invocations passed. CI builds through the same entry.
