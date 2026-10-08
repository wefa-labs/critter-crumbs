# Validation

The repair of 7 October 2026, checked on its final commit. Toolchain: Bun 1.4.2 and Node 22.22.1, with commands prefixed `mise exec node@22.22.1 --`; `bun run dev:local` serving the app for the browser checks.

## Commands

| Command | Result |
|---|---|
| `bun run check` | Pass, exit 0. Lint, types, generated tokens, 66 test files with 484 tests, development archive integrity, workspace exports and dependency licences. The audit finds no high advisories (795 packages). The one ignore is braces' GHSA-vfj7-8cjw-p6xm, which has no fixed release and is recorded in `docs/decisions.md`. `source-map-js` is overridden to the fixed 1.2.2, so PR #35's earlier exception for GHSA-68fv-2mgg-jv7q no longer applies. |
| `bun run build` | Pass, exit 0. Gzip shell 112,199 of 120,000 bytes; Three 249,820 of 250,000. |
| `bun run e2e` | 16 of 16 pass. Covers: the people and options lifecycles in Simple view and 3D; reconnect; gathering privacy; reading on desktop through to "Scattered."; and the deadline passing with the scatter screen open, which closes the same screen with the allocation kept and then lays the feast out. |
| `bunx playwright test --config playwright.screens.config.ts` | 97 of 97 pass (spec files listed below). |
| `bun run screens:capture` | 42 of 42 pass: 21 states on phone and desktop, no runtime errors, no notice card, every visible target at least 44 px, and the result actions present. |
| `bun run demo:record` | 2 of 2 pass. Each film is checked after encoding: H.264, yuv420p, 30 fps, at the viewport size, 60–90 s. Phone 85.67 s at 390×844; desktop 80.83 s at 1440×900. |

The screens suite is made of these spec files:

- `compositions.spec.ts`: each state against the review pages' numbers.
- `sweep.spec.ts`: every core state at 375×812, 430×932, 1280×800, 1440×900 and 1920×1080, with 4, 8 and 10 critters.
- `layout.spec.ts`: the tags at every focus, for the scattering circle and the circle after the feast, at the same five sizes with 4, 6, 8 and 10 critters, within design pass §21's tolerances.
- `live.spec.ts`: the real API at all five sizes:
  - tap, hold and take back;
  - the typed amount;
  - reading on the phone and in the desktop panel;
  - turning, and your own critter stirring;
  - confirm and cancel;
  - offline and online.
- The foundation, painter and reference checks.

## What the browser checks hold the app to

`tests/screens/compositions.spec.ts` takes its expected values from the review pages, not from the app:

- the sheet heights: reveal 230, waiting and key 250, feast 144, nobody 260;
- the 130 px dock across the floor;
- on the phone, the results card leaving 196 px of floor;
- on desktop, the folded 74 px dock level with the panel's 74 px bar;
- the 400–480 px side panel;
- the toast 16 px (20 px on desktop) under the header, centred over the floor;
- the confirm dialog as a bottom sheet or a centred 460 px card;
- the 378 px statement bubble at 12 px, with its three-puff trail;
- the reveal's seven bubbles, each a finger-sized target;
- the closed state's dimmed controls and sleeping circle;
- no notice card in any state.

## Review

The repair went through the repository's two-axis review, run as two parallel reviewers. Everything they raised was fixed, except the replay finding below. Commit `0927c02` lists the fixes.

- **Spec findings:**
  - an unverified save reported as a failed one;
  - scattering closed not reachable live;
  - the record button no longer offered to the creator first;
  - missing evidence and coverage;
  - copy IDs missing from Design System §10.
- **Standards findings:**
  - live regions beyond the two announcers;
  - the lost "Your crumbs" landmark;
  - literal sizes in place of tokens, and black shadows;
  - strings built in components;
  - duplicated dock-middle logic and name lookups.

One Spec finding is left for Afolabi: Replay hides the results while the feast plays, as the flow page's Replay does, where Game Design G3 says the table stays. See [mismatches.md](mismatches.md).

Recording the desktop film found one more defect: arriving through the statements left desktop in a reading state that hid "Scattered.". Its fix and regression test are in `1959837`.

## Not verified

- The flights and feel on a real phone.
- The painted floor-first plates, which are not drawn yet.
- Sound. Playwright records silent films; the sound cues are unchanged.
- A visual match to the pixel. The pairs in `compare/` were judged by eye, and [mismatches.md](mismatches.md) lists the differences kept on purpose.
