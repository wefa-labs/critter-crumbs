# Scene and onboarding verification

16 October 2026. Implemented locally on `codex/shared-shell`, alongside the earlier shared-shell changes, from deployed baseline `b908f4a`. The [review package](../../explorations/visual-review/index.html) keeps the new art and identity proposals separate from the implemented UI.

The tutorial now shares the launcher's room scale and floor anchors, with a short-floor portrait constraint. First meeting combines critter selection and the name in one stable dialog. Keeping saves both through the existing profile API; rerolls preserve the draft, including the fourth reroll that already locks the identity on the server. Tutorial step four explains proportions with public practice data passed through the production tally. Core, API implementation, database, generator, portrait painters, music assets and playback are unchanged.

## Verification

| Check | Result |
|---|---|
| Lint, typecheck and production build | Passed. The measured shell and Three chunk remain below their existing limits. |
| Full serial suite, `bun run test -- --maxWorkers=1` | **591 passed in 78 files**, followed by **21 passing offline tooling tests**. Existing timeouts unchanged. |
| Ordinary parallel `bun run check` | Not green. First run reported four outdated scene-reference expectations and eight API timeouts. The scene expectations were updated to the approved composition; the full serial run above passes all cases. |
| Development assets, workspace probe, licences/archive integrity | Passed. The workspace probe required temporary and Bun cache directories under the writable scratch folder; its intentional source-export failure and successful built-export case both behaved as expected. |
| Vulnerability audit | Blocked: npm's advisory endpoint returned HTTP 403 on both attempts. No fresh vulnerability result is claimed. |
| CLI browser suite | Could not launch. Chromium's headless shell was denied its macOS Mach-port registration; full Chromium and WebKit also aborted. No passing CLI browser run is claimed for this change. |
| In-app browser | 60 tutorial states checked, plus onboarding, persistence, invite continuation, keyboard scrolling and review pages, as detailed below. |
| Review builds | Both visual review scripts and their TypeScript checks pass. Music auditions regenerate from the shipped tracks with ffmpeg; source and review hashes are preserved in `media/provenance.json`. |
| Whitespace | `git diff --check` passes. |

The eight parallel API timeout cases were in `tests/api/dev.test.ts` and `tests/api/gathering.test.ts`: hidden development controls in production/real mode, seeding both feasts and a draft, cancel/extend at the exact deadline, and open/cancel by a non-creator. They all pass in the unchanged-timeout serial suite. The ordinary parallel aggregate command remains non-green; the serial result does not erase that limitation.

## Browser evidence

The 48 dark-mode tutorial states cover four steps at 320 × 568, 375 × 667, 375 × 812, 390 × 844, 1280 × 720 and 1440 × 900, in both development v2 and production-parity v1. Another 12 states cover light mode at 375 × 667, 390 × 844 and 1280 × 720 with v1, Still critters and Simple view selected. Document bounds match the viewport and the actions stay fixed. Each step focuses its heading. On short displays, keyboard End scrolls the named content region while Got it stays in place; at 390 × 844 the complete result explanation fits without internal scrolling.

A 320 × 568 capture exposed a grown v1 critter's clipped head. The short-floor width cap fixes it without changing its painter or the room's zoom. Onboarding's longest reroll label also wrapped the footer to 75 px at that width; equal-width 52 px actions now preserve its geometry through all four rerolls. The final four-reroll browser check retained the name draft at every step, saved successfully and stayed complete after reload. Existing locks are never reversed.

First-time connection from a burrow link prompts for critter and name together, then keeps the same destination. Joining the burrow remains its own existing action. A longer name was saved and confirmed in the profile menu after reload. API tests separately verify one-write name/Keep persistence across sessions, rejection of another reroll after locking, and the existing ENS contract. Live ENS lookup, a physical phone keyboard, assistive speech and a real-device browser were not tested.

Representative current captures:

- [First meeting at 320 × 568, v2](images/meeting-320-light-v2.jpg), [first meeting from an invite](images/meeting-invite-375-light-v2.jpg), [desktop first meeting, v1](images/meeting-1280-light-v1.jpg).
- [Complete result example at 390 × 844, v2](images/tutorial-results-390-light-v2.jpg), [v1 in light mode on desktop](images/tutorial-results-1280x720-v1-light.jpg), [v1 on a very short dark phone](images/tutorial-results-320x568-v1-dark.jpg).
- [Keyboard-scrolled result at 320 × 568](images/tutorial-scrolled-320-light-v2.jpg).
- Geometry records: [dark tutorial matrix](tutorial-geometry.json), [light and still matrix](tutorial-light.json), [all four rerolls](onboarding-geometry.json), [keyboard scrolling](keyboard-scroll.json).

The browser regressions in `tests/e2e/first-steps.spec.ts` cover a fresh injected test account, a failed save, four rerolls, invite continuation and responsive tutorial actions. Existing launcher, session and shared-shell checks now describe the combined meeting and fourth step. They are typechecked but await a working CLI browser runtime. The in-app checks above are separate evidence, not a substitute claim that the CLI suite passed.

## Review package

Claude's original worktree is preserved. The main checkout now holds the gallery source and bundle, all comparison images, corrected static mocks, scene notes, audio analysis tools, four-pass auditions, seam close-ups, rebuild entrypoints and provenance. The gallery opens in Still mode from the index and reports that state correctly. Its 635 SVG drawings load without script errors. The corrected static proposals contain six frames with all nine action buttons inside their frames. All 37 audio players use local review files; the auditions were rebuilt and measured, not listened to or accepted as musical improvements.

Critter direction, species count, renderer performance, generator/version persistence and identity migration remain for review before integration. The global portrait night-grade patch and per-track playback proposals also remain review material. Production still selects v1; development still ordinarily selects v2. Neither new exploration painter enters the application bundle. No dependency, analytics, deployment or onchain action was added.

Cached Modern Web Guidance was unavailable and was not refreshed. Implementation follows the repository's existing tokens and native semantic controls, bounded scrolling, focus, still-motion and viewport contracts. The full dev coordinator hit the machine's watcher limit, so the repo's API and Vite entrypoints were used on separate local listeners with isolated mock data and polling. The earlier listeners were left untouched.
