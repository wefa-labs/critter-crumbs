# How the app explains itself: a review of the first steps

3 November 2026. Reviewed on the production site (www.crittercrumbs.app, `main` as deployed on 25 October) in the app's browser pane at 375 × 812 and 800 × 600, dark mode, version 1 critters, against the code (`packages/app/src/app/launcher.tsx`, `invite.tsx`, `learn.tsx`, `learn-steps.ts`, `learn-example.ts`, `onboarding.tsx`, `connect.tsx`; `packages/shared/src/copy.ts`) and the two books Afolabi asked the review to follow: Steve Krug, *Don't Make Me Think, Revisited* (2014) and Adam Wathan and Steve Schoger, *Refactoring UI* (2018). Page numbers are the PDF's page index (for *Refactoring UI* that is also the printed page; the Krug PDF carries no printed numbers). The two digests the review drew on, with the references chapter by chapter, are `krug-digest.md` and `wathan-digest.md` beside this file. Neither book has a chapter on tutorials or onboarding, and neither says a word about explaining cryptography; where a finding applies a principle to this flow, the application is mine.

## In short

The first steps do one job well. In four short screens a visitor learns what a handful is, that a tap gives and a hold pours, that scatters stay hidden, and what a result looks like, and the practice step is the best kind of instruction there is: one you do instead of read. Keep all of that.

What they do not do is answer the three questions a first-time visitor actually brings: *what is this*, *what will happen to me over the next week*, and *why should I believe nobody can peek*. And the app has nowhere for the curious to go. The best explanation of the product that exists, the pitch deck's promises, the box diagram and the "three chains underneath", PRD §8's guarantee table and honest limit, the technical spec's first two sections, is reachable from no screen, and the app never mentions that its source is public under MIT since 28 October.

The fix is not a longer tour. Krug's rule that nobody reads instructions holds; the steps should stay four or five screens of one sentence each. The fix is three layers, each one tap from the place its question comes up, and none of them ever shown unasked:

1. **The line.** The tagline on the launcher and the explainer on the invite screen, as now, plus a way from the invite screen into the steps. Most visitors arrive by a feast link (PRD F1) and today that screen is a dead end for understanding.
2. **The steps.** The four screens, tightened: define *feast* on the first, add one screen for the three phases and two deadlines, say on the private step who cannot peek, and let the result step say what the table cannot. Then return the visitor to where they came from.
3. **The page.** One scrollable page behind the link *Why nobody can peek*: the five promises, the one thing we will not pretend, a four-line glossary, what runs where, and the way out to the public source and the specs. Linked from the private step, the last step, the waiting screen, the results and Settings.

## What a visitor meets today

| Entry | Screen | What it says | Where it leads |
|---|---|---|---|
| The app opened on its own | Launcher | Wordmark, "Everyone gets a handful of crumbs to share.", four critters dozing, the beta notice | Connect; How it works (quiet link); Music |
| A feast link, not connected | Invite | Burrow and feast in the header, the critters asleep ("The critters are asleep until you connect."), the context line, both deadlines, "Everyone here gets the same handful of crumbs to share out. Where they go stays private until the feast." | Connect to join. **Nothing else** |
| Connect | Connect sheet | "Choose how to connect", one row per app, "You'll be asked to sign. It costs nothing and nothing goes on-chain." | the app chosen; Cancel |
| First connect | First meeting | "Meet your critter. Made from your address. Re-roll up to 4 times, then it's yours." and the name field | Keep this one |
| How it works | Step 1 | "Everyone gets the same handful. In a feast, everyone has the same crumbs to share out, and gives all of them away." | Skip; Next |
| | Step 2 | "Tap to give a crumb. Hold to pour. Try it: give these ten crumbs away. They are only practice." and the count | Skip; Next |
| | Step 3 | "Where they go stays private. Nobody sees where anyone's crumbs went until the feast. Then every scatter opens at once." | Skip; Next |
| | Step 4 | "When the feast opens. Four critters had 100 crumbs each in this example. Three scattered 300.", the table, "Moss received 120 of 300 crumbs: 40.0%.", "Fern didn't scatter and still receives a share." | Got it, which goes to `/` |
| Connected, later | Settings and the profile menu | How it works | the same four steps |
| Scattering closed | The waiting screen | "The feast is being laid out. Fetching the key and opening every scatter. This takes a moment." | nothing |
| The feast has played | Results | the table, who did not scatter, "Only the burrow can see these results." or "Anyone with the link…", "Result fingerprint" (a disclosure with a hash) | Download CSV; Record the result |

