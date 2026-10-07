# October core game: reference-versus-app mismatches

Opened 2026-10-07 for the repair of PR #35, after Afolabi rejected the implementation for not following the screen designs. Every row compares the review page frame with `/dev/screens?capture&state=…&count=8&scene=window`. Both are rendered at the same size: 375×812 on the phone; on desktop, 1440×900 for scatter-page states and 1280×800 for flow-page states. Captures come from `.scratch/compare/capture.mjs`.

The functional tests on PR #35 passed, but they assert counts, text and target sizes. They are not evidence of fidelity, and the earlier "M4 complete" claim does not hold.

## Sources

- **Scatter page:** `docs/explorations/scatter-layouts/index.html`, pass eleven. Covers scatter, reading, all given, scattered and results.
- **Flow page:** `docs/explorations/app-screens/index.html`, screens 34–50, in `SCREENS`. Covers reveal, sign, saving, saved, sign-rejected, save-failed, scatter-closed, waiting, key-not-yet, feast, results-nobody, results-one, givers, attest, recorded and visitor.
- **Afolabi's words** (design pass, Appendices A–H) win where the sources disagree.

## Normalisation

- Look: Inked daylight.
- Eight critters, Exact piles, the window scene, Moss in focus.
- The scatter page's own allocation: 88 crumbs given, 12 left (`castFor(8)`).
- Animations off.

PR #35's gallery fixture gives nothing in the empty states and gives all 100 to Moss in the others. That difference is data, not layout; the fixture is being changed to the reference allocation so the comparison is like for like.

## Cross-cutting faults

These affect most states.

1. **One generic layout for every state.** Every state renders `GameScene` with the scattering dock, then lays a `GameNotice` card (title, line, Close) over the top of the floor. The reference gives each state one surface of its own:
   - the scattering dock;
   - a sheet of a given height (230, 250, 144, 260, 470, 520, 540 or 590 px), which becomes the side panel on desktop;
   - the results card grown out of the dock.

   Failures are toasts, and the confirmation is a dialog. Repair: a surface model in `game/surface.tsx`, used by `read.tsx`, `scatter.tsx`, `results.tsx`, `public-results.tsx` and the gallery.
2. **The desktop side panel is empty** while scattering, reading and in every sheet state. Pass eleven keeps the focused critter's statement in it (name, element chip, "You" for your own, the paragraphs). Sheet states put their content there. Repair: `game/parts.tsx` and the surface model.
3. **The focus row:**
   - The typed-amount field (`NumberField`, Game Design §2.6, which must stay) renders as a separate monospace "0" under the name, where the reference has "Moss" over "24", 20 px, weight 800, tabular.
   - The bar middle repeats the count ("100" then "100 to go"); the reference shows a 24 px crumb, "12" at 28 px weight 800, then "to go".
   - On the phone, the reference adds "Scattering closes in 2 days" under the count.

   Repair: `scatter.tsx` (`ScatterControls` and the middle), `game.css`.
4. **The header's closing day** (desktop) reads "Closes Mon, Oct 12, 9:00 AM PDT". The reference reads "Scattering closes in 2 days · Wed 7 Oct, 18:00 (PDT)" (`deadline.scattering` with the absolute time) and, at the feast, the summary "7 of 8 scattered · 700 crumbs in all". Repair: `GameFrame`, copy.
5. **The floor** is four separate crops in an SVG pattern with no perspective parent, so it renders flat with visible seams. The reference tilts one mirrored floor tile (`rotateX(56deg)` inside `perspective: 760px`) under a shade, the wall band and the masked corners. Repair: `game/scenes.tsx`, a mirrored floor tile per scene in `public/scenes/`, `game.css`.
6. **The thought bubble:**
   - It shows on desktop too, where the reference has none because the panel always shows the statement.
   - The phone statement panel adds a "Moss" title, a text Close button and a "Previous · 1 of 8 · Next" row. The reference has the element chip and a close icon, no position count (removed in pass eight), and steps with the dock's ‹ ›.
   - It lacks the trail of puffs from the head to the panel.
