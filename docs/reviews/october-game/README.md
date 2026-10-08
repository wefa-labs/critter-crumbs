# October game review evidence

This folder is the evidence for the October core game, as repaired on 7 October 2026 to follow the design artifacts:

- the scatter page, pass eleven (`docs/explorations/scatter-layouts/`);
- the flow page's screens 34–50 (`docs/explorations/app-screens/`).

PR #35's first version claimed "M4 complete". It did not hold: every state used the scattering dock with a notice card on top. [mismatches.md](mismatches.md) records what each state should have been, what it was, and what it is now.

The launcher, connect, first steps, burrows, feast setup, gathering, profile and general error notices are outside this redesign. They keep their flows and notices. In the core game, the app's error alert now appears as the game's toast at the top of the floor.

[Phone rehearsal](demo/phone.mp4) · [Desktop rehearsal](demo/desktop.mp4) · [Demo beats and recording notes](demo/README.md) · [Validation](validation.md)

## How it was checked

1. **Side by side with the reference.** Every state was captured next to its reference frame at the same size and with the same data:
   - phone 375×812;
   - desktop 1440×900 for scatter page states, 1280×800 for flow page states.

   The pairs are in `compare/`, with the reference on the left. They were compared by eye; [mismatches.md](mismatches.md) lists the differences kept on purpose.
2. **Against the reference pages' own numbers.** `tests/screens/compositions.spec.ts` and `tests/screens/sweep.spec.ts` assert what the pages specify, not what the app happens to draw. The sweep covers every state at 375×812, 430×932, 1280×800, 1440×900 and 1920×1080, with 4, 8 and 10 critters.
3. **Design pass §21's tolerances at every focus.** `tests/screens/layout.spec.ts` checks the scattering circle and the circle after the feast.
4. **Live, through the real game.** `tests/screens/live.spec.ts` and the e2e suite exercise:
   - tap, hold and take back, and the typed amount;
   - reading, confirming and saving;
   - a refused save, and the deadline passing with the screen open;
   - the feast, results and CSV.

A passing test is not taken as proof that the design matches; the pairs are.

## Captures

The gallery uses the scatter page's seed: eight critters, Moss in focus, 88 of 100 crumbs given while scattering. Captures are 390×844 and 1440×900; `bun run screens:capture` writes them as PNG to `.scratch/screens/`, and the copies here are JPEG to keep the repository small.