Captures, as reviewed: [launcher on the phone](images/launcher-phone.jpg), [on desktop](images/launcher-desktop.jpg); the steps on the phone, [one](images/step-1-handful-phone.jpg), [two](images/step-2-practice-phone.jpg), [three](images/step-3-private-phone.jpg), [four](images/step-4-results-phone.jpg); on desktop, [one](images/step-1-handful-desktop.jpg) and [four](images/step-4-results-desktop.jpg). The invite screen, the connect sheet and the first meeting were read from the code and the 16 October captures (`../scene-onboarding/`), not opened live: no public feast link was to hand.

## The two books, in a paragraph each

**Krug** is about the first five seconds. People do not read pages, they scan them, pick the first reasonable option and muddle through, and they do not care how things work (ch. 1–2, pp. 29–46); a page should be self-evident, or at least self-explanatory, so that no question mark forms over the visitor's head (p. 37). A first page has to answer *what is this, what can I do here, what do they have here, why here* at a glance (the figure on p. 119), and then *where do I start* (pp. 128–129), with a tagline of six to eight words (pp. 125–128) and, when one is needed, a terse welcome blurb that points the few who want more to a fuller explanation (pp. 123–125). Words should be halved and halved again; promotional happy talk goes, and instructions go unless they are the smallest amount that lets someone act, placed where the action is (ch. 5, pp. 77–80). Any number of taps is fine as long as each is a mindless, unambiguous choice (pp. 70–72), and a little help that is brief, timely and unavoidable beats a tour before it (p. 75). Many visitors arrive mid-stream from a link, so the page they land on must stand alone (pp. 112–113, 121–122), and a link should reach the thing linked, not a front page (pp. 185–186). On a phone nothing hovers and flat styling strips the cues that tell a control from a heading, so what matters must plainly look tappable (pp. 187–189); his own trial of a polished ten-screen tour left volunteers unable to do the app's main task, and first-launch tours are hard to find again (pp. 193–196). A site runs on goodwill: hiding what people want to know, making them hunt, or putting sizzle in the way drains it; candour, saved steps and honest answers to the questions people are likely to have fill it back (ch. 11, pp. 204–211). His test for a first screen is to show it to three people for a few seconds and ask what it is and what they would do (ch. 9, pp. 144–162), and his advice to a team that finds people confused is to subtract before adding (pp. 169–170).

**Refactoring UI** is about what the eye does once it is there. Not everything can be important: every screen has primary, secondary and tertiary text, and the way to make the main thing stand out is usually to quiet everything else, by weight and colour more than by size (*Hierarchy is everything*, pp. 36–47). Labels are a last resort: a value with its unit, or a sentence, beats a label-and-value pair (pp. 48–52); a document's heading order and its visual order are different things (pp. 54–55); a screen has one primary action, a few secondary, and the rest are links (pp. 60–62). Start with more white space than feels right and take some away (pp. 66–69); a screen does not have to be filled, and the right canvas is about 400 px wide, adapted upward (pp. 76–82); sizes should not scale in proportion, a 20 to 24 px headline over 14 px body being the book's own example (pp. 84–95). Lines run 45 to 75 characters (pp. 114–116). Personality comes from a few consistent choices, typeface, colour, corner radius and wording (pp. 20–26), here the painted room, the rounded display face and plain language; and a page gets its finish from fewer borders (pp. 238–246), empty states treated as a first meeting with the product (pp. 234–236) and art drawn for the size it is shown at (pp. 208–213) rather than from decoration.

Neither book argues for a longer tour, and Krug's rule for a confused visitor is to take away before adding. Both argue for saying the one right thing at the moment the question arises, and for leaving a door open to more. The proposal below adds a sentence only where a question mark forms, and adds a door rather than a wall.

## Findings

Ordered by how much they change for a visitor. Each gives what was seen, the principle, and the change.

### F1. The commonest visitor has no way to the steps

