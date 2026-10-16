# Claude Code handoff: complete Garden Spirits delivery

Finish visual review and delivery of the painted Garden Spirits package in `/Users/afo/Code/wefa/critter-crumbs`, on branch `codex/shared-shell`. The implementation is committed locally. Continue from it; inspect the existing work before changing anything.

## Authority and scope

Read `AGENTS.md`, the four numbered specs and the latest entries in `docs/decisions.md`. Use the repository's required skills. The user approved painted Garden Spirits, eight species, portraits first, explicit opt-in migration, and then asked Codex to execute the refinement brief, integrate the changes and push with an easy rollback. Their latest request is for this Claude completion prompt.

The current integration is a review preview. Final art acceptance and personal adoption remain pending. Preserve production v1, saved generator/renderer versions, variants, reroll counts, locks and frozen feast snapshots. Do not activate adoption, assign a production v3 recipe, deploy, merge, change music or force existing people onto the new drawings. The earlier refinement brief's restriction against app imports was superseded by the user's later integration request.

## Completed state

- Pre-art checkpoint: `d9d53aa322e6193fc5e0b2e13a940810e5c89d69`, tagged `rollback/pre-garden-2026-10-16`. It contains the shared shell, stable dialogs, navigation, notifications, combined onboarding, results tutorial and versioned identity storage.
- Art commit: `681524068a5ec9abbf9f5dae5bc6b65baed4dbc9`, tagged `review/garden-refined-2026-10-16`.
- Eight refined species, three matching variants each, 24 standalone SVGs, face crops, silhouettes, expression and motion studies, integrated app captures, anchors, hashes and performance evidence.
- Review integration uses `?critters=garden` in development. Production-style review builds also require `VITE_GARDEN_REVIEW=true`. Ordinary production builds retain v1 and omit the review painter chunk. `?critters=1` plus reload restores the baseline immediately. The renderer is labelled `garden-refined-review-1` over frozen v2 comparison inputs; it is not a new stored identity version.
- Short-phone tag collisions are repaired. All ten focus positions have separate tags at 320 × 568. Tags may sit below a critter on short floors, where portrait bounds are soft obstacles; piles, heap, thought bubble and dock remain hard exclusions.
- Crumb-holding remains a gallery alternative, off in the integrated painter.

## Primary inputs

1. `docs/explorations/garden-refinement/README.md`: complete implementation, validation, limitations and rollback record.
2. `docs/explorations/garden-refinement/index.html`: interactive review gallery. Existing local Vite serves it at `http://127.0.0.1:5174/@fs/Users/afo/Code/wefa/critter-crumbs/docs/explorations/garden-refinement/index.html`.
3. `docs/explorations/claude-code-critter-refinement-2026-10-16.md`: original visual brief with its supersession note.
4. `packages/app/src/portraits/garden/`: actual refined painter, shared with the gallery.
5. `docs/reviews/versioned-identity-2026-10-16.md` and ADR 0005: persistence boundary.

## Remaining work

Inspect the final diff and gallery. Check art coherence, individual recognition, small faces, scene proportions, expressions and the review/rollback boundary. Fix concrete issues within this scope, preserving the existing visual direction. Avoid reopening resolved direction choices or rebuilding the cast from scratch. If you change drawings, regenerate affected SVG exports, hashes, fixtures/anchors, gallery bundle and captures. Benchmark only after builds/tests finish, in a visible browser; record the actual browser and viewport.

Complete the authorized push of `codex/shared-shell` and both tags without force. The attempted push failed with `nc: connection failed, SOCKS error 2` before reaching GitHub. Earlier `gh auth status` reported an invalid token for the active account, and the connected GitHub integration returned 404 for this repository. Use normal supported GitHub authentication/connectivity. If access remains unavailable, ask the user to restore it and report the exact blocker; do not disable protections, change permissions policy or print credentials.

After access is restored, fetch and inspect the remote state, handle any divergence without discarding work, then push:

```sh
git push --atomic origin codex/shared-shell refs/tags/rollback/pre-garden-2026-10-16 refs/tags/review/garden-refined-2026-10-16
```

Push is already authorized. Deployment and merge are not. Report the review URL, branch/commit, push result, validation and rollback command. If an appropriate PR already exists, inspect it before changing its description; do not create duplicate review work. Any newly created PR must remain draft and follow repository title, body and label conventions.

## Verification already completed

Use Bun 1.4.2 and Node 22.22.1. Installed binaries are under `/Users/afo/.local/share/mise/installs/{bun/1.4.2,node/22.22.1}/bin`.

- Full serial run: **601 tests in 81 files**, plus **21 offline tooling tests**, passed with unchanged timeouts. Command: `bun run test -- --maxWorkers=1 --reporter=verbose`; 824 seconds. Log: `.scratch/garden-check/test-final.log`.
- Lint, workspace/tools typecheck and gallery typecheck passed.
- Ordinary build: shell 116,405 / 120,000 gzip bytes; Three 198,469 / 250,000.
- Review-enabled build: shell 116,842 / 120,000; Three 198,469 / 250,000. Refined art remains lazy, about 14 KB gzip.
- Development assets, workspace probe, licences and archive integrity passed. The workspace probe needed writable scratch temporary/cache directories.
- Production-style browser startup: four refined launcher portraits under the review query; four baseline portraits and no refined portraits after `?critters=1`; no fresh console errors.
- SVG parse/reference validation passed for all 24 exports; corrected gallery had no duplicate IDs.
- Standards and Spec reviews: no actionable findings, including an incremental review of the short-phone repair.
- Final visible Chromium 155 samples: ten refined portraits at 60 fps on desktop and phone-width viewports; prototype 5.1 fps on desktop. These are six-second local observations, not physical-phone or Safari proof. Earlier samples varied around 50–54 fps.

Do not repeat the entire passing suite without a new change or unresolved concern. Run focused checks for any new edits and the required checks before delivery. The initial aggregate check and first redirected serial attempt stalled at startup and were interrupted; the later full serial run completed. `bun run check` is not claimed green: npm's advisory endpoint returned HTTP 403, so no fresh audit result is available. CLI browser launches were blocked by macOS Mach-port errors in earlier work; in-app browser evidence is separate. Cached Modern Web Guidance was unavailable and not refreshed. A separate existing HMR teardown error can blank a fixture after source updates; a full reload restores it. Do not silently broaden this task to repair it.

## Rollback and working tree

Immediate visual rollback: open the same route with `?critters=1` and reload. Build rollback: remove `VITE_GARDEN_REVIEW`. Code rollback:

```sh
git revert review/garden-refined-2026-10-16
```

This preserves the checkpoint's shell and identity storage. The art adds no database migration or identity writes, so it needs no database rollback. If you make further art commits, record the additional revert commands and preserve the original tags. Do not reset the branch or move existing tags.

At handoff, the implementation working tree was clean except for pre-existing untracked `.codex/` and this newly written handoff file. Leave `.codex/` untouched. The two local commits used a per-command signing override because the configured signing helper was unavailable; no persistent Git configuration was changed. No push, deployment, production migration, personal adoption or onchain action succeeded or was performed.