| State | Phone | Desktop | Against the reference |
|---|---|---|---|
| Statements open | [image](screens/reveal-390.jpg) | [image](screens/reveal-1440.jpg) | [phone](compare/reveal-phone.jpg) · [desktop](compare/reveal-desktop.jpg) |
| Scattering | [image](screens/scatter-390.jpg) | [image](screens/scatter-1440.jpg) | [phone](compare/scatter-phone.jpg) · [desktop](compare/scatter-desktop.jpg) |
| Reading a statement | [image](screens/reading-390.jpg) | [image](screens/reading-1440.jpg) | [phone](compare/reading-phone.jpg) · [desktop](compare/reading-desktop.jpg) |
| All crumbs given | [image](screens/done-390.jpg) | [image](screens/done-1440.jpg) | [phone](compare/done-phone.jpg) · [desktop](compare/done-desktop.jpg) |
| Confirm your scatter | [image](screens/signing-390.jpg) | [image](screens/signing-1440.jpg) | [phone](compare/signing-phone.jpg) · [desktop](compare/signing-desktop.jpg) |
| Saving | [image](screens/saving-390.jpg) | [image](screens/saving-1440.jpg) | [phone](compare/saving-phone.jpg) · [desktop](compare/saving-desktop.jpg) |
| Saved and toast | [image](screens/scattered-390.jpg) | [image](screens/scattered-1440.jpg) | [phone](compare/scattered-phone.jpg) · [desktop](compare/scattered-desktop.jpg) |
| Not signed | [image](screens/rejected-390.jpg) | [image](screens/rejected-1440.jpg) | [phone](compare/rejected-phone.jpg) · [desktop](compare/rejected-desktop.jpg) |
| Could not save | [image](screens/failed-390.jpg) | [image](screens/failed-1440.jpg) | [phone](compare/failed-phone.jpg) · [desktop](compare/failed-desktop.jpg) |
| Scattering closed | [image](screens/closed-390.jpg) | [image](screens/closed-1440.jpg) | [phone](compare/closed-phone.jpg) · [desktop](compare/closed-desktop.jpg) |
| Feast being laid out | [image](screens/waiting-390.jpg) | [image](screens/waiting-1440.jpg) | [phone](compare/waiting-phone.jpg) · [desktop](compare/waiting-desktop.jpg) |
| Key not out yet | [image](screens/key-390.jpg) | [image](screens/key-1440.jpg) | [phone](compare/key-phone.jpg) · [desktop](compare/key-desktop.jpg) |
| Feast sequence | [image](screens/feast-390.jpg) | [image](screens/feast-1440.jpg) | [phone](compare/feast-phone.jpg) · [desktop](compare/feast-desktop.jpg) |
| After the feast, results closed | [image](screens/feasted-390.jpg) | [image](screens/feasted-1440.jpg) | [phone](compare/feasted-phone.jpg) · [desktop](compare/feasted-desktop.jpg) |
| Results | [image](screens/results-390.jpg) | [image](screens/results-1440.jpg) | [phone](compare/results-phone.jpg) · [desktop](compare/results-desktop.jpg) |
| Nobody scattered | [image](screens/nobody-390.jpg) | [image](screens/nobody-1440.jpg) | [phone](compare/nobody-phone.jpg) · [desktop](compare/nobody-desktop.jpg) |
| One scatterer and tie | [image](screens/tie-390.jpg) | [image](screens/tie-1440.jpg) | [phone](compare/tie-phone.jpg) · [desktop](compare/tie-desktop.jpg) |
| Who gave what | [image](screens/givers-390.jpg) | [image](screens/givers-1440.jpg) | [phone](compare/givers-phone.jpg) · [desktop](compare/givers-desktop.jpg) |
| Recording a public result | [image](screens/recording-390.jpg) | [image](screens/recording-1440.jpg) | [phone](compare/recording-phone.jpg) · [desktop](compare/recording-desktop.jpg) |
| Result recorded | [image](screens/recorded-390.jpg) | [image](screens/recorded-1440.jpg) | [phone](compare/recorded-phone.jpg) · [desktop](compare/recorded-desktop.jpg) |
| Public aggregate results | [image](screens/public-390.jpg) | [image](screens/public-1440.jpg) | [phone](compare/public-phone.jpg) · [desktop](compare/public-desktop.jpg) |

## How the game is put together now

- **The composition table.** `packages/app/src/game/composition.ts` says what each state shows:
  - its surface: the dock, a sheet of a given height, or the results grown out of the dock;
  - how the scene is treated: the scene, the light, the mood, bubbles, tags, piles, heap, huddle and controls.

  The live screens and the gallery both render from it.
- **The geometry.** `game/layout.ts` is pure: the scatter page's circle and huddle, and the flow page's ring under a sheet.
- **The pieces each surface is made of.** `game/dock.tsx`, `game/sheets.tsx` and `game/surface.tsx`.
- **What a new state needs.** A row in the composition table, its pieces, and a row in the reference specs.
- **What a new scene or creature needs.** A scene is images plus a manifest entry (`scripts/scene-layers.mjs`). A creature version is a generator and painter behind the version switch.

Production still uses the frozen v1 generator and painter. Development and these demos use the portrait-only v2.

## Feedback still needed

- [mismatches.md](mismatches.md) lists the calls this repair made for Afolabi to confirm. The biggest are:
  - one floor-first scene for every state;
  - the scatter page's results container for every result variant;
  - Replay hiding the results while the feast plays.
- When v2 ships (DQ5), whether it gains a mesh, and the 3D render style.
- The eight out-of-scope screens wait for the next design pass.