A feast link is how most members will first meet the app (PRD F1: understand first, connect second). That screen (`invite.tsx`) shows the burrow line, the feast, both deadlines, the explainer and *Connect to join*, and that is all. There is no *How it works*; the two sentences of the explainer are the whole explanation, and the word *feast* appears in the header, the explainer and the deadlines without ever being introduced.

Krug's questions for a first page (p. 119, pp. 128–129) are what is this, what can I do here, why here, and where do I start, and a page people land on from a link has to answer them on its own (pp. 112–113, 121–122). The invite answers the first two in one line and leaves the visitor one choice, *Connect to join*, which is not a mindless choice (pp. 70–72) when you do not know what you are joining. Hiding the thing people want to know before they commit is the first item on his list of what drains goodwill (pp. 204–207).

**Change.** Under *Connect to join*, the launcher's quiet *How it works* link, in the same place and style (`launch.learn`, no new string), and the steps return to where they were opened from (today *Skip* and *Got it* both go to `/`, which for a visitor is the launcher; Krug: a link should reach the thing linked, not a front page, pp. 185–186). The explainer stays as it is; it is good.

### F2. The steps teach the thumb but not the week

The four steps are the handful, the tap, the hidden scatter and the result. Nothing in them says that a member first **writes** what they did (gathering), that the statements open all at once and are **read** before anyone scatters, that there are **two deadlines**, or that a scatter can be **changed** until the second one. A visitor who finishes the steps can picture the thumb and the table and cannot picture their week. The pitch deck's slide *Three phases, two deadlines* has those words already.

This is Krug's *what can I do here* (p. 119) and his *know the main things people want to do* (pp. 204–211); the PRD's own success criterion for October is that the feast runs start to finish without anyone asking how it works (§11), and the writing and reading are most of what they will do.

**Change.** One more step, between the tap and the private step, with the three phases as three short lines, each a bold lead and one clause (Refactoring UI: fold the label into the value rather than stacking them, pp. 48–52). Five steps is still a minute, and Krug's point that each step should cost no thought (pp. 70–72) favours five single-idea screens over four double ones. The alternative, folding one sentence into step 1 and one into step 3, keeps four steps but makes each one carry two ideas, which is what the single-sentence screens were avoiding. My recommendation is the fifth step; Afolabi's call (D1 below).

### F3. *Feast* and *scatter* are introduced by use and never defined

Step 1 opens "In a feast, everyone has the same crumbs…", step 3 ends "Then every scatter opens at once." The vocabulary is deliberate and should stay (AGENTS.md); but Krug's first list of things that make people think is cute, clever or insider names (pp. 32–33), and a made-up name is a question mark until its first use carries its meaning.

**Change.** Step 1's sentence defines the feast by what it is for: *A feast is how a group shares something out. Everyone gets the same crumbs, and gives all of them away.* The page (F4) carries the four-line glossary the pitch already has, so *burrow*, *critter*, *scatter* and *feast* each get one line somewhere a reader can find them.

### F4. Nowhere to go deeper

Nothing in the app links out, and no screen explains anything beyond its own sentence. The curious reader's questions, *how do you know nobody can peek, who holds the key, what if the host drops mine, can I check the result, what does it run on*, are answered, well, in the pitch deck (*What you are promised*, *We hold your scatter. We cannot open it.*, *Three chains underneath*), in PRD §8 (the guarantee table and the honest limit) and in the technical spec (§1 and §2). None of it is reachable from the app, the pitch is not even served by the site, and the repository went public under MIT on 28 October without the app saying so.

Krug's home page keeps its blurb short precisely because it can point the few who want more to a fuller explanation (pp. 123–124); most people guess first, and the pointer exists for those who cannot. His goodwill list includes honest answers to the questions people are likely to have, as against marketing posing as questions (p. 210). The design system's own line that the first steps are "the one tour" (§9) is about things that pop up; a page someone chooses to open is not a tour.

**Change.** One page, described below. Its name is a question, because that is what the reader has: *Why nobody can peek*.

### F5. The private step states the rule and stops

"Nobody sees where anyone's crumbs went until the feast." The reader's question mark is immediate: *nobody? not even you?* The pitch answers it in one sentence; the step does not, and there is room on the sheet for it (F7). Krug's candour rule (pp. 207–210): say plainly what is hidden, from whom, and until when.

