# npm policy verification

Checked 2026-09-04 for Phase 1 verification items 3 and 4; updated after the npm 10 installation failure.

**Selected toolchain:** Node 22.22.1 with npm 11.19.1. The bundled npm 10.9.4 crashed while resolving the required development dependencies. npm 11.19.1 contains a relevant peer-resolution fix, supports a seven-day release delay, and verifies installed signatures without applying that delay again. Keep `ignore-scripts=true`. Final clean-install and complete build proof remain pending.

## Why npm changed

The bundled executable was verified with:

```bash
/Users/afo/.local/share/mise/installs/node/22.22.1/bin/node \
  /Users/afo/.local/share/mise/installs/node/22.22.1/lib/node_modules/npm/bin/npm-cli.js \
  --version
```

It printed `10.9.4` and exited successfully. Its shipped `lib/commands/audit.js` includes the `signatures` command. Its configuration definitions contain `before` and `ignore-scripts`, but neither `min-release-age` nor `cooldown`. The npm 10.9.9 definitions also lack both release-delay names. A patch upgrade within npm 10 would not add that capability. [npm 10.9.9 configuration source](https://raw.githubusercontent.com/npm/cli/v10.9.9/workspaces/config/lib/definitions/definitions.js)

The initial plan to retain bundled npm was superseded by installation evidence. Two npm 10.9.4 attempts failed, as reported by the implementation agent. I inspected the second log at `/private/tmp/critter-crumbs-npm-cache/_logs/2026-09-05T05_32_56_105Z-debug-0.log`; it records Node 22.22.1, npm 10.9.4, exit 1, and this failure:

```text
TypeError: Cannot read properties of null (reading 'edgesOut')
at #loadPeerSet (.../@npmcli/arborist/lib/arborist/build-ideal-tree.js:1289:38)
```

The shipped npm 10 source dereferences `node.parent.edgesOut` there without checking whether `node.parent` still exists. npm's merged PR #8448 explains how recursive peer resolution can detach the current node. The versioned npm 11.19.1 source checks for a missing parent before that dereference. This is direct source evidence for trying the upgrade; only a successful installation proves it resolves this repository's dependency tree. [npm peer-resolution fix](https://github.com/npm/cli/pull/8448), [npm 11.19.1 Arborist source](https://raw.githubusercontent.com/npm/cli/v11.19.1/workspaces/arborist/lib/arborist/build-ideal-tree.js)

## Selected version, engine and licence

npm 11.19.1 is the newest npm 11 release listed in the official changelog checked here, dated 2026-08-25. Its manifest accepts Node `^20.17.0 || >=22.9.0`, including Node 22.22.1. [npm 11 changelog](https://docs.npmjs.com/cli/v11/using-npm/changelog/), [versioned manifest](https://raw.githubusercontent.com/npm/cli/v11.19.1/package.json)

The implementation agent installed npm under `/private/tmp/critter-crumbs-npm11`, outside the repository, without replacing the workstation's global npm. Reading that installation's manifest and configuration definitions produced:

```json
{
  "npm": "11.19.1",
  "license": "Artistic-2.0",
  "node": "^20.17.0 || >=22.9.0",
  "config": {
    "min-release-age": true,
    "min-release-age-exclude": true,
    "ignore-scripts": true,
    "allow-scripts": true,
    "strict-allow-scripts": true
  }
}
```

Both the downloaded package's own `LICENSE` and its manifest identify Artistic-2.0. The upstream versioned files agree. npm remains external package-manager tooling and is not one of the product's runtime dependencies; its licence must be recorded as Artistic-2.0, not described as one of the runtime allow-list licences. [npm 11.19.1 licence](https://raw.githubusercontent.com/npm/cli/v11.19.1/LICENSE)

## Release delay and signatures

npm introduced `min-release-age` in 11.10.0. The selected version defines it in days, so the `.npmrc` value `min-release-age=7` expresses a seven-day delay for dependency resolution. `before` accepts an absolute cutoff instead. `min-release-age-exclude` supports package exceptions, but no exception is proposed here. The first reviewed exact pins were selected before enabling this new policy. [npm 11.10.0 release](https://github.com/npm/cli/releases/tag/v11.10.0), [npm 11.19.1 configuration definitions](https://raw.githubusercontent.com/npm/cli/v11.19.1/workspaces/config/lib/definitions/definitions.js)

Use plain `npm audit signatures`. Issue #9277 reported that older npm versions wrongly reapplied the release delay when fetching metadata for already-installed versions. PR #9430 fixed that behavior. The selected local npm's `lib/utils/verify-signatures.js`, line 310, sets `before: null` after its configuration spread; the versioned source does the same. No command-specific release-delay override is necessary for this check. [Reported signature failure](https://github.com/npm/cli/issues/9277), [merged fix](https://github.com/npm/cli/pull/9430), [versioned verification source](https://raw.githubusercontent.com/npm/cli/v11.19.1/lib/utils/verify-signatures.js)

The implementation agent reports that signature verification passed with `min-release-age=7`: 853 registry signatures and 167 attestations. These counts describe the tree before the final clean-install remediation; repeat the check if that tree changes and use the final evidence for the pull request.

## Install scripts and remaining proof

`ignore-scripts=true` suppresses lifecycle scripts during installation. Explicit `npm test` and `npm run build` commands still run their named scripts; automatic pre/post hooks remain suppressed. Required build steps must therefore appear within the named commands. [npm 11 script configuration](https://docs.npmjs.com/cli/v11/using-npm/config/#ignore-scripts)

npm 11.19.1 also offers `allowScripts` policy and `strict-allow-scripts`. With strict mode enabled, unreviewed install scripts cause failure; without it, npm 11 warns and runs them. `ignore-scripts` overrides this policy, so retain it while verifying that the toolchain works without lifecycle scripts. No package-specific script exception has been established. [npm 11.19.1 script-policy definitions](https://raw.githubusercontent.com/npm/cli/v11.19.1/workspaces/config/lib/definitions/definitions.js)

At this update, the implementation agent is preparing the final clean dependency tree. `npm ci`, `npm run check`, `npm run build`, and the explicit Playwright browser installation must still establish toolchain compatibility. The npm 10 crash, npm 11 source inspection, and signature results above must not be reported as passing those separate checks.

The clean install enforced the seven-day delay and rejected recent direct pins. Older eligible versions were selected for React DOM types, the TypeScript ESLint tools, Playwright, Vercel, and viem; exact final pins are in the manifests. No release-age exception was added.

## Compatibility result

A fresh `npm install` with npm 11.19.1, `ignore-scripts=true`, and `min-release-age=7` completed successfully. No package-specific script or release-age exception was used. Playwright 1.62.1 installed Chromium explicitly into an OS temporary directory, then launched and closed Chromium 151.0.7922.34 successfully. No lifecycle E2E exists in this phase. The final clean-install/check/build outputs are recorded separately in `docs/foundation/evidence.md`.
