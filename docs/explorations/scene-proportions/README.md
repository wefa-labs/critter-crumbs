# Scene proportions and first steps

The tutorial now uses the launcher's painting scale and floor anchors, so the room and critters keep a consistent relationship while the content changes. First meeting combines the selected critter, name and Keep action in the existing stable dialog. A fourth tutorial step explains the result with a worked people feast. New creature designs and identity migration remain separate choices.

## Composition

The paintings are 1600 × 897. Tutorial coordinates refer to that painting: the front pair stand at (46.1%, 94%) and (54.5%, 93%), with the back pair at (39.4%, 90%) and (61%, 89%). Their authored widths are 190 and 165 painting pixels. The room is 80% of the viewport height on phones; desktop uses the launcher's larger room scale. Drawings are bounded horizontally so a narrow viewport does not cut off a practice target.

The old second step put a critter on the table. It now stands in front of the cushions, at (50%, 85%). The practice heap sits on the floor at (50%, 95.5%). All four tutorial steps share one sheet height and pin their actions outside the scrolling content. A short phone, larger text or long translated copy can scroll that content while Next and Got it remain available.

The first meeting gives its critter a small painted stage above the name on phones and beside it on desktop. Rerolls keep the name draft. Keeping writes the name and lock together through the existing profile API. ENS names need no new name. Already locked critters remain locked. The existing fourth-reroll auto-lock rule remains in force, while the meeting stays open to finish saving the name.

## Results example

Four participants have 100 crumbs each. Moss gives 60 to Clover, 30 to Juniper and 10 to Fern; Clover gives 60 to Moss, 30 to Juniper and 10 to Fern; Juniper gives 60 to Moss, 30 to Clover and 10 to Fern. Fern does not scatter. The production `tally` function therefore counts 300 crumbs and yields 120/90/60/30, or 40%/30%/20%/10%. Everyone receives, including Fern. No one gives to themselves. This is public practice data; it does not read or write a real feast.

## Compare

- [Phone before and proposed tutorial composition](images/first-steps-390x844.jpg), [short phone](images/first-steps-375x667.jpg), [375 × 812](images/first-steps-375x812.jpg).
- [Desktop 1280 × 720](images/first-steps-1280x720.jpg), [1440 × 900](images/first-steps-1440x900.jpg).
- [Original flow references on phone](images/reference-375x812.jpg) and [desktop](images/reference-1280x800.jpg).
- [Game on phone](images/game-phone.jpg) and [desktop](images/game-desktop.jpg), including group sizes and open content. These are inspection captures, not a new game-layout implementation.
- [Static onboarding and results proposals](mocks.html). Their actions are now pinned too; they remain visual mocks. The live app supplies form validation, persistence, focus and the actual tally.
- [Dark grading proposal](images/dark-grade-390x844.jpg). This proposed portrait filter and lamplight are **not integrated**. Existing light/dark tokens continue to grade the room; the new art still needs its own dark review.

The comparison images above are Claude's exploration captures from the deployed baseline with development v2 portraits. Current implementation captures and verification are linked from the [review index](../visual-review/index.html). They distinguish development v2 from production-parity v1. The generator and painter selection have not changed.

## Rebuild and integration

From the repository root with Bun 1.4.2 and Node 22.22.1 on PATH:

```sh
node docs/explorations/scene-proportions/build.mjs
```

`scene-proposals.patch` preserves Claude's original proposal against `b908f4a`. The tutorial composition portion is integrated into `learn-steps.ts` and `screens.css`; the global portrait grading remains review material. Do not replay that whole patch onto the new app. The static mocks have a separate script and never import into the application.