**Change.** The body adds the one clause that answers the question, and a tertiary link opens the page: *Nobody sees where anyone's crumbs went until the feast, not even us. The key that opens every scatter is released at the deadline, and not before.* then *Why nobody can peek*. The seed pods on the floor already say it in the painting ("gentle hiding, not locks", design pass Appendix A); the sentence says it in words, and the two agree.

### F6. The result step explains with numbers twice and the rule once

The step says "Four critters had 100 crumbs each in this example. Three scattered 300.", shows the table, then "Moss received 120 of 300 crumbs: 40.0%." and "Fern didn't scatter and still receives a share."

"Three scattered 300" reads two ways on first pass. The Moss sentence repeats the table's first row in words; Refactoring UI would say the table is the value and the sentence a label for it (pp. 48–52), and Krug would halve the words (pp. 77–78). What the table cannot show is the one rule a member will actually wonder about at a real feast: shares come from the crumbs actually given, so Fern's unspent hundred count for nobody; and what the feast *is*: every scatter opening at once, added up on your own device. Neither is said.

**Change.** *Every scatter opens at once, and your own device adds them up. Here, four critters had 100 crumbs each and three of them scattered.* Table. *Shares come from the crumbs actually given, 300 in all, so Moss's 120 is 40.0%.* *Fern didn't scatter and still receives a share.* Whether the tutorial should say 40% rather than the results table's 40.0% is a small call (D5): the table's format is the real one and consistency argues for keeping it.

### F7. Half the sheet is empty on three steps, and the desktop panel is mostly empty

The sheet is one height on every step so the floor does not move (decision of 11 October; raised from 300 to 410 px on 16 October to fit the worked result). On the phone, steps 1 to 3 fill the top two-fifths of it; on desktop at 800 × 600 the panel holds four lines at the top and two buttons at the bottom.

Refactoring UI is clear that a screen need not be filled and that empty space is not a defect in itself (pp. 76–82). The problem is what the eye does with it: a sheet that is half blank reads as unfinished, and the text sits a long way from its actions. On desktop the text is also set at the phone's scale against a 600 px painting; the book's warning that sizes should not scale in proportion cuts both ways, and its own example is a 20 to 24 px headline over 14 px body (pp. 84–95).

**Change.** Keep the steady floor. Give the room a job: the tertiary line (the link to the page on steps 4 and 5, a one-line caption elsewhere) sits at the foot of the content, above the actions, so the sheet has a top, a middle and a bottom; a tertiary action is a link, not a button (pp. 60–62). On desktop step the panel up one size (20/16 instead of 16/14, from the existing scale) and cap its measure at about 60 characters (pp. 114–116).

### F8. The *why* is also needed at the moment of waiting, and at the result

The waiting screen's "Fetching the key and opening every scatter. This takes a moment." is exactly the right in-place line, and waiting is one of the few moments a person reads. It links nowhere. On the results, *Result fingerprint* is a disclosure with a hash and no word on what to do with it, and nothing says the numbers were added up on this device, which is the whole point.

Krug's help at the point of need, brief, timely and where it cannot be missed (p. 75), and his creature comforts (pp. 204–211).

**Change.** The waiting screen and the results each get one line with the same link, *Why nobody can peek*; the fingerprint's disclosure gets its purpose in a sentence: *Compare it with another member's. The same fingerprint means the same result.*

### F9. Connect does not say what it connects

The launcher's *Connect* and the invite's *Connect to join* open the sheet, which only then says "Choose how to connect" and "You'll be asked to sign. It costs nothing and nothing goes on-chain." The question *do I need something I don't have?* is answered one tap late (Krug, pp. 204–207). For the October council everyone already has an account app (PRD §2), and sign-in with an email is on the roadmap, so this is low. The page carries one line on it (*You connect with the account app you already use. Signing is free.*); the sheet's own line is good and stays.

### F10. The steps are never offered after the first meeting

