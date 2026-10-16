# Shared shell verification — 15 October 2026

The first QA implementation pass adds a viewport shell with internal page scrolling, a shared native dialog/sheet frame with pinned actions, critter-face profile navigation, whole-card burrow links, and visible notifications for discrete outcomes. Copying an address or burrow link confirms success only after the clipboard write; failures show an actionable error. Notifications work inside the active dialog, preserve focus, and pause for either hover or keyboard focus.

Implementation branch: `codex/shared-shell`, based on the matched deployed revision `b908f4a`. Changes are local. No generator, music asset, account, membership, feast lifecycle, encryption, or tally rule changed. The [Claude Code brief](../explorations/claude-code-visual-brief-2026-10-15.md) covers the separate art, scene-proportion, and music work.

## Evidence

| Check | Actual result |
|---|---|
| Full browser suite, `bun run e2e --reporter=line` | 34 passed, including Simple view/3D lifecycles, gathering, reconnecting, themes, renderer recovery, and sound. |
| Final shared-shell suite, `bun run e2e tests/e2e/shared-shell.spec.ts --reporter=line` | 7 passed. Includes two additional cases for first-meeting footer submission and combined hover/focus notification timing: 36 distinct browser cases covered across the runs. |
| `bun run lint` and `bun run typecheck` | Passed after the final changes. |
| `bun run build` | Passed. Shell 115,385 / 120,000 gzip bytes; Three chunk 198,469 / 250,000. |
| `bun run check` | **Not green:** 585 tests passed; four API tests exceeded their existing 15-second timeout in the full two-worker run. |
| Serial rerun of the four failures | All four passed with one worker and unchanged timeouts; 45 other cases were intentionally filtered out. All 21 subsequent offline tooling tests passed. |
| Development assets, workspace exports, licenses/archive integrity, vulnerability audit | Passed separately because the failed test stage stopped the aggregate check. Audit reported no vulnerabilities at the configured high threshold; the existing reviewed ignore remained. |
| `git diff --check` | Passed. |

The full-run timeout cases were:

- `tests/api/database.test.ts`: read-only transaction options.
- `tests/api/dev.test.ts`: shared injected clock and mock key release.
- `tests/api/gathering.test.ts`: a departed creator cannot cancel a gathering feast.
- `tests/api/portrait-view.test.ts`: current identities without statement leakage or target changes.

Serial verification command:

```sh
bun run test -- --maxWorkers=1 tests/api/database.test.ts tests/api/dev.test.ts tests/api/gathering.test.ts tests/api/portrait-view.test.ts -t 'honors read-only|dev time sets|a departed creator cannot cancel|feast portraits reuse'
```

The results suggest load-sensitive timeouts; they do not make the ordinary parallel aggregate check green. No backend code or timeout threshold was changed to obtain the rerun result.

## Browser coverage and captures

The connection regression first reproduced a phone sheet growing from 178 px while loading to 722 px with choices. It now verifies unchanged frame and Cancel bounds through loading, choices, and signing on phone and desktop.

Navigation checks cover profile → settings → focus return, returning to burrows, entering through card metadata, and starting another burrow from within a burrow. Document dimensions match the viewport at 375 × 812, 390 × 667, 1280 × 720, and 1440 × 900. The profile's Disconnect control remains in its footer. First-meeting form submission is checked at the short phone size without changing the existing name/critter sequence.

Clipboard checks cover actual writes, repeat success, dismissal focus, failure after a previous success, one pair of live regions in the active modal, and notification expiry after hover/focus leave. Frequent scatter-count announcements remain separate from visual notifications.

Screenshots are generated under `.scratch/shared-shell/` by the regression suite, including phone/desktop burrows, profile navigation, and an address-copy notification. These are functional previews using development-default v2 critters, not approval to switch production art. Physical mobile keyboards, mobile Safari, and assistive-technology speech were not directly tested; the browser checks verify layout, focus, and live-region structure in Chromium.

The local mock app/API used a separate test-data directory. No production account or data was used. Cached Modern Web Guidance was unavailable and was not refreshed; implementation follows repository guidance, native dialogs, semantic links/buttons, existing tokens, and reduced-motion handling.
