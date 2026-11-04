# UI audit, November 2026: every screen against the October mocks and three books

3 November 2026, on `main` at `5c3d7a1` (PR #71, merged that morning). Walked on the local mock stack in headless Chromium (Playwright 1.64.1) at 375 × 812 and 1280 × 800, light look unless a caption says dark, Garden Spirits as every build now draws them (ADR 0006), reduced motion so frames compare. The mocks are the two artifacts of the October design review, both last published on 7 October: *Critter Crumbs Screens* (https://claude.ai/artifact/T6PfxquYJfozB7aATKFnPo), the flow page of 54 screens, version 2 of 6 October, whose source is `docs/explorations/app-screens`; and *Critter Crumbs Scatter Layouts* (https://claude.ai/artifact/78DuVcCz8aEwnZiJdwUaih), the scatter page at pass eleven, whose source is `docs/explorations/scatter-layouts`. Their frames were captured from the repo copies of the pages at true size, so a frame here is what the artifact shows. The books are the three Afolabi attached: Steve Krug, *Don't Make Me Think, Revisited* (2014); Adam Wathan and Steve Schoger, *Refactoring UI* (2018); Jesse Schell, *The Art of Game Design: A Book of Lenses* (2008 edition). Page numbers are PDF page indexes. The Krug and Wathan digests from the first-steps review are reused (`../first-steps-2026-11/krug-digest.md`, `wathan-digest.md`); the Schell digest is new, beside this file (`schell-digest.md`), with the lens numbers used below.

Every capture is in `images/`: `a-*` before connecting, `b-*` connected, `long-*` the long connected pages whole, `c-*` the live game, `d-*` the gallery's 21 core states, `mock-*-phone` the flow page's frames. `capture.mjs` and `capture-long.mjs` re-make them (see *Evidence*).

## In short

**The core game holds.** The 21 states from *Statements are open* to a public result still follow the scatter page and the flow page as the October repair left them, now on the painted plates (D29) with Garden Spirits. The reveal, the circle, the dock, the thought bubble, the dusk, the waiting sheet, the huddle on the results card and the desktop panel all match their frames (`d-*`, `c0*`). The launcher, the invite screen, the connect sheet and the five first steps follow the flow page too (D25 to D28, D30). Where the app is designed, it is designed well, and it already reads as a game.

**Everything a connected member sees outside the game was never built to the mocks.** Home, *Start a burrow*, the burrow, its members, *Start a feast*, the saved draft, gathering (people and options), the first meeting, the profile and Settings, every confirmation dialog and the error pages still have the September layout: a big heading, a plain form or list, capsule-shaped cards, no floor and no critters (`b02` to `b17`, `long-*`). The flow page drew all 54 screens with one anatomy, "a header with your critter's face, the painted floor with critters on it, and one surface for the content" (design pass §23). Twenty-eight of its 54 screens, stages 3 and 5 to 7, 9 and 10, are not built that way, and the design system said so on 11 October: those screens "still keep their earlier layouts and wait for the same treatment" (§14, *Before connecting*). That is the whole of the gap the request names. It is also most of the calendar: a member spends the gathering days, and every visit between feasts, on the screens that look least like the game.

**Four cross-cutting defects make those screens look worse than the September design intended** and are cheap to fix on their own: the header of a feast page on a phone (the wordmark cut by the face button, the two deadlines drawn as two-line capsule buttons, 340 of 812 px before the content starts, `b09`, `b11`); every dialog asking twice (a Close button top right and Cancel at the foot, and the cancel-feast dialog offering *Cancel the feast* beside *Cancel*, which the mock avoided with *Back*); the capsule cards (the card radius token is the 999 px pill, so burrow and feast cards are capsules and the setup form's groups cut across their own fields, QA lifecycle-14); and the browser's blue radio buttons and date pickers inside the ink palette.

**On game feel, by Schell's lenses, the week has one designed act.** The interest curve of a feast is hook (launcher, invite), rest (gathering), rise (statements open), peak (scattering), rest (waiting), climax (the feast), resolution (results). The rises, peaks and the climax are built as moments; both rests and the gateway between feasts (home, the burrow) are forms. Nothing on them can be touched for pleasure, no critter reacts to anything a member does there, and the only visible progress is a sentence ("8 of 8 statements written"). The mock's floor, with the writers awake and the others asleep, was the designed answer to that, and it is the single change that would do most for the feel.

The recommendation is one frame and six ports, in the order a member meets them, after the four small fixes. Sizes and decisions are at the end.

## How this was checked

1. **The mocks, side by side.** Each app screen was captured at the mock's own size and compared with its frame by eye. Where the October review already proved a core state against its frame (`../october-game/mismatches.md`), that evidence stands and the state was only re-captured to confirm nothing moved.
2. **The specs.** The flow page's own notes (`SCREENS`, `FLOW`, `NOTES` in `index.html`), design pass §8 and §23 to §26, Design System §9 and §14, Game Design §1 and §4, PRD §7 and §9. Afolabi's words (design pass Appendices A to H) win where they disagree.
3. **The books.** Each finding names the principle it rests on with its page. Krug for whether a screen explains itself at a glance; Wathan for hierarchy, labels, spacing and finish; Schell for whether a screen is part of the game or a form next to it.
4. **Live.** Connected as rehearsal critters 1 to 4, through the seed's burrow: the first meeting, home, the burrow, a draft, gathering in both kinds, the reveal, reading, scattering (taps and the plus button, `c04`), the deadline passing, the wait for the key.

Not checked: a real phone, a screen reader, WebKit, the 3D meshes (Garden Spirits have none, see X11), sound.

## The lenses, in one table

| Book | Principle | Audit question | Pages |
|---|---|---|---|
| Krug | Self-evident, else self-explanatory; people scan and satisfice | Does the screen answer *where am I, what can I do, where do I start* without reading? | 37, 40-46, 119-129 |
| Krug | Mindless, unambiguous choices; omit needless words | Is each choice trivial; is anything said twice? | 70-72, 77-80 |
| Krug | Navigation is the instructions; page titles echo the label | Does the header say the place, and does *Back* go back? | 91-109, 185-186 |
| Krug | Affordances without hover; flat styling hides controls | Does what is tappable look tappable, and nothing else? | 60-62, 187-189 |
| Krug | Goodwill: candour, saved steps, no sizzle in the way | Is anything hidden, duplicated or shouting? | 204-211 |
| Wathan | Hierarchy by weight and colour; one primary action; labels last | Is there one gold thing, and is the loudest element the important one? | 36-62 |
| Wathan | White space, fixed widths, fewer borders, empty states as a first meeting | Does the page breathe; are cards and groups drawn or implied? | 66-99, 234-246 |
| Wathan | Everything has an intended size; colour never alone | Are faces, portraits and icons drawn for their size; are states shown by word and shape? | 158-168, 208-213 |
| Schell | #1 Essential experience; #9 Unification | Which of Game Design §1's six principles does the screen carry; does every element belong in the burrow? | 51-52, 80-84 |
| Schell | #15 The toy; #48 Accessibility | Would a newcomer touch something before reading; is the first step obvious? | 121-122, 244 |
| Schell | #57 Feedback and the tenth of a second; #58 Juiciness | Is every input acknowledged at once and how many replies does it get? | 259-265 |
| Schell | #59 Channels and dimensions; #60 Modes | Is the biggest thing the important thing; can you tell the phase from a thumbnail? | 265-271 |
| Schell | #72 Indirect control through visual design | Where does the eye land first, and is that the one action? | 316-324 |
| Schell | #61 Interest curve; #49 Visible progress | Is this beat a rise, a peak, a rest or a dead end; can progress be seen? | 244-245, 277-284 |
| Schell | #82 Inner contradiction | A quiet tool must not blink, shout or ask twice | 365-366 |
| Schell | #20 Judgment, #41 Punishment | Do results read as fair; is the non-scatterer notice quiet and preventable? | 159, 223-225 |

## Cross-cutting findings

Ordered by how much they change for a member. Each gives what was seen, the principle, and the change. Sizes: S is a sitting, M a day or two, L a week.

### X1. The header of a feast page on a phone (must, S)

On the draft, gathering and options-gathering pages (`b09`, `b11`, `b15`, `long-gathering-phone`) the shell header wraps the burrow line, the phase chip and both deadlines into the top bar: the wordmark is cut to "Critter Cru" by the face button, each deadline is a two-line capsule button with a hard shadow, and the content starts 340 px down an 812 px phone. The deadline buttons are `.quiet` controls, but the base button style keeps their border and shadow, so they read as two primary actions. On desktop (`b11-gathering-desktop`) the same bar is tidy but still puts the two closes in outlined pills beside a chip.

Krug: the header is navigation and should say where you are (91-109); two things that look like buttons but are not drain goodwill (187-189, 204-207). Wathan: labels fold into values and the loudest element should be the important one (36-52). Schell #59: the information ranking here is upside down, the close times outrank the title.

**Change.** The mock's header for a connected screen: the burrow line in small over the title, the face at the right, nothing else; the phase chip and the close line in the content's first row ("Gathering · Gathering closes in 2 days", `mock-gathering-phone`). The absolute time stays one tap away, as a plain disclosure, not a capsule. The game screens already have this header (`GameFrame`); the plain pages should use it or a `Page` variant of it.

### X2. Every dialog asks twice (must, S)

The app's `Dialog` frame draws a Close button in its heading, and every sheet also offers Cancel at the foot: the connect sheet (`a02`), remove (`b04`), leave (`b05`), open the feast (`b10`), extend (`b13`), the sign dialog (`d-signing-phone`), the profile and Settings. The cancel-feast dialog (`b14`) offers Close, *Cancel the feast* and *Cancel*, exactly the pair the flow page avoided: "The cancel-feast dialog uses Back to dismiss, so it does not offer 'Cancel' next to 'Cancel the feast'" (its notes; design pass §24). The mock sheets have one way out, a text Cancel (or Back) at the left of the primary action (`mock-leave-phone`, `mock-open-phone`, `mock-cancel-feast-phone`).

Krug: two controls for one action is a choice nobody should have to make (70-72). Schell #82: a quiet tool must not ask twice; #60: Close means one thing on the statement bubble and another here.

**Change.** On the phone sheet, drop the heading's Close (Escape, the backdrop and the foot's Cancel remain; the native dialog needs no second button); keep a Close on the desktop card only where there is no Cancel. The cancel-feast dialog's way out says Back. One file (`ui.tsx`) and one string.

### X3. Capsule cards and groups (must, S)

`--cc-radius-md` is the 999 px pill of the Inked daylight buttons, and `.link-list li` uses it, so the burrow card on home and every feast card on the burrow page is a capsule (`b02`, `b03-burrow-desktop`); their text sits in the pill's straight middle while the ends are empty. The setup form's fieldsets use the 22 px radius with the legend on the border, so the groups "are drawn as tall capsules that cut across their own fields" (QA lifecycle-14, still open, `long-setup-phone`). The mock's cards are 16 to 24 px rounded (Appendix A: "Rounded cards (16 to 24px radius), pill buttons").

Wathan: corner radius is one of the four levers of personality and must be consistent, never mixing pill and square on the same screen (20-26); groups are separated by space and tint before borders (96-99, 238-246).

**Change.** Cards take `--cc-radius-lg` (22 px); the setup groups lose their drawn fieldset border in favour of a heading and spacing, as the mock lays them out (`mock-setup-phone`).

### X4. The browser's controls inside the ink palette (should, S to M)

The setup form's radios and checkbox are the browser's blue, the date pickers are the platform's (`b07`, `long-setup-phone`, `b13`); only Settings' checkboxes take the moss accent. The mock draws the feast type as two selectable cards, crumbs as a stepper with − and +, the privacy pair as segmented pills, and the deadlines as the absolute time in the field (`mock-setup-phone`, `mock-setup-few-phone`).

Wathan: rebuild stock components when they break the look (243-246); colour must stay inside the palette (158-168). Schell #9: a blue radio is an element from a generic app.

**Change.** At least `accent-color: var(--cc-ok)` on every native control (one line). Better, the mock's selectable cards and segments, which are native radios styled, so the keyboard and screen reader lose nothing; the stepper reuses the game's − and + buttons.

### X5. More than one primary action, and the wrong one first (must, S to M)

Home opens on a gold *Start a burrow* above the burrow card (`b02`), so a returning member's eye lands on the one thing they will not do today; the mock puts *Start a burrow* at the foot and the burrows first (`mock-home-phone`). The burrow page opens on *Copy burrow link*, then seven *Remove* pills down the member list, with the feasts under way below the fold (`long-burrow-phone`); the mock opens on the feast under way with *Scatter crumbs* as the one gold button, and *Remove* as a quiet text link on a separate members screen (`mock-burrow-phone`, `mock-members-phone`). The gathering page ends on a gold *Save statement* and a gold-looking *Extend gathering (once)* side by side (`long-gathering-phone`).

Wathan: one primary, a few secondary, the rest links (60-62). Schell #72: the first thing the eye lands on is indirect control, and here it points at the wrong door.

**Change.** Per screen, one gold pill for the action of the moment (join, scatter, save, open), outlined pills for the secondary, text links for the rest, in the mock's order.

### X6. The beta banner (decision, S)

"Beta · Testnet · Still in development. Rehearsal only." takes about 36 px at the top of every screen, over the launcher's plate, over the game's floor and above every sheet (`a01`, `c01`, `c03`). The gallery's captures have none, so every October comparison was made without it. It is honest and it is loud, in the one place a game puts its title.

Schell #9: the test for a detail is whether it reinforces the theme; #82: shouting on a quiet screen. Krug: candour belongs, but at the point of need (204-211).

**Change.** A decision (D2 below): a chip beside the burrow line in the header, a line in the profile sheet, or a one-time notice on first connect. Any of the three gives the floor its 36 px back.

### X7. Addresses in full (must, S)

The member list and the profile print whole addresses in 12 px monospace, wrapped over two lines, under every name (`b03`, `long-burrow-phone`, `b16`). On a phone the longest element of the page is the one nobody reads. The design system's rule is `0x1234…abcd` (§5.5), and the mock follows it with the full address on the profile only, beside *Copy address* (`mock-members-phone`, `mock-profile-phone`).

Wathan: labels and data that nobody reads are tertiary (36-47). Krug: halve the words (77-78).

**Change.** The short form everywhere, the full address copyable from the profile.

### X8. The header says "Critter Crumbs" on every connected page (should, S)

The shell header shows the wordmark and the face on home, the burrow, setup, the draft and gathering. The mock shows the place: the burrow's name on its page, "Rehearsal burrow" small over "Our shared work" on a feast, a back chevron where there is a parent, the wordmark only on the launcher and the first steps (`mock-burrow-phone`, `mock-burrow-new-phone`, `mock-members-phone`).

Krug: a page title that echoes the label you tapped is the cheapest "you are here" (107, 112-113).

**Change.** The game header's pattern (burrow line over title, face at the right) on every connected screen, which X1 does for feast pages; home keeps the wordmark.

### X9. No floor and no critters outside the game (must, L; the main finding)

Home, the burrow, start a burrow, setup, the draft, gathering, the profile and the dead-link pages have no painting and no critter but a 40 px face per list row. The flow page draws every one of them on the floor: your own critter on home (`mock-home-phone`), the burrow's critters on the burrow (`mock-burrow-phone`), a strip of the room above the setup form (`mock-setup-phone`), the writers awake and the others asleep during gathering (`mock-gathering-phone`), your critter on the profile with its element chip (`mock-profile-phone`), even the dead-link and not-in-the-burrow screens (`mock-unknown-phone`). The frame to do it already exists in the app: the invite screen and the first steps are built from a painted floor and a sheet (`.sheet-screen`, `.screen-floor`, `.screen-sheet` in `screens.css`, `PaintedFloor` and `FloorCritter`), on the phone and as floor plus side panel on desktop (`a04-invite-desktop`, `a03-learn-1-desktop`).

Schell #15 and #48: a screen with nothing to touch and no obvious first move is not a toy; #9: the plain pages are a generic app beside a game; #61: the gathering rest and the burrow gateway are the flat stretch of the curve; #49: who has written is progress and should be visible, not read. Wathan: empty states are "a user's first interaction with a new product" (234-236).

**Change.** One `PlaceScreen` frame (header, floor, sheet or panel) shared by the connected screens, then the six ports in the build order below. The floor's critters are the review art's `FloorCritter`, already in the shell for the launcher; the painting is already cached.

### X10. Things said twice (should, S)

"Nobody sees this until scattering opens." appears twice on the gathering page, once in the section and once inside the editor (`long-gathering-phone`); on an options feast "Splitting a budget. You write a line for each option." and the hidden line repeat under each of the three editors (`long-gathering-options-phone`); the draft page says draft three times (the chip, "Draft saved…", "These details are fixed…", `long-draft-phone`); setup prints the burrow's name under the heading and again as the header's context. The October brief's rule is "Nothing is shown twice" (design pass §8).

Krug: omit needless words (77-78). Schell #43: count the purposes of each element and remove the one-purpose ones.

**Change.** One hidden line per page, in the sheet's notice; one help line per options form, above the list; the draft's chip alone.

### X11. A Simple view setting with nothing to switch (decision, S)

Garden Spirits are portraits only (`meshVersions` holds version 1 alone), and since ADR 0006 every build draws them, so the app never loads 3D and the fallback never shows; yet Settings still offers "Simple view · Flat critters. Easier on the battery." (`b17`), and the design system still describes portraits as the fallback. The switch does nothing a member can see.

Schell #82: a control meant to do something that does nothing is an inner contradiction; #60: a mode nobody can enter.

**Change.** A decision (D7): hide the switch while no critter has a mesh, or keep it with a line saying it waits for the 3D critters.

### X12. Three limits for one name (decision, S)

The design settled names at 16 characters on 5 October (design pass §8; the mock's field counts "7 / 16", `mock-name-phone`); the first-meeting field allows 40 (`onboarding.tsx`); the server allows 80. The dock already shortens long names ("Hazel Mon… 13", `d-scatter-phone`), and the QA pass found the dock cutting names at 375 px (copy-05).

**Change.** One number, in the validators, the field and the copy, with the counter the mock shows. 16 is the number the circle was designed around.

### X13. Empty states outside the game (should, S)

"No feasts yet · Start one when the burrow is ready." is a bordered box of text with *Start a feast* elsewhere on the page (`b03-burrow-desktop`); home's empty state has the asleep portrait and the right words but the action above it rather than with it. The mock gives each empty state its one action inside the card (`mock-burrow-quiet-phone`).

Wathan: an empty state gets art, one sentence and an emphasised action (234-236). Krug: where do I start (128-129).

## Screen by screen

The flow page's numbers and names; *Verdict* is **Matches** (the frame, within the differences the October review kept on purpose), **Partly** (the pieces are there, the anatomy or the hierarchy is not) or **Not built to the mock**. *Update* is what the mock asks for; *Could* is what the books suggest beyond it. Captures are in `images/`, named as given.

### Arriving (before connecting)

**1. Launcher** · mock `mock-launch-phone` · app `a01-launcher-phone`, `-desktop`, `-phone-dark` · **Matches.** The plate, the four critters, the heap, Connect and *How it works*, the Music button, on the phone and as a card on desktop; dark grades the room and the critters. Krug's tagline test passes (125-128): six words that only this product could use. *Update:* the beta banner over the plate (X6). *Could:* a tap on a dozing critter stirs it, as the own critter stirs in the game; Schell's toy lens (#15) says the first screen should invite a touch before a read, and the first steps already prove the pattern (`a03-learn-2-phone`).

**2. Arriving by link** · `mock-invite-phone` · `a04-invite-phone`, `-desktop` · **Matches**, with D30's *How it works* under *Connect to join*. The ring stands on the whole painting rather than a plate, so two of eight critters stand on the table and the steps (design pass §26: "the launcher and the screens with a sheet, which still show the whole paintings"). *Could:* draw the ring on the window plate the game uses, lifted as the game lifts it, so the critters stand on the floor.

**3. Choose how to connect** · `mock-connect-phone` · `a02-connect-sheet-phone`, `-desktop` · **Partly.** The rows, the initials, the arrow and the sign-in line match. *Update:* X2 (Close and Cancel). **4. Confirming** and **5, 6** (nothing to connect with; not confirmed): built as the mock has them (`connect.waiting` with the spinner, the cloud notice in the sheet, the notice in the launcher's sheet), by the code; the rehearsal accounts connect too fast to capture.

### Meeting your critter

**7. Your name** and **8. Meet your critter** · `mock-name-phone`, `mock-meet-phone` · `b01-meet-critter-phone`, `-rerolled` · **Partly.** The name and the critter share one dialog (decision of 16 October), which keeps the draft name through four re-rolls. But it is a sheet with a Close button over the home page, which shows "Your burrows" and a gold *Start a burrow* behind it, and the critter stands in a 160 px crop of the painting. The mock is a whole screen: the room, the critter large on its floor with its element chip, the line, Re-roll and Keep pinned. Schell: this is the one close-up a member gets of their own critter (#45, the binocular effect, 231) and the avatar moment (#75, 343-345); Krug: a dialog over a visible other page splits the one question (56-63). *Update:* make it the screen the mock draws, on the `PlaceScreen` frame; no Close (X2); the element chip; the 16-character counter (X12). *Could:* on Keep, the critter wakes (the game's wake, 600 ms) before the home screen arrives.

### First steps

**9, 10, 11 (and the week and the result)** · `mock-learn-*-phone` · `a03-learn-1..5-phone`, `-desktop` · **Matches** D30's five steps, reviewed in full on 3 November (`../first-steps-2026-11`). Step 5's explanation still scrolls under the fade at 375 × 812 (`a03-learn-5-phone`). *Could:* the first-steps review's steps 4 to 8, unbuilt.

### Burrows

**12. Your burrows** · `mock-home-phone` · `b02-home-phone`, `-desktop`, `-phone-dark` · **Not built to the mock.** A heading, a gold *Start a burrow*, one capsule card with "8 critters" and "Next deadline: Tue, Nov 3, 11:09 AM PST". The mock: your critter on the floor, each burrow a card with three faces, its size and the feast under way or the next close in relative words ("Scattering closes in 2 days"), *Start a burrow* at the foot. Krug: a returning member's question is "which burrow has something for me today" (119-129); Wathan: fold the label into the value (48-52); Schell #74: the burrow is the world a member comes back to and home is its gateway. *Update:* the frame (X9), faces on the cards, the phase and relative close, the action at the foot (X5), the card radius (X3), and "1 critters" (QA copy-03). *Could:* the card says who is waited on ("3 have not written") so the home answers the week's question.

**13. No burrows yet** · `mock-home-empty-phone` · (by code) · **Partly.** The asleep portrait, the title and the body are right; the action sits above instead of with them, and there is no floor. *Update:* on the frame, the critter asleep on the floor, *Start a burrow* as the sheet's one action; the first-steps review's optional *How it works* line (its D4).

**14. Start a burrow** · `mock-burrow-new-phone` · `b06-create-burrow-phone`, `-desktop` · **Not built to the mock.** A form on a blank page. The mock: the floor with your critter, a back chevron in the header, the field, the help line ("Then add critters by address or ENS name, and share the burrow link", a proposed string), Cancel and *Create burrow* pinned. *Update:* the frame and the help line. Small.

**15. Just you so far** · `mock-burrow-fresh-phone` · (by code; the seed has eight) · **Partly.** The add field is focused and the body says what to do, as §9 asks; the rest is the ordinary burrow page. *Update:* the mock's card order (add, copy link, the *No feasts yet* card with *Start a feast* waiting for three critters).

**16. Joining a burrow** · `mock-burrow-join-phone` · (by code) · **Partly.** *Join this burrow* appears as a pill in the actions row above the full member list. The mock: the burrow's critters on the floor, a *Ready to join* chip, the faces, "Fern added your address" (a new string the flow page proposed and nobody built), one gold *Join this burrow*. Krug: this is the first page most new members see after connecting, and it must say what joining is (119-122, 204-207). *Update:* the frame, the chip, the line about who added you.

**17. A burrow** · `mock-burrow-phone` · `b03-burrow-phone`, `-desktop`, `long-burrow-phone`, `long-burrow-member-phone` · **Not built to the mock.** The app lists members with full addresses and *Remove* pills, then the add form, then feasts as capsules, then *Leave*. The mock: the critters on the floor; the feast under way as the first card with its close line, "5 of 8 have scattered" with faces and *Scatter crumbs*; past feasts as rows with chips; a *Critters* card leading to the members screen; *Copy burrow link* at the foot. The app shows nothing about who has scattered anywhere while scattering is open (PRD R5; QA lifecycle-05 and rules-03, both major and open). Schell #49: progress a member can see; #41: a quiet, preventable consequence needs the close and the count in view. *Update:* the frame, the feast card with participation, the members behind one card, X3, X5, X7. This is the largest single port and the one a council member meets most.

**18. A burrow with no feasts** · `mock-burrow-quiet-phone` · (by code) · **Partly**; X13.

**19. Managing critters** · `mock-members-phone` · (the burrow page's list) · **Partly.** The pieces exist on the burrow page. *Update:* its own screen behind the *Critters* card, short addresses (X7), *Remove* as a quiet link, "(you)" on your own row, *Ready to join* under a pre-added member (the app has the string), *Copy burrow link* pinned.

**20. Removing** and **21. Leaving** · `mock-remove-phone`, `mock-leave-phone` · `b04`, `b05` · **Partly**: the words match; X2.

**22. Not in this burrow** · `mock-unknown-phone` · (by code: a heading, the line and Back) · **Partly.** The mock adds your critter on the floor and a row with your short address and *Copy your address*, which is the one thing the person has to do next (send it to a member). Krug: a saved step fills goodwill (207-210). *Update:* the frame and the copy row (the profile's `copyText` serves).

### Starting a feast

**23. Start a feast** and **24. Splitting a budget** · `mock-setup-phone`, `mock-setup-few-phone` · `b07-setup-phone`, `long-setup-phone`, `long-setup-options-phone`, `-desktop` · **Partly.** Every field and help line of the PRD is there and in the mock's order. The frame is missing, the groups are capsules (X3), the controls are the browser's (X4), the burrow name is printed twice (X10). *Update:* X3, X4, X10, the strip of the room above the form. *Could:* the mock's stepper and selectable cards; the three setup errors that only name a field (QA edge-states-09).

**25. Too few critters** · `mock-setup-few-phone` · (by code) · **Partly.** The app says "A people feast needs at least 3 critters. This burrow has {n}." and blocks *Save draft*, which is the PRD's rule (R6 at creation); the mock lets the draft save and holds *Open the feast*. The app is right; the mock should follow it.

**26. The saved draft** · `mock-draft-phone` · `b09-draft-phone`, `long-draft-phone` · **Not built to the mock.** A definition list, then *Open the feast* and *Cancel this feast*, then a two-column grid of asleep portraits in bordered cells, the September grid the design replaced (D17). The mock: the floor, a leaf notice "Draft saved…", the details as rows (including both closes, which the app's summary leaves out), *Cancel this feast* as a link beside *Open the feast*. *Update:* the frame, the rows, the two closes, the grid removed (the critters belong on the floor).

**27. Opening the feast** · `mock-open-phone` · `b10-open-dialog-phone` · **Partly**: the words match; X2.

### Gathering

**28. Your statement** and **29. Further down** · `mock-gathering-phone`, `mock-gathering-more-phone` · `b11-gathering-phone`, `long-gathering-phone`, `long-gathering-member-phone`, `-desktop` · **Not built to the mock.** The app: the broken header (X1), the title, a bare *Start from your notes* disclosure, two lines of text, then the editor under a 64 px portrait and name, the prompt under the field, the counter, the hidden line again, *Save statement*, then the creator's two pills. The mock: the critters on the floor, the writers awake and the rest asleep; a *Gathering* chip with the close at its right; *Your statement* with the prompt above the field; the counter and "Saved." on one line; a leaf notice; the gold Save; then the notes card with *Copy prompt*; "3 of 8 statements written" with faces and "Not yet: …"; the creator's actions as links. This is the screen a member lives on for days. Schell #61: the rest beat of the curve, which should still be in the world; #49: who has written is progress, and the floor shows it without a sentence; #85: the statement is the one place a member is heard before being counted, and it should feel like one. Krug: the prompt belongs where the writing happens, above the field (75, 78-80); Wathan: the counter and the saved state are one line of tertiary text (36-47). *Update:* the frame with the awake-and-asleep floor, the chip row, the editor as the mock lays it out, the notes card, participation with faces, X1, X5, X10. *Could:* the writer's own critter stirs or nods when the statement saves (the game's stir, one call); the game's `statement.open` page-flip plays when the notes card opens.

**30. Option statements** · `mock-gathering-options-phone` · `b15-gathering-options-phone`, `long-gathering-options-phone` · **Partly.** One editor per option with a portrait and heading, each repeating the help and the hidden line (X10). The mock: each option a card with its field, counter and "Saved.", one help line above. *Update:* cards, one help line, the frame. Also open: members of an options feast are offered *Start from your notes*, a prompt for a statement they cannot write (QA lifecycle-10).

**31. Extending gathering** and **32. Cancelling** · `mock-extend-phone`, `mock-cancel-feast-phone` · `b13`, `b14` · **Partly**: X2, and the cancel dialog's *Back*. The extend dialog's date picker is the platform's; the mock shows the absolute time in the field (X4).

**33. Joined too late** · `mock-late-phone` · (by code) · **Partly.** The app returns the sentence alone in place of the scatter screen, after first inviting the member to read and "scatter your 100 crumbs" (QA edge-states-07). The mock: the floor, the leaf notice, "5 of 8 have scattered" with faces, Back. *Update:* the frame and the notice before the reveal, not after.

### Scattering and the feast

**34. Statements are open** · `c01-reveal-live-phone`, `c08-reveal-live-desktop`, `d-reveal-*` · **Matches.** Eight critters awake with their bubbles on the plate, the sheet, *Start reading* focused.

**35. Who has scattered** · `mock-who-scattered-phone` · nothing · **Not built.** Proposed on the flow page and required by PRD R5; see screen 17.

**36. Confirming your scatter** · `d-signing-phone` · **Partly**: Cancel beside *Scatter These* as the mock has it, plus the frame's Close (X2).

**37 to 41. Saving, saved, not signed, could not save, scattering closed** · `d-saving`, `d-scattered`, `d-rejected`, `d-failed`, `d-closed` · **Matches**, including the dusk and the dimmed controls when the deadline passes under the screen.

**42, 43. The feast is being laid out, the key is not out yet** · `c10-waiting-live-phone`, `d-waiting-*`, `d-key-*` · **Matches.** *Could:* the sheet carries "7 of 8 scattered" (the data is in the feast already) so the wait has visible progress (Schell #49, #39); the first-steps review's *Why nobody can peek* link.

**44. The feast** · `d-feast-*` · **Matches** the composition (the line follows G3, kept on purpose).

**45 to 50. Results** (nobody, one scatterer and a tie, who gave what, recording, recorded, a public result) · `d-results-*`, `d-nobody`, `d-tie`, `d-givers`, `d-recording`, `d-recorded`, `d-public` · **Matches.** Recording keeps the rehearsal strings until the production record exists (QA production-build-05). On the phone *Replay Feast* and *Download* end the scrolling list, below the fold once the burrow has more than five receivers (`d-results-phone`); the mock has them there too, and the operator's one job is the CSV (PRD S4). *Could:* pin the two actions at the card's foot (decision D9).

### You

**51. Your profile** · `mock-profile-phone` · `b16-profile-phone`, `-desktop`, `b17-settings-phone` · **Partly.** Two dialogs: *Your critter* (face, name, full address, four links, Disconnect) and *Settings* (five checkboxes, *How it works*). The mock: one screen, your critter on the floor with its element chip, name, "This one's yours.", the short address with *Copy address*, the settings as switches, *How it works* and *Disconnect* at the foot. Schell #75: the profile is the avatar's home; Wathan: switches read as settings, checkboxes as a form (243-246). *Update:* one `PlaceScreen` with the mock's order; X2, X7, X11. The dark-mode switch stays (D26).

### When something goes wrong

**52. Offline, and a feast that ended** · `mock-offline-phone` · (by code) · **Partly.** The offline line is a fixed notice under the header; the void feast is a sentence on its page while its header still counts down (QA edge-states-15). *Update:* the mock's dark band for offline; the void line as a leaf notice on the burrow's feast row.

**53. Clock, names and the simple view** · `mock-notices-phone` · nothing visible · **Not built.** The clock-skew and ENS lines go only to the screen-reader announcer (QA edge-states-08); the simple-view notice exists in the game. *Update:* the three as cloud notices in the sheet, as the mock stacks them.

**54. Connect again to save** · `mock-session-expired-phone` · (by code: the connect sheet opens with the reason) · **Partly.** The statement stays, which is what matters; the mock keeps the member on the page with a notice and a Connect button rather than a modal. *Could:* the in-place notice.

**Dead links** (no burrow, no feast) · `a05-missing-feast-phone` · plain heading, line and Back. *Could:* the frame with the viewer's critter asleep, as the mock's *Not in this burrow* does; Wathan's empty-state rule (234-236).

## Game feel across the week

Schell's interest curve (#61, 277-284) drawn for one feast, with the lens that bears on each beat:

| Beat | Screens | Designed as | What carries it today | Gap |
|---|---|---|---|---|
| Hook | Launcher, invite | A title screen and a room full of sleepers | The painting, the dozing critters, one button | Nothing to touch (#15); the banner (X6) |
| Meeting | Your name, your critter | The close-up (#45), the avatar (#75) | A dialog over home | Screen 8 |
| Rest | Home, the burrow, start a feast | The world between feasts (#74) | Headings, capsules, addresses | X9, screens 12 to 26 |
| Rest | Gathering | Expression (#85) in the room, progress on the floor (#49) | A form; progress as a sentence | Screen 28 |
| Rise | Statements open | A moment (Game Design §4.1) | The wake, the bubbles, the sting | None |
| Peak | Reading, scattering | Control (#53), juiciness (#58), choice (#32) | Tap, hold, hop, bip, the heap dwindling, the dock | None; see below |
| Rest | Scattering closed, waiting | A designed rest, not a dead end (#39, #49) | Dusk, the sleeping ring, bobbing crumbs | No count of who has scattered |
| Climax | The feast | Spectacle, the one loud moment | The wave, the growth, the cue | None |
| Resolution | Results | Judgment that reads as fair (#20) | The ranked list, the quiet non-scatterer line, the huddle | Actions below the fold |

Three things about the peak, from the live run and the gallery:

- **The juice is all there** (#58): a tap replies with the count, the hop, the squash and the bip; the plus and a tap on a critter both give on the same frame (`c04`); the heap is the progress bar; *Scatter These* appears when the heap is empty and nowhere before. Game Design §1's six principles are carried by this one screen.
- **Modes are unmistakable** (#60): day for scattering, dusk for closed and waiting, the feast light for the climax; a thumbnail tells the phase. The screens outside the game have no mode at all, which is the other way of saying X9.
- **The statement bubble is a fixed 378 px** (design pass §8: "a taller box of fixed height that scrolls when the text is long"). With the seed's one-line statements it is four-fifths empty (`c02-reading-live-phone`); with a long one it fills (`d-reading-phone`). Real statements will be long, so this is a small call (D8), not a defect.

Two things Schell would ask of the whole, rather than of a screen:

- **The toy outside the game.** The launcher's and the burrow's critters are decoration; the first steps and the game make the same drawings answer a touch. One shared affordance, a tap stirs a floor critter, would make every screen a toy at the cost of one handler, and it is the cheapest way to make the plain screens feel like the same product once they stand on the floor.
- **Nothing pulls.** Schell's warning in §3 of the digest is the product's own rule: no points, no streaks, no reason to come back but the feast. The audit found nothing that breaks it, and the recommendation adds nothing that would.

## What to update: a build order

Tracer bullets, each shippable and reviewable on its own. Workstream B throughout, with small shared changes to `copy.ts`. Every string a copy ID with a Design System §10 row; the shell stays under 120 KB (it was about 104 KB after PR #71; the frame's pieces are already in it for the launcher); the vocabulary rules; nothing opens unasked.

| # | Change | Where | Size | Must or could |
|---|---|---|---|---|
| 1 | The small fixes together: X1 header, X2 dialogs (and Back on cancel), X3 radii, X4 accent colour, X7 short addresses, X10 duplicates, X13 empty states, "1 critters" | `ui.tsx`, `feast.tsx` (FeastTop), `app.css`, `shell.css`, `copy.ts` | S | Must |
| 2 | The beta banner moves (per D2) | `app.tsx`, `app.css` | S | Decision |
| 3 | `PlaceScreen`: the connected screens' frame from the invite's pieces (header with burrow line, title and face; floor; sheet on the phone, panel on desktop) | new `app/place-screen.tsx`, `screens.css` | M | Must |
| 4 | Home and the empty home on the frame; burrow cards with faces, phase and relative close; the action at the foot | `burrows.tsx`, `copy.ts` | M | Must |
| 5 | The burrow on the frame: the feast under way first with participation and one gold action; past feasts as rows; the members behind a card and on their own screen; *Who has scattered* list (R5) | `burrows.tsx`, new `members.tsx`, `copy.ts` | L | Must |
| 6 | Gathering, people and options, on the frame: writers awake and the rest asleep; the chip row; the editor as the mock lays it out; the notes card; participation with faces | `gathering.tsx`, `feast.tsx`, `copy.ts` | M | Must |
| 7 | The first meeting as a screen (name and critter, element chip, 16-character counter) | `onboarding.tsx`, validators, `copy.ts` | M | Must |
| 8 | Start a burrow, setup and the draft on the frame; the grid removed from the draft; the draft's rows with both closes; the mock's selectable cards and stepper | `burrows.tsx`, `setup.tsx`, `feast-actions.tsx` | M | Must (cards and stepper: could) |
| 9 | The profile as one screen with switches; Simple view per D7 | `profile.tsx`, `app.tsx` | S | Must |
| 10 | Notices in place: offline band, clock, ENS, void feast, joined too late before the reveal, dead links on the frame | `app.tsx`, `feast.tsx`, `scatter.tsx` | S | Should |
| 11 | A tap stirs a floor critter everywhere; the writer's critter nods on save; the waiting sheet's count | `painted-floor.tsx`, `gathering.tsx`, `sheets.tsx` | S | Could |
| 12 | The invite's ring on the plate; the results' actions pinned (D9); the statement bubble sized to content (D8) | `invite.tsx`, `results.tsx`, `layout.ts` | S | Could |

Checks for each: the e2e suite (setup, gathering, the launcher, the shared shell and the first steps have specs of their own), the screens suite for anything that touches the game, captures at 375 × 812 and 1280 × 800 in both looks beside the mock frame, every visible target at 44 px, and the copy lint. Steps 4 to 9 each replace one screen whole, so a half-done state never ships.

## Decisions for Afolabi

| | Decision | Recommendation |
|---|---|---|
| D1 | Build the connected screens to the flow page's anatomy (X9), in the order above, or keep the plain pages and do only the small fixes | The anatomy; it is what the mocks were for, and the frame exists |
| D2 | The beta banner: a chip in the header, a line in the profile, or a one-time notice | A chip beside the burrow line, and the launcher's plate carries "Beta" under the tagline |
| D3 | Dialog sheets lose the heading's Close on the phone; the cancel-feast dialog says Back | Yes to both |
| D4 | Home's primary is the burrow, not *Start a burrow* | Yes; *Start a burrow* at the foot |
| D5 | Who has scattered while scattering is open: the burrow's feast card and its list (the mock), the scatter screen too, or nothing | The feast card and list; the scatter screen stays as decided in pass six |
| D6 | The first meeting as a whole screen (the mock) or the current dialog | The screen |
| D7 | Simple view while no critter has a mesh: hidden, or kept with a line | Hidden until the 3D critters land |
| D8 | The statement bubble: fixed 378 px, or sized to the text up to 378 | Sized to the text; the critter in focus shows more of the floor for short statements |
| D9 | *Replay Feast* and *Download* on the phone: ending the list, or pinned at the card's foot | Pinned; the CSV is the operator's one job |
| D10 | Names: 16 characters everywhere (the design), or 40 (the field), or 80 (the server) | 16, with the counter |

## Evidence and limits

- **Captures.** 170 images in `images/`: 23 before connecting (phone, desktop and dark), 28 connected, 16 long connected pages whole (including a member's view of the burrow and of gathering), 7 live-game frames, 42 gallery states on the phone and desktop, 54 mock frames. All at device pixel ratio 1, JPEG at quality 80, reduced motion. The mock frames are the flow page's own, in the Inked daylight look, unscaled.
- **How to re-run.** With the mock stack on 5173 (`bun run dev:local`) and the flow page on 4185 (launch config `app-screens`), from the repository root: `node docs/reviews/ui-audit-2026-11/capture.mjs` then `node docs/reviews/ui-audit-2026-11/capture-long.mjs`. Each seeds its own burrow through `/api/dev/seed`; the first moves the stack's clock to scattering and then to the feast for its seed, so run it last on a stack you share. `capture-frame.mjs` makes the comparisons for wave one of the build (the first meeting, naming a kept critter and the profile, each beside its flow-page frame, light and dark, phone and desktop, in `images/frame/`); it connects throwaway accounts and moves no clock.
- **Walked live:** the launcher, the connect sheet, the five steps, the invite, the first meeting with one re-roll, home, the burrow and its dialogs, start a burrow, setup in both kinds, a saved draft and its open dialog, gathering in both kinds with the extend and cancel dialogs, the profile and Settings, the reveal, reading, scattering with taps and the plus button, the deadline passing under the screen, the wait for the key. **From the gallery:** all 21 core states, phone and desktop. **From the code only:** confirming a connection, nothing to connect with, a declined connection, the empty home, a fresh burrow, joining, too few critters, joined too late, offline, the three notices, the expired session.
- **Not checked:** a real phone, a screen reader, WebKit, sound, the 3D meshes (none load with Garden Spirits), the dark look beyond the launcher, home and the burrow.
- **One harness note.** Playwright's `click` on the dock's plus button and the count field timed out on the live scatter screen under phone emulation, though both take presses (`c04` was made by dispatching pointer events, and the devtools hit test lands on the button). The October screens suite drives the same controls without trouble, so this is left as a note for whoever extends `capture.mjs`, not as a finding against the app.
- No code was changed. This folder, its images, the two scripts and the Schell digest are the only files added.