The flow page showed them after *Keep this one*; the decision of 11 October deferred that until the first-run screens are rebuilt. Krug's finding is that first-launch tours are skipped, forgotten and then impossible to find again, so what matters is a permanent, obvious way back to them (pp. 193–196); the design system's rule is that nothing opens unasked (§9). Both are satisfied by a line, not a dialog: *How it works* in the home empty state ("No burrows yet"), which is the first screen a member without a link sees, next to *Start a burrow*. Refactoring UI treats an empty state as the first meeting with the product, worth one sentence and one action (pp. 234–236). A member who came by a link lands in the feast and already has the invite screen's link (F1). Optional (D4).

### F11. What is already right, and must stay

The practice step is the book's own prescription, teaching inside the real gesture rather than describing it (Krug, pp. 193–196). Each step focuses its heading; the dots are named "Step 1 of 4" for a screen reader; each practice critter is a button with a name; the count has its words; *Skip* is always one tap (Krug: a visible exit from any step sequence, p. 97); the scatter screen keeps its one-line instruction (p. 75); every sound pairs with text; the sheet pins its actions and only the content scrolls on a short phone (16 October record). Screen-reader users scan by ear, so each line leads with its key word (pp. 219–222): the proposed phases lines do. The new page and the new step follow the same rules: headings in order, every string a copy ID, links created as elements, no `innerHTML`, external links that say in words where they go.

## The proposal: three layers

| Layer | Where | What it answers | Time |
|---|---|---|---|
| The line | Launcher tagline; invite explainer | What is this | 5 s |
| The steps | *How it works*, 5 screens | What do I do, what happens when, who can see | 60 s |
| The page | *Why nobody can peek* | Why believe it, what runs where, where is the source | 3 min |

Where each layer is reached from:

| From | Link | To |
|---|---|---|
| Launcher | How it works (as now) | the steps |
| Invite screen (new) | How it works, quiet, under Connect to join | the steps, returning to the feast |
| Settings; profile menu (as now) | How it works | the steps |
| Home, no burrows (optional) | How it works | the steps |
| Step 4 (private) and the last step | Why nobody can peek | the page |
| The waiting screen | Why nobody can peek | the page |
| Results, under the summary | Why nobody can peek | the page |
| The page | Got it | back where it was opened from |

### The steps, revised

Five screens, one sentence each, the same floor and sheet. Proposed wording, for §10; final words are Afolabi's.

| Step | Title | Body |
|---|---|---|
| 1 | Everyone gets the same handful | A feast is how a group shares something out. Everyone gets the same crumbs, and gives all of them away. |
| 2 | Tap to give a crumb. Hold to pour. | Try it: give these ten crumbs away. They are only practice. *(unchanged)* |
| 3 *(new)* | Three phases, two deadlines | **Gathering.** Everyone writes what they did. Nobody else in the burrow can read it yet. · **Scattering.** Every statement opens at once. Read them, then give; you can change your mind until the deadline. · **The feast.** Everything opens, and the numbers are there. · Both deadlines stay on screen, in your own time. |
| 4 | Where they go stays private | Nobody sees where anyone's crumbs went until the feast, not even us. The key that opens every scatter is released at the deadline, and not before. → *Why nobody can peek* |
| 5 | When the feast opens | Every scatter opens at once, and your own device adds them up. Here, four critters had 100 crumbs each and three of them scattered. *(table)* Shares come from the crumbs actually given, 300 in all, so Moss's 120 is 40.0%. Fern didn't scatter and still receives a share. → *Why nobody can peek* |

The new step's scene: the Window painting, the quartet awake, no heaps, each with the thought bubble the reveal screen uses, so the floor says *reading* while the sheet says it. If the bubble is not cheap to reuse in the shell, the quartet awake with nothing at their feet is enough.

### The page behind *Why nobody can peek*

A scrollable page at `/how-it-works/why`, its own lazy chunk like the steps, the wordmark and Music in the header, *Got it* pinned at the foot. Everything on it already exists in the pitch deck and PRD §8; this is the order and the register, not new claims.

