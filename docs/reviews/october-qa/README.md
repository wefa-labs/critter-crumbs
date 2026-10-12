# October QA pass

Run from 9 to 11 October 2026 against `main` at `111bf4d`, the day the sound set landed, and from the second evening against `main` plus the fixes the pass led to. One agent tested each area on its own local stack, in Chromium and in WebKit, the engine behind Safari, and two more then re-ran every finding rated blocker or major. Every finding has its reproduction on its area's page.

**All 8 areas are done, with 127 findings:** 4 blockers, 29 major, 56 minor and 38 notes, as the finders rated them. **After the verifiers, 1 blocker and 23 major stand.**

| Area | Findings | Page |
|---|---|---|
| Lifecycle: whole feasts, both kinds, both engines | 20 | [areas/lifecycle.md](areas/lifecycle.md) |
| Rules and access control | 17 | [areas/rules.md](areas/rules.md) |
| The production build | 16 | [areas/production-build.md](areas/production-build.md) |
| The 28 edge and error states | 20 | [areas/edge-states.md](areas/edge-states.md) |
| Sound | 13 | [areas/sound.md](areas/sound.md) |
| Accessibility | 15 | [areas/accessibility.md](areas/accessibility.md) |
| Copy, the privacy sweep and the documents | 17 | [areas/copy.md](areas/copy.md) |
| Performance | 9 | [areas/performance.md](areas/performance.md) |

## Read this first