7. **Toasts** sit 144 px above the bottom, over the focused critter. The reference moved them to the top of the floor (80 px on the phone; on desktop 88 px, centred over the floor) for exactly that reason. Repair: `Toast` placement in `game.css`.
8. **Critter state per moment is not applied:**
   - The reveal's critters should be delighted and every one but yours should carry a bubble.
   - Closed, waiting and key should be asleep at dusk.
   - The feast sequence should be delighted with growth, with not-yet-woken critters asleep.
   - Tags, piles and the heap belong only to the scattering moments.
9. **The dialog** is a centred card with a Close button on the phone. The reference is a bottom sheet with "Cancel" (text) and the primary action side by side, and a centred 460 px card on desktop. The native `<dialog>` stays (design pass §1: "must not be lost").

## State by state

The reference column describes the phone; on desktop, sheet content moves into the side panel and the scene spans the rest. "Dock moment" means the flow page's `scatterMoment`: the scattering circle with Moss in focus and the dock below, and on desktop Moss's statement in the panel and his name on his tag.

| State | Reference | Expected composition | PR #35 | Repair |
|---|---|---|---|---|
| Statements open | Flow 34, `SCREENS.reveal` | Sheet 230: "Statements are open", the line, a full-width primary Start reading. Critters delighted, yours asleep; bubbles on every critter but yours; no tags, piles or heap; no dock. | Notice card at the top over tags; scattering dock below; bubble on Moss only; tags and a 100-crumb heap; desktop panel empty | `read.tsx`, surface, scene spec |
| Scattering | Scatter, `#scatter` | Circle, central heap (12), piles, tags; dock: − Moss 24 + over ‹ crumb 12 to go ›, closing line on the phone; phone bubble at Moss's head; desktop panel shows the statement | Focus row field shows "0" in monospace; bar repeats the count; no closing line; desktop panel empty; desktop bubble; floor seams | `scatter.tsx`, `parts.tsx`, `game.css`, `scenes.tsx` |
| Reading | Scatter, `#reading` | Phone: 378 px bubble panel at the top with element chip and close icon, statement paragraphs, trail from the head; dock unchanged. Desktop: as scattering. | Title "Moss", text Close, "Previous · 1 of 8 · Next" row, no chip, no trail | `StatementPanel`, `parts.tsx` |
| All given | Scatter, `#done` | Empty heap as three faint outlines; middle becomes the Scatter These pill; + dimmed | Heap hidden when empty; focus field monospace | `mound.tsx`, `scatter.tsx` |
| Confirm | Flow 36, `SCREENS.sign` | Dock moment with Scatter These; dialog: phone bottom sheet (title, line, Cancel text + Scatter These), desktop centred card | Centred card with Close button on the phone; no Cancel | game dialog in surface |
| Saving | Flow 37, `SCREENS.saving` | Dock moment; middle is the gold pill, disabled, with a spinner and "Saving…" | Plain bold text | `scatter.tsx` middle |
| Saved | Flow 38, `SCREENS.saved` | Dock moment; middle "Scattered." and "You can change this until Wed 7 Oct, 18:00 (PDT)."; toast "Your scatter is in." at the top of the floor | Toast over Moss at the bottom; second line "Closes Mon, Oct 12, 9:00 AM PDT" | toast placement, copy |
| Not signed | Flow 39, `SCREENS['sign-rejected']` | Dock moment keeping the allocation and Scatter These; dark toast at the top: "Not confirmed. Your crumbs are still here — try again when you're ready." | Large notice card with Close | `scatter.tsx` |
| Could not save | Flow 40, `SCREENS['save-failed']` | As not signed, toast "Couldn't save your scatter. Check your connection and try again — nothing was lost." | Large notice card with Close | `scatter.tsx` |
| Scattering closed | Flow 41, `SCREENS['scatter-closed']` | Dusk; every critter asleep; empty heap; dock with − and + dimmed and disabled; middle "Scattering has closed. The feast is on its way." (14 px, 700) | Daylight; critters awake; notice card plus the same line in the dock; + still gold | scene spec, `scatter.tsx` |
| Being laid out | Flow 42, `SCREENS.waiting` | Dusk, all asleep, empty heap; sheet 250: title, line, three bobbing crumbs; no dock | Notice card with Close; dock with "Feast"; tags; desktop panel empty | `results.tsx`, surface |
| Key not out yet | Flow 43, `SCREENS['key-not-yet']` | As waiting; sheet: title, cloud notice "The key isn't out yet. Try again in a few minutes.", full-width soft Try again | Notice card titled with the key message, waiting line, Close; dock | `results.tsx`, surface |
| Feast | Flow 44, `SCREENS.feast` | Feast light; critters waking in turn, delighted and growing, each beside the heap it received; no tags; sheet 144: "The critters wake and grow one by one, in the order of what they received." and a text Skip to results | Shortened line in a notice card; dock with focus row and a Skip pill; tags | `results.tsx`, surface, copy |
| Results | Scatter, `#feast`, Results open | Phone: the dock grown into the card (Results, close icon; summary and "Acorn didn't scatter."; ranked rows with 44 px portraits; privacy line; Replay Feast and Download ending the list), bar with a Results pill, critters huddled on the card's top edge. Desktop: panel list with a 74 px bar of Replay Feast and Download CSV level with the dock; header shows the summary. | No close icon; actions pinned outside the list; bar middle plain text; desktop header shows the closing day; huddle critters larger than the reference | `results.tsx`, `parts.tsx` |
| Nobody scattered | Flow 45, `SCREENS['results-nobody']` | Circle awake; sheet 260: Results, "0 of 8 scattered · 0 crumbs in all", the line, privacy note; no actions, no bar | Results card with Replay Feast and Download; bar | `results.tsx` |
| One scatterer, tie | Flow 46, `SCREENS['results-one']` | Feast light; only the two receivers, delighted, at the front; sheet 470: Results, summary, their two rows, "Only Fern scattered.", "Moss and Clover tied.", privacy, Replay Feast and Download | Huddle of all eight; rows include every zero | `results.tsx` |
| Who gave what | Flow 47, `SCREENS.givers` | Huddle; sheet 590: title, caption, table with face column headers, sticky giver column with faces, "—" for self, muted zeros; Download CSV (who gave what) | Text headers, no faces, "0" for self; Replay and Download in place of the giver CSV | `results.tsx` |
| Recording | Flow 48, `SCREENS.attest` | Huddle; sheet 470: Results, rows, public note, primary Record the result on-chain, cost line | Generic results card | `result-record.tsx`, `results.tsx` |
| Recorded | Flow 49, `SCREENS.recorded` | Huddle; sheet 520: Results, rows, leaf notice "Recorded on-chain by Fern.", text "View the record", public note, Replay Feast and Download | Generic results card | `result-record.tsx` |
| Public result | Flow 50, `SCREENS.visitor` | Header without your face, soft small Connect; huddle; sheet 540: Results, "7 of 8 scattered · 700 crumbs in all", rows, "Recorded on-chain by Fern.", View the record, public note, Replay Feast and Download | Gold Connect; "7 scattered"; focus box drawn round the heading; no record line | `public-results.tsx` |

## Scene treatment: a call to confirm

The flow page draws these moments over the whole painting, as a page-level simplification; its intro says the scatter screen itself is on its own page. The scatter page builds the floor-first stage Afolabi asked for in Appendix H: floor based, with walls at the top. The repair uses the scatter page's stage for every core state, so the game has one scene, and the painted floor plates of §22 replace it in one place. This is the repairer's judgement, recorded here for Afolabi to confirm. It is not one of Afolabi's decisions.

## Progress

Each repaired row is re-captured and marked here with its evidence.