1. **What you are promised.** Five items, each a bold lead and one sentence, from the pitch's slide of the same name: no one can read what you gave until the feast (your crumbs are locked to a time, not a person; independent key holders release the key at the deadline, and there is nobody to ask for it early) · we cannot make one up (yours is signed by you) · we cannot quietly lose one (the full list goes up the moment scattering closes; check that yours is on it) · everyone gets the same numbers (the count runs on your own device; there is no server answer to argue with) · nothing about you is measured (no analytics, no telemetry).
2. **One thing we will not pretend.** The honest limit, in the pitch's two sentences: before the feast nobody can read a scatter because nobody has the key; after it the key exists, so keeping who-gave-what private is a rule the app enforces, not something the lock does.
3. **The words.** Four lines: your group is a burrow; the people or budget lines are critters; what you give is your scatter; the feast is the moment every scatter opens.
4. **What runs where.** For the reader who wants the machinery, in secondary text so the first three sections stay the page: your device locks and signs your scatter and does the counting · Critter Crumbs keeps the locked boxes, posts a receipt for each and hands them back at the deadline · Shutter's key holders on Gnosis Chain hold the key and release it at the deadline; Shutter covers the fee · Base carries your signature on every scatter and, if the burrow chooses, the public result; signing is free and posting the result is the one time anyone pays · Ethereum carries names, read once. This is the one section where Shutter, EAS, Gnosis Chain and Base are named, because the reader who scrolled this far wants the real names.
5. **The source.** One line: the software is public under MIT, with the critter art and the generator reserved; then two links, the repository on GitHub and the technical spec, created as elements with `rel="noopener"` and words that say they leave the app. Whether to link out at all is D3.
6. **Got it.**

Design notes, from Refactoring UI. One column, a measure of about 34 em (pp. 114–116). The five promises are a list, not cards, and have no borders: spacing separates them, more between items than inside one (pp. 96–99, 238–246). Leads are bold at the body size, not larger; the heading order is for the document, the visual order is weight and colour (pp. 54–55). The technical section is set in the secondary text colour, so emphasis comes from quieting it (pp. 42–47); on the dark sheet that colour should be a tint of the sheet's own violet, not a grey, which the book says looks washed out on a coloured ground (p. 44). One illustration, the closed seed pod from the private step, at the top, drawn for the size it is shown at; no icons scaled up to stand in for it (pp. 208–213). Links in the body are underlined in the text colour (pp. 126–127; touch has no hover, so the underline stays). The primary action is *Got it* and nothing else is a button (pp. 60–62). Honey stays on the crumbs. The page must read in light and dark, with Still critters and in Simple view, like every other screen.

What it must not do: use *seal, round, cache, vote, ballot* or *wallet*; say more than the PRD guarantees; carry a diagram that needs the canvas; open unasked; add a dependency (no markdown library: it is DOM, with one string per line in `copy.ts`).

## Build order

Tracer bullets, each one shippable and reviewable on its own. Workstream B throughout, with small shared changes to `copy.ts`.