- **Three defects made production unusable, and none of them shows on the development server.** The page was blank under the security policy, Connect failed before the wallet was asked, and the build could not save a scatter or open a feast. All three have a fix open: [#42](https://github.com/wefa-labs/critter-crumbs/pull/42) and [#43](https://github.com/wefa-labs/critter-crumbs/pull/43). A verifier then took two members through a whole feast on the bundle built from them, in Chromium and in WebKit: scatters saved and changed, the close, the key, one result for both, a CSV that adds up, and no breach of the page policy. Production itself has never been deployed.
- **Two verifiers re-ran all 33 findings rated blocker or major and tried to knock each down. None fell.** 4 are fixed, with the fix checked. 27 were reproduced, 5 of them rated lower than the finder had: lifecycle-15 (note), rules-06 (minor), accessibility-02 (minor), accessibility-04 (minor), accessibility-05 (minor). 2 could not be tested here, though the code agrees with the finder in both: production-build-03 needs Shutter's own keypers, and copy-02 needs a deployment on Vercel. That leaves **1 blocker and 23 major** (21 separate faults: 2 were found twice). Each verdict, with what was run, is on the finding's page. Minor findings and notes were not re-run: there, "confirmed" is the finder's own word.
- **What stands, in the order members would meet it.**
  - *Public results.* For a feast set Public, any one member can record totals that are not the tally; the first record stands and the public page shows it, while every member's own screen stays right ([rules-02](areas/rules.md#rules-02), the one blocker). And from the production bundle nobody can record a result at all ([production-build-05](areas/production-build.md#production-build-05)). Run October with burrow-only results.
  - *Phones without a wallet app.* Connect opens a dialog that offers nothing and does not say what to do ([production-build-07](areas/production-build.md#production-build-07)). Until there is a QR-code connect, the only way in on a phone is a wallet app's own browser, and nobody has tried that on a real phone yet.
  - *Slow phones.* When 3D gives up, which is the designed ending for a slow phone, a dropped WebGL context or a 3D chunk that fails to load, the notice pushes the scatter screen 115 px sideways and + and the next arrow are off the screen ([edge-states-01](areas/edge-states.md#edge-states-01), production bundle only). Try 3D again puts it back once; by the code, Simple view in Settings hides the notice.
  - *Laptops.* After any feast the Results bar under the critters is drawn but a pointer cannot press it ([lifecycle-02](areas/lifecycle.md#lifecycle-02), both builds). The keyboard can, and the results list, Replay Feast and Download CSV in the side panel are untouched.
  - *A page left open across a deployment* goes blank the next time it opens a feast or starts reading ([production-build-06](areas/production-build.md#production-build-06)). Do not deploy during a feast.
- **Two findings from the copy sweep bear on the rehearsal.** The creator's Remove from burrow had no route file on Vercel, so on a deployment it could only fail ([copy-02](areas/copy.md#copy-02)); [#44](https://github.com/wefa-labs/critter-crumbs/pull/44) adds it. And when no saved scatter can be read, the results say "Nobody scattered" ([copy-01](areas/copy.md#copy-01)): in the solo smoke feast that is what the screen shows if the real key does not open the one scatter, so read it there as "could not be opened", not "nothing was saved".
- **On the development build the core held.** Six feasts were built through the screens with four members at once, in both engines: every member computed the same result, the CSV matched it, and no statement or scatter leaked or was lost. In 434 calls across every route and role, the store gave nobody anything early or across burrows. Every client discounted every rule-breaking scatter identically. All 28 edge states still let the feast complete. A whole feast can be done with a keyboard alone.
- **Members will not get the critters most of this pass looked at.** A development build draws the version 2 critters as portraits; a production build draws version 1 in 3D, by the decision of 6 October (DQ5) that production stays on version 1 until a shipping date is set. Almost every finding about a screen was made on a development build. For the serious ones the verifiers looked at the production bundle too, and each verdict begins with the build that shows the fault. Version 2 is also not ready for phones as it is drawn: at a phone's pixel density it ran at about 18 frames a second in Chromium and 3 in WebKit on a fast Mac ([performance-09](areas/performance.md#performance-09)).
- **On the production bundle the budgets that can be counted hold.** No blocker and no major in performance: the launcher is 217 kB in 8 requests with no sound before a gesture, the crypto chunk and Shutter's code load only when needed, a held pour ran at 42 to 45 frames a second under 4x slowdown, 100 crumbs pour in 3.4 s, the feast plays in 7.1 to 7.2 s, and the reveal yields between scatters. One thing a council of ten would see: the tenth critter is never drawn in 3D and stays a flat portrait on every screen ([performance-03](areas/performance.md#performance-03)). Every duration and frame rate was taken on a busy desktop and needs a phone.
- **The wording is clean and nothing phones home.** None of the six banned words is in the 357 strings or on any screen in either engine, and every string comes from the copy file. All 4,407 requests on the development build and all 123 from the built bundle went to the app's own origin; the bundle's one outside call is the documented key fetch from Shutter when the store fails.

## Before a feast can run on production

| Step | State on 11 October |
|---|---|
| Merge [#42](https://github.com/wefa-labs/critter-crumbs/pull/42): the page starts and Connect works under the security policy | Open, CI green |
| Merge [#43](https://github.com/wefa-labs/critter-crumbs/pull/43): the app scatters and opens feasts through Shutter | Open, stacked on #42. Its one red CI run came from a flaky test, not from the app, and the test is repaired (`e4ae4cd`): a wrong Shutter key makes the SDK return garbage about one time in eight, where the test expected a refusal every time. A verifier ran a whole feast on the bundle built from this branch, in Chromium and in WebKit. |
| Merge [#44](https://github.com/wefa-labs/critter-crumbs/pull/44): the route file for removing a critter ([copy-02](areas/copy.md#copy-02)) | Open, independent of #42 and #43. Without it the creator cannot remove anyone on production, and a mistyped address added to a burrow stays a critter in every people feast. The button cannot be pressed until there is a deployment. |
| Register the two EAS schemas on Base Sepolia | Both missing (checked read-only on 11 October). The deploy script refuses without them. It needs Afolabi's keystore. |
| Deploy | Never done. The steps are in [deployment.md](../../build/deployment.md). |
| The solo smoke feast in [rehearsal.md](../../build/rehearsal.md) | Not run. It is the only proof that a key released by the real keypers opens a scatter. If its results say "Nobody scattered", the scatter was saved and could not be opened ([copy-01](areas/copy.md#copy-01)). |
| Use burrow-only results | Recording a public result does not work outside the local rehearsal (production-build-05), so the run sheet's step 8 cannot be done ([copy-10](areas/copy.md#copy-10)). |

## Blockers

"Call" is the finder's recommendation: fix before October, decide (a design call for Afolabi), or accept.

| Finding | What is wrong | Call | State | Verifier |
|---|---|---|---|---|
| [rules-02](areas/rules.md#rules-02) | For a public feast, any one member can record totals that are not the tally; the public page and its CSV then show them for good, and no member is warned. | Decide | Open | Reproduced |

## Major

| Finding | What is wrong | Call | State | Verifier |
|---|---|---|---|---|
| [lifecycle-02](areas/lifecycle.md#lifecycle-02) | On desktop the dock with Results collapses to nothing once the feast has played, and the circle never glides when it turns. | Fix | Open | Reproduced |
| [lifecycle-03](areas/lifecycle.md#lifecycle-03) | On phone browsers under about 800 px tall, name tags on the scatter screen leave their critters and cover each other. | Fix | Open | Reproduced |
| [lifecycle-04](areas/lifecycle.md#lifecycle-04) | In an options feast every member is named by address: who didn't scatter, who gave what, and who recorded the result. | Fix | Open | Reproduced |
| [lifecycle-05](areas/lifecycle.md#lifecycle-05) | While scattering is open, nothing in the app says who has scattered and who has not. | Decide | Open | Reproduced |
| [rules-03](areas/rules.md#rules-03) | While scattering is open, no screen says how many have scattered or who has not. | Fix | Same as lifecycle-05. | Reproduced |
| [rules-04](areas/rules.md#rules-04) | A scatter whose save failed is refused for ever if the retry comes more than five minutes later; the screen keeps blaming the connection. | Fix | Open | Reproduced |
| [rules-05](areas/rules.md#rules-05) | In an options feast, people are named by truncated address: who did not scatter, who gave what, and the giver CSV. | Fix | Same as lifecycle-04. | Reproduced |
| [production-build-03](areas/production-build.md#production-build-03) | No scatter encrypted for a real Shutter identity has been opened with a key Shutter released; the client crypto ran in a browser for the first time in this pass, and it works under the policy. | Fix | Run in browsers with locally made keys (#43). A key from the real keypers is what the solo smoke feast proves. | Could not test |
| [production-build-04](areas/production-build.md#production-build-04) | Once signing is real, every failure that is not the server's will read "Not confirmed. Your crumbs are still here", and a wallet that locked or changed account can never sign again in that page. | Fix | Partly, in #43: failing to fetch or run Shutter's code now says the scatter was not saved. Wallet failures still read as declined. | Reproduced |
| [production-build-05](areas/production-build.md#production-build-05) | A public feast can never show its result on this bundle, and the one result screen it can draw is worded for the rehearsal. | Decide | Open. Rehearse with burrow-only results. | Reproduced |
| [production-build-06](areas/production-build.md#production-build-06) | A page loaded before a new deployment, or that loses one request on a poor connection, goes blank when it opens a feast, starts reading or opens a public result. | Fix | Open | Reproduced |
| [production-build-07](areas/production-build.md#production-build-07) | With no wallet in the browser, Connect opens a dialog that says only "No connection is available in this browser yet." | Fix | Open | Reproduced |
| [edge-states-01](areas/edge-states.md#edge-states-01) | When the game falls back from 3D, its notice is laid out beside the game and pushes the scatter screen off the phone: + and › can no longer be reached. | Fix | Open | Reproduced |
| [edge-states-02](areas/edge-states.md#edge-states-02) | On a phone, a failed save on the gathering page or the burrow page shows its message below the bottom of the screen: where the member pressed, nothing changes. | Fix | Open | Reproduced |
| [edge-states-03](areas/edge-states.md#edge-states-03) | A member still writing when gathering closes loses the words without a word of explanation; a Save pressed a moment late answers "Scattering has closed. The feast is on its way." | Fix | Open | Reproduced |
| [edge-states-04](areas/edge-states.md#edge-states-04) | If the published scatters reach one member altered, their device opens the feast with a different result and says only that some crumbs "couldn't be read". | Decide | Open | Reproduced |
| [accessibility-01](areas/accessibility.md#accessibility-01) | The focus ring on the critters is one thin dark line over a dark painting, the ring on + and − fades with the button when the pile is empty, and with a statement open focus goes to critters hidden under it. | Fix | Open | Reproduced |
| [accessibility-03](areas/accessibility.md#accessibility-03) | A screen reader hears a critter's name on its tag but not the crumbs shown on it, hears nothing when the circle turns, and the confirmation does not say what is being scattered. | Fix | Open | Reproduced |
| [accessibility-06](areas/accessibility.md#accessibility-06) | Who gave what cannot be scrolled sideways with a keyboard in either engine, and in Safari's engine a statement longer than its bubble or panel cannot be scrolled at all. | Fix | Open | Reproduced |
| [accessibility-07](areas/accessibility.md#accessibility-07) | At 200% zoom on a 375 px phone the scatter dock overlaps itself, the confirmation runs off the right edge and the results list has no height; the trouble starts at 150%. | Decide | Open | Reproduced |
| [accessibility-08](areas/accessibility.md#accessibility-08) | On a short phone window the end of a long statement lies under the dock and the results show one row; with the phone on its side the results show none. | Fix | Open | Reproduced |
| [copy-01](areas/copy.md#copy-01) | When every saved scatter is unreadable at the feast, the results say "Nobody scattered" and never name the people whose crumbs could not be read. | Fix | Open. In the solo smoke feast this is the screen a member gets if the one scatter cannot be opened. | Reproduced |
| [copy-02](areas/copy.md#copy-02) | Removing a critter has no Vercel route file, so on the deployment the creator's "Remove from burrow" can only fail. | Fix | Fixed in #44 (open): the route file is added, and the API tests now fail on any answered path that has no route file. Vercel's own route detection gives a 404 without the file and the function with it. Nobody has pressed the button on a deployment. | Could not test |

## Fixed, and the fix checked

Real on `main`, and mended on the tree with both pull requests. A verifier ran the mended path on the production bundle and it works.

| Finding | What is wrong | Call | State | Verifier |
|---|---|---|---|---|
| [lifecycle-01](areas/lifecycle.md#lifecycle-01) | The production bundle refuses to save a scatter or open a feast: both only work in the local rehearsal. | Fix | Fixed in #43 for scattering and opening. Not yet proven with a key from the real keypers. | Fix holds |
| [rules-01](areas/rules.md#rules-01) | The production bundle cannot sign a scatter or open a feast: both functions only throw 'rehearsal only'. | Fix | Same as lifecycle-01. | Fix holds |
| [production-build-01](areas/production-build.md#production-build-01) | Making the bundle scatter and open a feast is days of work, not a removed check; this weekend can rehearse gathering and devices, not a feast. | Decide | Scattering and opening are done in #43. Recording a public result is still open. | Fix holds |
| [production-build-02](areas/production-build.md#production-build-02) | With the real Shutter client called from src/crypto, the build's own checks refuse the bundle twice: lodash's Function('return this') and the crypto chunk ring that broke Connect. | Fix | Fixed in #43. | Fix holds |

## Smaller calls for Afolabi

Not defects by themselves: each needs a decision before anyone builds anything.

| Finding | What is wrong | Call | State |
|---|---|---|---|
| [lifecycle-07](areas/lifecycle.md#lifecycle-07) | Coming back to a saved scatter shows a full pile, zeros and a standing notice that counts scatters across the whole feast, and the notice stays up after scattering has closed. | Decide | Open |
| [lifecycle-10](areas/lifecycle.md#lifecycle-10) | In an options feast every member's gathering screen offers "Start from your notes", a prompt for a personal statement they cannot write. | Decide | Open |
| [lifecycle-11](areas/lifecycle.md#lifecycle-11) | The fourth re-roll closes Meet your critter at once, so the member never sees the critter they ended up with. | Decide | Open |
| [lifecycle-13](areas/lifecycle.md#lifecycle-13) | The feast plays again on every visit to a finished feast. | Decide | Open |
| [lifecycle-15](areas/lifecycle.md#lifecycle-15) | With the version 2 critters that the dev stacks draw, WebKit animates a live game screen at 4 to 7 frames a second, and a held + pours about a quarter of what it should. | Decide | Only with the version 2 critters the development build draws. The production bundle held 60 frames a second in WebKit (production-build-13). Rated major by the finder and note by the verifier. |
| [lifecycle-17](areas/lifecycle.md#lifecycle-17) | The CSV has no byte-order mark, and its share column can add up to 0.999999. | Decide | Open |
| [lifecycle-18](areas/lifecycle.md#lifecycle-18) | Around joining and leaving: a leaver is told the burrow "doesn't know you yet" and loses the burrow-only results they took part in, and a member already in a feast is still marked "Ready to join". | Decide | Open |
| [rules-06](areas/rules.md#rules-06) | Two critters in one feast can carry the same display name, or one that only looks the same. | Decide | Open. Rated major by the finder and minor by the verifier. |
| [rules-10](areas/rules.md#rules-10) | Adding a critter by address accepts a mistyped address: the EIP-55 checksum is not checked, and the zero address is accepted. | Decide | Open |
| [rules-11](areas/rules.md#rules-11) | The sign-in message names no site, so a signature collected on another site signs that person in here. | Decide | Open |
| [rules-14](areas/rules.md#rules-14) | One member can post any number of scatters into a feast; each one is then carried in every member's read of that feast for good. | Decide | Open |
| [production-build-16](areas/production-build.md#production-build-16) | Small things seen along the way. | Decide | Open |
| [edge-states-11](areas/edge-states.md#edge-states-11) | The two lines that tell a member their scatter was not counted sit at the end of the results list, below the fold on a phone, and are neither announced nor raised as an alert. | Decide | Open |
| [edge-states-13](areas/edge-states.md#edge-states-13) | After a later scatter from another tab, the first tab still says "Scattered." under its older crumbs, and its notice offers to save them with no button to do it. | Decide | Open |
| [edge-states-14](areas/edge-states.md#edge-states-14) | When nobody scattered there is no Download, so the CSV of zeros the spec promises cannot be had. | Decide | Open |
| [edge-states-16](areas/edge-states.md#edge-states-16) | A participant who leaves the burrow while scattering is open is shut out of the feast by the app, though the store still takes their scatter. | Decide | Open |
| [sound-04](areas/sound.md#sound-04) | One failed request leaves a screen without its music for as long as it keeps the same track, and costs a member the feast cue on their one live feast. | Decide | Open |
| [sound-05](areas/sound.md#sound-05) | What the loads that are not aborted cost on a slow connection: on 400 kbit/s the music for the screen a member is on starts 56 seconds later than it need. | Decide | Open |
| [sound-06](areas/sound.md#sound-06) | Moving quickly between screens leaves up to 350 MB of decoded tracks waiting for the garbage collector. | Decide | Open |
| [sound-07](areas/sound.md#sound-07) | A touch that only scrolls, a lone Shift or Escape, and a first tap with Sounds and Music both off all make the AudioContext and download the recordings. | Decide | Open |
| [sound-09](areas/sound.md#sound-09) | The burrow and Everyone is full fall about 8 dB across their loop join; the graph is exact, the files end loud and begin soft. | Decide | Open |
| [sound-10](areas/sound.md#sound-10) | Giving the last crumb plays the boing on top of the ta-da, and taking back a critter's only crumb plays the boing with the bip. | Decide | Open |
| [sound-12](areas/sound.md#sound-12) | A feast opened from a link plays in silence: no gesture has been made on the page yet, so its cue, nibbles and fanfare are never heard. | Decide | Open |
| [accessibility-09](areas/accessibility.md#accessibility-09) | The game screens leave Design System §12.1 in five ways: no top-bar landmark, one page title for seven screens, results as an unlabelled list, no Home or End in the read pass, and “You” in place of the own-critter sentence. | Decide | Open |
| [accessibility-11](areas/accessibility.md#accessibility-11) | + and − count a press on two separate paths, so a screen reader's double-tap could give two crumbs or none depending on what the phone sends; I could not tell which without a phone. | Decide | Open; the finder rates it unsure |
| [accessibility-12](areas/accessibility.md#accessibility-12) | The music starts with a member's first tap or key press, the one that opens Settings included; turning it off takes four keys from the first screen, five from a game screen that has just opened and twelve from the results. | Decide | Open |
| [accessibility-15](areas/accessibility.md#accessibility-15) | Nothing in the repository checks accessibility automatically; the axe-core run that §12.8 says is owed does not exist. | Decide | Open |
| [copy-09](areas/copy.md#copy-09) | On a public feast members read "Anyone with the link can see these results." before anything is recorded, the visitor's page is one bare line, and in the production bundle the Record button can only answer "Can't reach the burrow right now." | Decide | Open. The Record button is production-build-05. |
| [copy-13](areas/copy.md#copy-13) | The server logs nothing at all: there is no address to mask, and after a failure there is nothing in the function logs to read. | Decide | Open |
| [copy-14](areas/copy.md#copy-14) | A scatter leaves a receipt in the browser, named by feast and address, and Disconnect does not remove it. | Decide | Open |
| [copy-15](areas/copy.md#copy-15) | Voice: among the newest strings, the Sounds line no longer describes what Sounds governs, and a handful of others would puzzle a first-time council member. | Decide | Open |
| [performance-02](areas/performance.md#performance-02) | The first tap anywhere starts 1.84 MB of sound downloading, and on a slow connection it holds up what the tap asked for. | Decide | Open |
| [performance-01](areas/performance.md#performance-01) | The read pass loads the 3D chunk and draws 3D critters, which three documents say it never does. | Decide | Open |
| [performance-07](areas/performance.md#performance-07) | When 3D arrives the page freezes for about half a second under 4x slowdown, and on a finished feast opened from a link that falls in the middle of the feast. | Decide | Open |
| [performance-09](areas/performance.md#performance-09) | At a phone's pixel density the version 2 critters draw at about 18 frames a second in Chromium and 3 in WebKit on this Mac; the known WebKit figure was taken at density 1. | Decide | Development build only. It is what the version 2 setting would cost, not what ships now. |

## Minor

| Finding | What is wrong | Call | State |
|---|---|---|---|
| [lifecycle-06](areas/lifecycle.md#lifecycle-06) | Pressing an arrow key from − or + turns the circle once, then keyboard focus drops to the page and the arrow keys stop. | Fix | Open |
| [lifecycle-08](areas/lifecycle.md#lifecycle-08) | A member who opens a draft feast's link is told the burrow cannot be reached. | Fix | Open |
| [lifecycle-09](areas/lifecycle.md#lifecycle-09) | An option with no description reads "Stipends didn't write a statement." | Fix | Open |
| [lifecycle-12](areas/lifecycle.md#lifecycle-12) | Every game screen first draws itself for a 390x844 phone and then jumps to the real window; in WebKit the wrong layout stays up to a quarter of a second. | Fix | Open |
| [lifecycle-14](areas/lifecycle.md#lifecycle-14) | The set-up form's groups are drawn as tall capsules that cut across their own fields. | Fix | Open |
| [rules-07](areas/rules.md#rules-07) | A name that starts with = + - or @ is written to the CSV as it is, so a spreadsheet runs it as a formula. | Fix | Open |
| [rules-08](areas/rules.md#rules-08) | A name with one long word, or a right-to-left override, breaks the burrow and feast pages at phone width. | Fix | Open |
| [rules-09](areas/rules.md#rules-09) | A NUL character in any text field, or a deadline past the year 9999, answers 503 'can't reach the burrow' instead of a 4xx. | Accept | Open |
| [rules-12](areas/rules.md#rules-12) | If the device clock jumps past the scattering deadline, the scatter screen says 'Scattering has closed' for about two seconds before it corrects itself. | Accept | Open |
| [rules-13](areas/rules.md#rules-13) | A member who opens another member's draft is told the burrow cannot be reached. | Accept | Same as lifecycle-08. |
| [production-build-08](areas/production-build.md#production-build-08) | On this bundle the refused save tells the member to check their connection, after a dialog that says they will be asked to sign. | Fix | Open |
| [production-build-09](areas/production-build.md#production-build-09) | A wallet prompt that is never answered locks the Connect dialog: no waiting line, and Close, Escape and the other choices do nothing. | Fix | Open |
| [production-build-10](areas/production-build.md#production-build-10) | The document carries no title, description, preview tags or icon: a shared feast link shows as a bare address, and the tab has no name until the script runs. | Fix | Open |
| [edge-states-05](areas/edge-states.md#edge-states-05) | In a browser with no WebGL the simple view is shown without its notice or "Try 3D again", and the renderer's failure is left uncaught. | Fix | Open |
| [edge-states-06](areas/edge-states.md#edge-states-06) | "The key isn't out yet" turns into the outage message after 20 seconds, and from the next poll both are on screen at once. | Fix | Open |
| [edge-states-07](areas/edge-states.md#edge-states-07) | Someone who joined after scattering opened is first invited to read and "scatter your 100 crumbs", and only after Start reading told this feast is not theirs. | Fix | Open |
| [edge-states-08](areas/edge-states.md#edge-states-08) | The clock notice and the ENS notice are never drawn on the page: they go only to the screen-reader announcer, where the next announcement replaces them. | Fix | Open |
| [edge-states-09](areas/edge-states.md#edge-states-09) | Three setup errors say only a field's name or the wrong thing: duplicate option names read "Option name", a blank title "Feast title", a gathering deadline already past "Scattering has to close after gathering." | Fix | Open |
| [edge-states-10](areas/edge-states.md#edge-states-10) | Coming back to scatter, the first Scatter These opens "Choose how to connect" under the line "Not confirmed. Your crumbs are still here"; on the gathering page the same prompt gives no reason at all. | Fix | Open |
| [edge-states-12](areas/edge-states.md#edge-states-12) | On the scatter screen every message uses one spot, so two at once cover each other and the name tags beneath; the outage toast stays up to 30 seconds after the store is back. | Accept | Open |
| [edge-states-15](areas/edge-states.md#edge-states-15) | A feast that ended for want of three critters is only a chip on the burrow home, and its own page still counts down to "Scattering closes in 1 hour". | Fix | Open |
| [edge-states-17](areas/edge-states.md#edge-states-17) | While a request for the key hangs, the waiting screen stops asking: the 60-second poll is only set once a request has finished. | Accept | Open |
| [edge-states-18](areas/edge-states.md#edge-states-18) | A member who arrives while the store is down is shown as signed out, and when it returns Try again brings the signed-out page, not their feast. | Accept | Open |
| [sound-01](areas/sound.md#sound-01) | Coming back to a hidden tab plays about 9 ms of whatever was sounding when it was hidden. | Fix | Open |
| [sound-02](areas/sound.md#sound-02) | On a slow page a held pour sounds as loud bursts of bells, not a pour. | Fix | Open |
| [sound-03](areas/sound.md#sound-03) | Scattering closing under the open screen is never announced, so for a screen-reader member the Dusk sting carries it alone; after a refused save the announcement is overwritten 41 ms later. | Fix | Open |
| [sound-08](areas/sound.md#sound-08) | Music or Sounds switched off in one tab keeps playing in another tab that is already open, and that tab's Settings still shows it on. | Accept | Open |
| [accessibility-02](areas/accessibility.md#accessibility-02) | Keyboard focus is dropped to the page in eleven places, among them the moment scattering closes and the feast begins. | Fix | Open. Rated major by the finder and minor by the verifier. |
| [accessibility-04](areas/accessibility.md#accessibility-04) | When scattering closes with the screen open a screen reader is told nothing: the dusk sting plays, the controls stop, and “Scattering has closed” is only drawn. | Fix | Same as sound-03. Rated major by the finder and minor by the verifier. |
| [accessibility-05](areas/accessibility.md#accessibility-05) | A visitor on a public result has no Settings, so the music cannot be turned off and the critters cannot be stilled. | Fix | Open. Rated major by the finder and minor by the verifier. |
| [accessibility-10](areas/accessibility.md#accessibility-10) | − and + stand 6 px from ‹, › and Scatter These where the design asks for 8, and 2.3 px from the critter in focus on desktop. | Accept | Open |
| [copy-03](areas/copy.md#copy-03) | A burrow with one critter reads "1 critters" on Home. | Fix | Open |
| [copy-04](areas/copy.md#copy-04) | Opening a people feast after a critter has left answers "This burrow has …." with the number missing. | Fix | Open |
| [copy-05](areas/copy.md#copy-05) | On phones 375 px wide and narrower the dock cuts the name of the critter in focus: "Community gar…". | Fix | Open |
| [copy-06](areas/copy.md#copy-06) | In a browser set to another language the deadline lines mix that language into English sentences, and Japanese and Chinese dates lose their marks. | Fix | Open |
| [copy-07](areas/copy.md#copy-07) | In the production bundle, when the store cannot give the key and Shutter cannot be reached, the waiting screen says "Something went wrong" twice and never the key line. | Fix | Open |
| [copy-08](areas/copy.md#copy-08) | Five more lines do not fit the moment they appear in: Start a feast in an outage, opening a draft after its gathering deadline, the offline line, a cancelled feast's deadlines, and "didn't scatter" beside "scattered, but". | Fix | Open |
| [copy-10](areas/copy.md#copy-10) | The rehearsal run sheet has a step that leads to a dead end and a step this build cannot do: step 3 never says to choose Public, and step 8 records a result that cannot be recorded. | Fix | Open. Step 8 is production-build-05. |
| [performance-03](areas/performance.md#performance-03) | In a feast of ten, the tenth critter is never drawn in 3D: it stays a flat portrait, and it is the same critter on every member's screen. | Fix | Open. A council of ten would see it: one member's critter stays flat on every screen. |
| [performance-04](areas/performance.md#performance-04) | With 3D on, the render loop never goes on demand: Still critters, reduced motion and the ladder's first step all keep drawing every frame. | Accept | Open |

## Notes

| Finding | What is wrong | Call | State |
|---|---|---|---|
| [lifecycle-16](areas/lifecycle.md#lifecycle-16) | Three gaps in what the tests can see: nobody runs the game as production draws it, the renderer spec fails on a busy machine, and WebKit screenshots flatten the floor. | Accept | Open |
| [lifecycle-19](areas/lifecycle.md#lifecycle-19) | In WebKit, with ten critters on a 1440 or 1920 px desktop, one tag overlaps a neighbouring critter by 5.5 px². | Accept | Open |
| [lifecycle-20](areas/lifecycle.md#lifecycle-20) | Small things seen along the way. | Accept | Open |
| [rules-15](areas/rules.md#rules-15) | The PRD and the Technical Spec are behind the app in four places. | Accept | Open |
| [rules-16](areas/rules.md#rules-16) | Signing out does not end a session that was copied, and sign-in nonces are never cleared out. | Accept | Open |
| [rules-17](areas/rules.md#rules-17) | Small things on the screens: the counter reads '2000 / 2,000', a name that is not an address is answered as an ENS outage, and the extension dialog can open on a time it refuses. | Accept | Open; the finder rates it likely |
| [production-build-11](areas/production-build.md#production-build-11) | Nothing in the repository runs the built bundle under the page policy in a browser; the build guard is a text match that lets nine blocked forms through and refuses one harmless one. | Fix | Open. The browser run exists as local scripts and is not in the suite. |
| [production-build-12](areas/production-build.md#production-build-12) | The Koota patch does what the generated code did for every trait the app has; I would have made the same choice. | Accept | Open |
| [production-build-13](areas/production-build.md#production-build-13) | On the production bundle WebKit holds 60 frames a second and a full pour with eight critters: lifecycle-15's 4 to 7 belongs to the version 2 critters the dev stacks draw. | Accept | Open |
| [production-build-14](areas/production-build.md#production-build-14) | Loading and headers: the crypto chunk arrives with the reveal, a public visitor downloads it for one function, only /assets has a caching rule, and a public feast's API answer is no-store where the spec says max-age=60. | Accept | Open |
| [production-build-15](areas/production-build.md#production-build-15) | The stated build target (Chrome 100, Firefox 100) is older than what the styles need; Safari 15.4 loses only shadows and tints. | Accept | Open; the finder rates it likely |
| [edge-states-19](areas/edge-states.md#edge-states-19) | Small things seen in the edge states. | Accept | Open |
| [edge-states-20](areas/edge-states.md#edge-states-20) | Six of the 28 states (E1, E2, E9, E13, E20, E28) cannot appear on a dev stack as served, and no test covers them in the game. | Accept | Open |
| [sound-11](areas/sound.md#sound-11) | Game Design §5.2 pairs pile.empty with an "All scattered" chip that the screen does not have. | Accept | Open |
| [sound-13](areas/sound.md#sound-13) | No test in the repository covers a hidden tab, a failed or late file through the live host, a toggle in mid-sound, a loop's join, or a slow page. | Accept | Open |
| [accessibility-13](areas/accessibility.md#accessibility-13) | The contrast table in Design System §12.2 describes the old palette; every pair still passes, but its numbers and two of its lines are no longer true. | Accept | Open |
| [accessibility-14](areas/accessibility.md#accessibility-14) | Small things seen along the way. | Accept | Open |
| [copy-11](areas/copy.md#copy-11) | Technical Spec §9 and §13 and the deployment guide are behind the build: three routes are not in the table, four Shutter settings are not listed, and VITE_BASE_RPC_URL is read by nothing in the app. | Accept | Open |
| [copy-12](areas/copy.md#copy-12) | Design System §10.2 is no longer the list of what members read: three strings differ from it, 24 strings it specifies are never shown, and 75 member-facing strings exist only in copy.ts. | Accept | Open |
| [copy-16](areas/copy.md#copy-16) | CONTEXT.md agrees with the vocabulary; two banned words are missing from its Avoid lists, "circle" now has two meanings, and four documents still place the rehearsal in September. | Accept | Open |
| [copy-17](areas/copy.md#copy-17) | Nothing in the repository checks four things this pass had to check by hand: a route file for every route, a one form for every counted string, the results when no scatter can be read, and where the built bundle sends requests. | Accept | Open |
| [performance-05](areas/performance.md#performance-05) | Each time the 3D scene is mounted, its canvas and WebGL context object are never released. | Accept | Open |
| [performance-06](areas/performance.md#performance-06) | A public feast after close is sent no-store; the spec gives it a 60-second public cache. | Accept | Open |
| [performance-08](areas/performance.md#performance-08) | Opening ten scatters is not the spec's "milliseconds": about 0.6 s on this Mac and 1.5 to 2.2 s under 4x slowdown, one long task a scatter. | Accept | Open |

## Checks for real phones and people

Automation cannot hear, is not a wallet app or a screen reader, and starts sound with no gesture. The 93 checks the agents left for people, the VoiceOver and TalkBack script included, are in [phone-checks.md](phone-checks.md).

## Not done

- **A key from the real keypers.** Every feast in this pass opened with a key made locally, by the mock or by a local Shutter with real keys. The solo smoke feast on a deployment is the first time Shutter's own keypers are asked.
- **Real phones and people.** Automation cannot hear, hold a wallet app or run a screen reader; see the checks above.
- **Cost.** The eight areas used about 7 million tokens, against a first guess of 2 to 3 million for all eight; the verifiers used about 0.9 million more.

## How it was run

- Each area had its own local stack: a mock API with its own database and clock, and its own app server. Seeding a feast or moving the clock changes the phase for everyone on a stack, so nothing was shared.
- The production build was tested as it ships: the bundle in `dist/` under the headers `vercel.json` sets, through an injected wallet, since a production build has no rehearsal accounts. From the copy sweep on, the pass ran on the tree with all three fixes, where the production stacks' stores run a local Shutter with real keys.
- Every page the stacks served loaded a script first that routes the app's audio through a gain of zero, so the app's sound could be measured and nothing reached the speakers.
- The harness, each agent's scripts, their output and screenshots are in the ignored `.scratch/qa/` of the `live-timelock` worktree. They are not in the repository; the reproduction steps on the area pages name them.
