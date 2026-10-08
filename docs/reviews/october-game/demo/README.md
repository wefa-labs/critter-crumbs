# October game rehearsal

Run `mise exec node@22.22.1 -- bun run dev:local`, then `mise exec node@22.22.1 -- bun run demo:record`. The recorder refuses any environment that is not the development mock, and its own Playwright configuration keeps recording out of `bun run e2e`.

The films follow Juniper (rehearsal critter 8) through the seeded Rehearsal burrow's "Our shared work", with eight members. Everything in them is the real game: signing, encryption, the API, receipt verification and the local tally. The other seven members publish their encrypted scatters before the camera rolls, so the film is Juniper's turn without the wait.

1. Juniper connects. Statements are open: the circle wakes, and every critter but Juniper's carries a thought bubble.
2. Start reading opens the first statement:
   - on the phone, as the bubble at the top with its trail, and the dock's › steps to the next; the statement is closed, then opened again from the thought bubble;
   - on desktop, in the side panel, stepping through the circle.
3. Juniper scatters:
   - three taps give crumbs that fly from the heap, a hold pours, and − takes one back;
   - the next critter takes the rest as a typed amount, and Scatter These appears.
4. Confirming is the bottom sheet on the phone and the centred card on desktop. It shows Saving…, then "Scattered." with the toast "Your scatter is in." at the top of the floor.
5. The deadline passes with the screen open. The same screen stops at dusk, with every critter asleep and the allocation still shown. Then the feast is laid out.
6. The key is released and the feast plays: everyone wakes, then each critter eats and grows in turn.
7. The results:
   - on the phone they grow out of the dock, with the critters huddled on its edge, and the ranked list scrolls; the results are closed, showing everyone grown with their totals, then opened again;
   - on desktop they fill the side panel, with Replay Feast and Download CSV in its bar.
8. Replay Feast plays the sequence again.

Mock keys normally become available at closing time. The recorder holds the browser's real key request while the feast is laid out, calls `/api/dev/release-key`, then lets that same request continue. It supplies no synthetic key or result.

The recorder checks its own films after encoding: H.264, yuv420p, 30 fps, the viewport's size, and between 60 and 90 seconds. Playwright records no audio, so the films are silent; the app keeps its sound cues.

| Film | Duration | Frame size | Encoding |
|---|---|---|---|
| [phone.mp4](phone.mp4) | 85.67 s | 390×844 | H.264 / yuv420p / 30 fps |
| [desktop.mp4](desktop.mp4) | 80.83 s | 1440×900 | H.264 / yuv420p / 30 fps |