| # | Change | Files | Checks | Docs |
|---|---|---|---|---|
| 1 | Invite screen links to the steps; the steps return where they were opened from (`history.back()` when the app opened them, `/` otherwise) | `app/invite.tsx`, `app/learn.tsx`, `app/ui.ts` (navigate) | `tests/e2e/launcher.spec.ts` ("a feast opened from a link…" gains the link; the steps' Got it returns to the feast); `tests/e2e/first-steps.spec.ts` | Design System §9 "Arrive by a link"; `docs/decisions.md` |
| 2 | Copy pass on the four steps (F3, F5, F6) | `copy.ts`, `learn.tsx` (the result step's lines) | the e2e step walk; the copy lint | §10 table; `docs/decisions.md` |
| 3 | The phases step (F2) | `learn-steps.ts` (scene), `learn.tsx` (`WORDS`), `copy.ts` | the e2e walk's step count; the screen captures at 320 × 568 and 375 × 667, both themes, v1 and v2, as in the 16 October record | §9 row; §10; `docs/decisions.md` (amends D27's "four") |
| 4 | The page (F4), its route and its links from steps 4 and 5 | new `app/why.tsx` (lazy), `app.tsx` (route), `copy.ts` (`why.*`), `styles/screens.css` | a screen test for the page's content and links; copy lint; `bun run build` (the shell gains the route and two link strings; the page is its own chunk) | §9 row; §10; §14 decision; `docs/decisions.md` |
| 5 | Links from the waiting screen and the results; the fingerprint's sentence (F8) | `app/results.tsx`, `copy.ts` | the results screen tests | §10 |
| 6 | The sheet's foot and the desktop scale (F7) | `styles/screens.css` | the capture matrix | §6 if the desktop scale is written down |
| 7 | Optional: the home empty state's link (F10) | `app/burrows.tsx` | the home test | §9 |
| 8 | A get-it test with two council members before the rehearsal (below) | | | the result in this folder |

Steps 1 to 3 were built on 3 November on the branch `claude/first-steps-explain` (`docs/decisions.md`, 2026-11-03): the invite link and the return path, the copy pass, and the week as a third step with every statement open in a thought bubble beside each head. One thing the build changed from the plan: the private step says "not even us" but does not yet link to the page, which does not exist until step 4. The step 3 captures beside this review predate one later change: the gathering line now says nobody else *in the burrow* can read a statement, because the host can (Technical spec §2).

Steps 4 to 7 were built on 9 November on the branch `claude/why-nobody-can-peek` (`docs/decisions.md`, 2026-11-09), after Afolabi took the recommendations for D2 to D4 below. What the build changed from the plan: the page's lines live in their own module, `copy-why.ts`, beside `copy.ts`, because the shell carries `copy` whole and had 122 bytes to spare; both waiting sheets link to the page, so on the phone they grow from 250 to 290 px while the feast is laid out and from 270 to 330 while the key is not out; Got it goes back through the browser's history, and the steps and the results remember where they were, so the steps return to the same step and the results do not play the feast again; and two lines say no more than PRD §8 does (the store cannot open a scatter *before the deadline*, and once the key exists anyone in the burrow could work out who gave what). The desktop panel already set the 20/16 that F7 asks for (the 16/14 above was read off a capture taken at about 80% zoom), so Afolabi chose to go a size further: from 1,280 px the panel widens to 480 to 620 px and sets 28/20, which keeps 44 to 60 characters to a line. Open, for Afolabi: captions for the foot of steps 1 and 2, which would be new words; and whether Settings links to the page, as *In short* says and the table of links does not. Captures of the build, at 375 × 812 and 1280 × 800 in both looks, are in `images/why/`, made by `capture-why.mjs`. Step 8 is Afolabi's to run.

Constraints that hold throughout: every string is a copy ID with its row in §10; the generator and the tally are untouched (the worked example still runs through the production tally); no `Date.now()`; the shell stays within its budget (it is at about 104 KB of 120 KB; the page is lazy); nothing opens unasked; the vocabulary rules.

## Decisions for Afolabi

| | Decision | My recommendation |
|---|---|---|
| D1 | Five steps with a phases screen, or four with the phases folded into steps 1 and 3 | Five |
| D2 | The page's name | *Why nobody can peek*; the alternative *Under the hood* names the machinery rather than the question |
| D3 | Whether the page links out to GitHub and the technical spec, or stays a plain-language page with no exit | Link out, in the last section only; the source being public is part of the promise |
| D4 | Offer the steps on the home empty state | Yes, as a line, never a dialog |
| D5 | 40% or 40.0% in the worked example | 40.0%, to match the real table |
| D6 | The new step's scene: thought bubbles or the quartet awake alone | Bubbles if they come cheaply, else awake alone |

**Answered.** D1, D5 and D6 with steps 1 to 3 on 3 November, and D2, D3 and D4 on 9 November before steps 4 to 7, each as recommended (`docs/decisions.md`).

## How to check it

Beyond the suites, Krug's first-impression test (pp. 144–162), before the rehearsal, with three people who have not seen the app, on their own phones, filming the screen and their fingers rather than their faces (pp. 199–200): show the invite screen and ask *what is this and what would you do first*; then let them open *How it works* and ask, after it, *who can see where your crumbs went, and when*; then ask *what happens between now and the result*. Write the answers in this folder. The PRD's October criterion is that nobody needs help; this is the cheapest way to know, and if they are still confused, take words away before adding any (pp. 169–170).

## Evidence and limits

Walked live: the launcher and the four steps, phone and desktop, dark mode, version 1 critters, including the practice step (one tap gave one crumb, "9 to go"). Read from code and the 16 October captures, not opened live: the invite screen, the connect sheet, the first meeting, Settings' and the profile's links, the waiting screen and the results. Not checked: light mode, a real phone, a screen reader, the dev build's version 2 critters. No code was changed; the captures in `images/` are the only files added.
