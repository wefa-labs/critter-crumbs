# Rules and access control

One of the areas of the [October QA pass](../README.md). 17 findings; of 17 things checked, 11 passed, 5 failed, 1 were not run.

Covered all eight items of the brief on the rules stack: 434 access-matrix calls (twice), the four privacy states through the API and the screens, every rule R1 to R17 through the API and where a member meets it on screen, 26 rule-breaking and valid scatters tallied by seven members in two engines and seven locales, a wrong browser clock in Chromium and WebKit, hostile text on 45 screens and in both CSV files, the session, and 326 bad inputs. The server's side holds: no route gave anyone anything early or across burrows, phase gates follow the server clock, and every client discounted every bad scatter identically, with one result hash and byte-identical CSV files. Two blockers remain. The production bundle cannot sign a scatter or open a feast at all (both functions only throw 'rehearsal only'), and for a public feast any one member can record totals that are not the tally, which the public page and its CSV then show for good with no warning to anyone. Four majors: the scatter screens never show who has and has not scattered (R5), a failed save retried more than five minutes later is refused for ever, an options feast names people by truncated address, and two critters can carry the same or a look-alike name. The rest are minor: formulas in the CSV, long names breaking the burrow page, 503 for a few bad inputs, unchecked address checksums.

## Findings

### rules-01

**The production bundle cannot sign a scatter or open a feast: both functions only throw 'rehearsal only'.**

- **Severity:** blocker. **Call:** fix. **The finder's confidence:** confirmed. **Engines:** Build artefact (Node 22). Browser: Chromium on the production stack, earlier run only.
- **State:** Same as lifecycle-01.
- **Verifier:** fix holds; rates it blocker. Same fault as lifecycle-01, checked once. Real on the tree the finder saw; mended on this one. What I ran: the worked example (copy at .scratch/qa/verify-a/live-feast.mjs) on my production stack https://127.0.0.1:5207 (dist/ under vercel.json's headers, store on the local Shutter, 96-byte eon key), once in Chromium and once in WebKit. In both, two members signed scatters through an injected wallet (eth_chainId, wallet_switchEthereumChain, wallet_addEthereumChain, eth_signTypedData_v4), one changed theirs, the page fetched /blst.js and /blst.wasm, and after the close both opened the feast to one result hash, "2 of 8 scattered · 200 crumbs in all", CSV 160 + 40 = 200, with no policy violation, page error or foreign request. The finder's script 09-production-bundle-signer.mjs looks for functions that only throw err.rehearsalOnly; the same search on today's dist/ (through the lifecycle finder's probe, copied) finds none, and the crypto chunk now holds the Shutter client (encryptData, decryption_key, blst in crypto-D6lNuvor.js). The finder's line "Recording a public result is shut the same way" still holds and is production-build-05; the opening on my stack used keys from scripts/local-shutter.ts, not Shutter's keypers (production-build-03). The finder's point that no test ran the signer in a production build is partly answered: packages/app/test/feast-timelock.test.ts and tests/api/browser-shutter.test.ts and local-shutter.test.ts exist on this tree (I did not run the suite; README says bun run check was already done). Fix committed as 1c33cb4 and open as a pull request, not merged, not deployed. Evidence: .scratch/qa/verify-a/out-live-feast-chromium.log, out-live-feast-webkit.log, out-probe-production-crypto.log
- **Where:** packages/app/src/crypto/scatter.ts:7, packages/app/src/crypto/feast.ts:8, packages/app/src/app/result-record.tsx:45; built as dist/assets/crypto-oDgTPEcU.js
- **Expected:** docs/04-technical-spec.md §1.1 step 6: 'the client builds the allocation, encrypts it with the feast's eon key (§6), wraps the ciphertext in an EAS off-chain attestation signed by the account (§7), posts it', and step 8: 'any client fetches the key ... decrypts every counted ballot locally, validates, tallies'. docs/decisions.md 2026-10-08: 'The first rehearsal runs this weekend on the current build'.
- **Observed:** signScatter and openMockFeast begin with if (!import.meta.env.DEV) throw new ApiClientError('err.rehearsalOnly', 503). The build reduces them to async function il(e,t,n,r,o){throw new rs("err.rehearsalOnly",503)} and async function al(e,t,n){throw new rs("err.rehearsalOnly",503)}. Called from dist/ in Node, each threw copyId err.rehearsalOnly, status 503, twice. No file in dist/assets mentions encryptData, get_decryption_key or blst, so the bundle holds no Shutter client. Recording a public result is shut the same way (err.storeUnreachable unless DEV and a rehearsal account). The interrupted run saw it in the browser on the production stack: 'FAIL the feast opens for A' and 'BLOCKED CSV: the results never open in this build'. docs/decisions.md 2026-09-06 says 'A production/live client adapter remains outside this mock phase'; nothing later adds one. No test runs the signer in a production build, which is how it stayed unseen. Not on README §10's known list.
- **To reproduce:** mise exec node@22.22.1 -- node .scratch/qa/rules/09-production-bundle-signer.mjs
- **Evidence:** .scratch/qa/rules/out/09-production-bundle-signer.json; .scratch/qa/production-build/out/06-feast-people-chromium.log

### rules-02

**For a public feast, any one member can record totals that are not the tally; the public page and its CSV then show them for good, and no member is warned.**

- **Severity:** blocker. **Call:** decide. **The finder's confidence:** confirmed. **Engines:** API; Chromium 375 and 1280 px.
- **Verifier:** reproduced; rates it blocker. A blocker for any feast set Public; it cannot arise in a burrow-only feast. Does not depend on the build: it is the store's answer and two screens. Reproduced twice, with a script of my own and not the finder's (.scratch/qa/verify-a/rules-02.mjs), on the verify stack https://127.0.0.1:5209. A burrow of four, a people feast set Public with individual scatters closed, three scatters whose true totals are 40, 100, 100 and 60. After the close the second member (key 2, shown as Fern in the run whose log is on disk and as Bram in the first) recorded 0/300/0/0, everything to itself: "transaction 200, record 200; stored crumbs [0,300,0,0]". A signed-out read then carried aggregate [0,300,0,0]. The creator recorded the truth afterwards: 200, and what came back was the forger's [0,300,0,0]; the first record stands. A signed-out visitor's page at 390 px read "3 of 4 scattered · 300 crumbs in all \| Fern \| 300 \| 100.0% \| Rehearsal result recorded by Fern. \| Anyone with the link can see these results." and its Download gave "Fern,0x2B5A…,300,1.000000" with 0 for the other three. The creator's and another member's own screens showed the true "Fern 100 \| Pebble 100 \| Moss 60 \| Clover 40" beside the same line "Rehearsal result recorded by Fern.", and nothing on either says the record is not their tally (the only notice on the page is that line). So the finder's account is exact and its script tests the right thing. What the spec says: PRD section 11, S3, "the on-chain attestation matches them for public feasts"; section 8, "A public result can be checked later \| On-chain result attestation". What is already decided, and narrows the fault: docs/decisions.md, 2026-09-05, "Check aggregate bounds without decrypting or tallying ... The stored numbers remain the member's on-chain claim; clients independently tally to assess it", and "persist its numbers with the immutable first record". So the store taking any totals that add up, and the first record standing, are as decided and follow from the rule that the server never computes a result. The half of that decision nobody built is the assessing: no file under packages/app/src compares a record's aggregate with the tally (result-record.tsx draws the receipt whenever a record exists; public-results.tsx calls the claim "the verified aggregate" and draws it as the result). I rate it blocker because it is the rubric's "makes results differ between people": a visitor and a member are shown different results for one feast and neither is told. How far it reaches, so it is not read as more than it is: only a feast set Public; every member's own result, fingerprint and CSV stay right and identical; the forger is named on the page; and it takes a member who means to do it. On the bundle members get there is no way to record through the app at all (production-build-05), so in production it would take a hand-made attestation on Base and a hand-made request; I read that path in packages/core/src/eas/reader.ts and packages/api/src/results.ts (the reader checks the transaction, the schema and that the attester sent it, and the route checks the sums) but could not run it: no network here and production is not deployed. That is a decision for Afolabi, as the finder says: either burrow-only results for October, which the QA write-up already suggests because of production-build-05, or the member's screen compares the record with its own tally and says so when they differ. Evidence: .scratch/qa/verify-a/out/rules-02.log, rules-02-visitor.png, rules-02-visitor.csv, rules-02-member-1.png, rules-02-member-3.png (all from the second run)
- **Where:** POST /api/feasts/:id/result-attestation (packages/api/src/results.ts:17-27 and :34); public results page; member results, 'recorded by' line (packages/app/src/app/result-record.tsx:16-40, public-results.tsx:7-13)
- **Expected:** docs/01-prd.md §11 S3: 'any two clients tallying the feast produce identical numbers, and the on-chain attestation matches them for public feasts'. §8: 'A public result can be checked later \| On-chain result attestation'.
- **Observed:** True totals 40/100/100/60. Key 2 recorded 0/300/0/0 (all to itself): 200. The signed-out page then shows 'Critter 2 300 100.0%', 'Rehearsal result recorded by Critter 2.', and its Download gives 'Critter 2,0x2B5A...,300,1.000000'. The creator's later honest record answers 200 but returns the forged one: the first record wins. On a second feast, key 4, who never scattered, recorded 'one scatterer, 100 crumbs to key 4': accepted. Members' own screens show the true totals beside the same neutral 'recorded by' line, with nothing saying the record differs. The store checks only the sum, the scatterer count, the critters and the published-set hash; it cannot read a scatter. Refused, as they should be: outsiders, another account's transaction, wrong sums, burrow-only feasts. Here the record is the dev fixture (/api/dev/result-transaction); in production the same route reads Base, where anyone can attest under the schema. Does not arise if October's feasts are burrow only.
- **To reproduce:** mise exec node@22.22.1 -- node .scratch/qa/rules/02-privacy.mjs && mise exec node@22.22.1 -- node .scratch/qa/rules/02b-privacy-screens.mjs
- **Evidence:** .scratch/qa/rules/out/02-privacy.json, 02b-privacy-screens.json, 02b-public-closed-visitor-forged.png, 02b-public-closed-member.png, 02b-public-closed-public-forged.csv

### rules-03

**While scattering is open, no screen says how many have scattered or who has not.**

- **Severity:** major. **Call:** fix. **The finder's confidence:** confirmed. **Engines:** Chromium 375 px, two runs; by code for every viewport.
- **State:** Same as lifecycle-05.
- **Verifier:** reproduced; rates it major. Same fault as lifecycle-05, checked once, on the production bundle (.scratch/qa/verify-a/participation.mjs, https://127.0.0.1:5207). With three of eight scattered and the API sending participation.scattered = [Clover, Fern, Moss] to a member who has not, neither the feast link, the scatter screen, the burrow page nor Home shows a count or a "Not yet" line, on a phone or a desktop; the burrow's feast card has only the title, "Scattering" and the closing time. The finder's code reading is right: nothing in packages/app/src reads participation.scattered or uses scatter.participation or scatter.notYet. Two corrections to how this finding is put. First, it says nothing accepts it. docs/reviews/october-game/mismatches.md does not, but docs/decisions.md does for the scatter screen: 2026-10-05, Afolabi, "On the scatter screen the closing day replaces the participation line and the deadline strip (Design System §6.2, §7.1) ... Who did not scatter is still reported at the feast (PRD §5)." Design System section 9's row "Scatter pass, nobody has scattered \| Participation '0 of 8 have scattered'", which the finder quotes, is the line that decision replaced. So the two screens the finding names (the statements-open screen and the scatter screen) lack the line on purpose. Second, for that reason its recommendation should be needs-decision, as lifecycle-05 has it, not fix-before-october: the open question, already written in the design pass (section 24), is whether some other screen, such as the burrow's feast card, should carry it. What stands is the substance: PRD section 5 R5 says "live while scattering is open and on the results", F6 says "'Five of eight have scattered', and who has not yet", and in the app as built no screen does the first half. I did not rerun the finder's 03b-rules-screens.mjs, which reads the scatter screen before and after a save. My run reads it before a save; after one, in another run on the same stack (stale-retry.mjs), the bar read "Scattered. You can change this until Sun 11 Oct, 20:23 (PDT)." with no count beside it. Evidence: .scratch/qa/verify-a/out/participation-prod-chromium.log, participation-prod-chromium-desktop-the-burrow-page.png, stale-retry-prod-chromium.log
- **Where:** Statements-open screen and scatter screen (/feasts/:id, /feasts/:id/scatter), before and after the viewer scatters
- **Expected:** docs/01-prd.md §5 R5: 'the burrow is told who did not scatter, live while scattering is open and on the results'. §7 F6: '"Five of eight have scattered", and who has not yet'. docs/02-design-system.md §9: 'Scatter pass, nobody has scattered \| Participation "0 of 8 have scattered" \| scatter.participation'.
- **Observed:** Scatter screen text in full: 'You Critter 1 0 − Critter 2 0 0 + 100 to go Scattering closes in 41 minutes'. After saving: 'Scattered. You can change this until Sat 10 Oct, 08:43 (PDT).' No count, no names. The API sends participation.scattered and copy.ts has scatter.participation and scatter.notYet (lines 262-263), but nothing in packages/app/src reads either; only gathering.participation is drawn. With no notifications in v0, this line is how a council sees who to chase before the deadline. Not among mismatches.md's differences kept on purpose.
- **To reproduce:** mise exec node@22.22.1 -- node .scratch/qa/rules/03b-rules-screens.mjs
- **Evidence:** .scratch/qa/rules/out/03b-rules-screens.json, 03b-rules-screens.run1.log, 03b-scattered.png

### rules-04

**A scatter whose save failed is refused for ever if the retry comes more than five minutes later; the screen keeps blaming the connection.**

- **Severity:** major. **Call:** fix. **The finder's confidence:** confirmed. **Engines:** Chromium 375 px, two runs.
- **Verifier:** reproduced; rates it major. Touches saving a scatter, so I ran it on the production bundle as this tree builds it; the part of the code at fault (packages/app/src/app/scatter-session.ts) is the same as when the finder ran it on a development stack, and the fix for lifecycle-01 did not touch it. My script (.scratch/qa/verify-a/stale-retry.mjs) on https://127.0.0.1:5207, Chromium, 390x844, with the injected wallet so I could count signatures, and with a control the finder's script lacks. Control, the connection drops as the scatter is sent and the member presses again straight away: "retry 1, crumbs unchanged: 200 ok … (the SAME signed scatter); signed 1 time(s) in all; saved on screen: YES". That is E3 as specified. Then the same with the stack's clock moved on six minutes before the retry: "retry 1: 400 err.generic … (the SAME signed scatter); signed 1 time(s) in all; saved on screen: no; alert: Couldn't save your scatter. Check your connection and try again — nothing was lost.", and retry 2 the same. The wallet was never asked a second time. After changing the crumbs to 99 and 1: "200 ok (a new signature); saved on screen: YES; signed 2 time(s)". So the finder's account holds on the bundle members get, and its script tests the right thing. Two notes on its wording. "For ever" means until the member changes a crumb or reloads; nothing on the screen tells them either. And both of us moved the server's clock instead of waiting six real minutes; in real time the page's clock and the store's move together and the kept signature ages the same way, so I take it as faithful, but it was not waited out. Spec: docs/04-technical-spec.md section 15, E3, "Retry; the same ballot resubmitted gets a new seq and the same effect", completes "Yes"; section 7, "time = client now() (server accepts ±5 minutes)". Those two together are the fault: the retry keeps the ballot and the store's five-minute rule then refuses it, with a message about the connection. Not on any accepted list. Who meets it: a member whose save fails once (a phone in a lift or a tunnel) and who comes back to the same open page more than five minutes later. If the phone has dropped the page in the meantime it reloads and signs afresh, so it takes the page staying alive. Major: an edge state the spec says completes does not, the message points the member the wrong way, and near the deadline that could cost them their scatter; there is a way round, so not a blocker. Evidence: .scratch/qa/verify-a/out/stale-retry-prod-chromium.log, stale-retry-prod-chromium-stuck.png
- **Where:** Scatter screen after a failed save (packages/app/src/app/scatter-session.ts:51 reuses the signed scatter; packages/api/src/ballot-verifier.ts:18 refuses one signed more than 300 s from the server clock)
- **Expected:** docs/04-technical-spec.md §15 E3: 'Retry; the same ballot resubmitted gets a new seq and the same effect'. Completes: 'Yes'.
- **Observed:** Connection dropped as the scatter was sent: 'Couldn't save your scatter. Check your connection and try again — nothing was lost.' Six minutes later on the feast's clock, Scatter These twice more: each POST carried the same signed scatter (same uid) and answered 400 err.generic, and the screen showed the same message each time. It saved only after the crumbs were changed (99 and 1), which makes the screen sign again; a reload would too, but loses the crumbs entered. A phone asleep or in a tunnel for five minutes near the deadline lands here.
- **To reproduce:** mise exec node@22.22.1 -- node .scratch/qa/rules/11-stale-retry.mjs
- **Evidence:** .scratch/qa/rules/out/11-stale-retry.log, 11-stale-retry.run2.log, 11-after-two-retries.png

### rules-05

**In an options feast, people are named by truncated address: who did not scatter, who gave what, and the giver CSV.**

- **Severity:** major. **Call:** fix. **The finder's confidence:** confirmed. **Engines:** Chromium and WebKit, seven views.
- **State:** Same as lifecycle-04.
- **Verifier:** reproduced; rates it major. Same fault as lifecycle-04, checked once; it does not depend on the build and I saw it on both. My script (.scratch/qa/verify-a/options-names.mjs): five named members, an options feast with individual scatters open, three scatter. Production stack https://127.0.0.1:5207: "3 of 5 scattered · 300 crumbs in all \| 0x1efF…A718 and 0xe1AB…b276 didn't scatter.", with no member's name on the page. Development stack https://127.0.0.1:5209: the same line; the Who gave what table reads "0x7E5F…5Bdf (you)", "0x2B5A…D6cF", "0x6813…BA69"; the giver CSV repeats the full address in the giver and the address columns ("0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf,0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf,50,30,20"). All five have display names. The finder's reading of the cause is right: the member's read of an options feast holds participants as addresses only (none of the five names is in the JSON), and packages/app/src/app/names.ts and csv.ts fall back to the address when a member owns no critter in the feast. Spec: PRD section 5 R5, "the burrow is told who did not scatter"; F9, "Who did not scatter, as a plain line" and "Who gave what, only if individual scatters are open". Nothing in docs/decisions.md or mismatches.md accepts it. Major, as the finder has it: the budget split is an options feast, and the two lines a council would use to see who to chase and who gave what cannot be read by a person; the result itself is right. Evidence: .scratch/qa/verify-a/out/options-names-prod-chromium.log, options-names-dev-chromium.log, options-names-dev-chromium-givers.png, options-names-dev-feast-budget-split-givers.csv
- **Where:** Results of an options feast: summary line, 'Who gave what' table, giver CSV (packages/app/src/app/names.ts:9-12, csv.ts:14)
- **Expected:** docs/01-prd.md §5 R5: 'the burrow is told who did not scatter'. §7 F9: 'Who did not scatter, as a plain line'; 'Who gave what, only if individual scatters are open'.
- **Observed:** '7 of 8 scattered · 7000 crumbs in all 0xF1F6…d30C didn't scatter.' The table's rows read '0x7E5F…5Bdf (you)', '0x2B5A…D6cF', and so on; the giver CSV repeats the full address in both the giver and address columns. Every one of these members has a display name. The member's read of an options feast carries no names for participants, because only critters have names and here the critters are options. October's budget split is an options feast.
- **To reproduce:** mise exec node@22.22.1 -- node .scratch/qa/rules/04-bad-ballots.mjs
- **Evidence:** .scratch/qa/rules/out/04-bad-ballots.json, 04-C-givers-chromium-key1-en-US.png, 04-C-givers.csv

### rules-06

**Two critters in one feast can carry the same display name, or one that only looks the same.**

- **Severity:** major. **Call:** decide. **The finder's confidence:** confirmed. **Engines:** API, two runs.
- **Verifier:** reproduced; rates it minor. Does not depend on the build (the store's answer and the names on a screen); run on the verify stack https://127.0.0.1:5209 with a script of my own (.scratch/qa/verify-a/same-names.mjs). The facts are as the finder says. Five members of one burrow named themselves Sam, Sam, Sam followed by a zero-width space (U+200B), Sam spelt with a Cyrillic a (U+0430), and Robin: every PUT /api/me answered 200. The frozen feast then lists four critters that all read Sam: three different strings among them, one name to the eye. On Robin's scatter screen the tags read Sam, Sam, Sam, and nothing on the screen but the portrait tells them apart (no address, no number). A rename after scattering opened answered 200 and left the frozen feast's name as it was, so the window is draft and gathering, as stated. Where I part from the finder is the rating. No line of the spec is contradicted, which the finding says itself: PRD F2 gives a critter its ENS name or "a display name typed at first connect" and nothing requires names to differ; validate.ts allows any 1 to 80 characters. By README section 11 a major is a specified state or flow that is wrong, and this is not one: it is a risk with a decision attached, so I rate it minor and keep the finder's needs-decision. How real the risk is for October: the impostor case needs a council member to take a colleague's name in front of the whole burrow, where two critters called the same thing are in plain sight on the burrow page beside their addresses. The likelier case is innocent, two people with one first name in a council of ten; then the statements tell the critters apart and the CSV pays by address, but a crumb meant for one Sam can go to the other and nothing warns anyone. The owner can rule it out for the first feast by reading the burrow's list of critters before scattering opens. A warning on a name already in the burrow, or the short address under a name, are the cheap fixes if he wants one. Run once; the finder ran it twice. Evidence: .scratch/qa/verify-a/out/same-names.log, same-names-scatter.png
- **Where:** PUT /api/me displayName (packages/shared/src/validate.ts:59); every screen that names a critter
- **Expected:** docs/01-prd.md §7 F2: 'The critter's name comes from ENS reverse resolution, else a display name typed at first connect.' Nothing requires names to differ; R3 and the CSV assume each scatterer knows whose critter is whose.
- **Observed:** During gathering three members renamed themselves 'Member 31', 'Member 31' plus a zero-width space, and 'Мember 31' with a Cyrillic M: all 200. The feast then lists four critters reading Member 31, told apart only by portrait; no screen shows an address beside a critter while scattering. Crumbs meant for one person can go to an impostor, and the CSV pays the impostor's address. A rename after the freeze does not change the frozen feast (checked), so the window is draft and gathering.
- **To reproduce:** mise exec node@22.22.1 -- node .scratch/qa/rules/10-extra-probes.mjs
- **Evidence:** .scratch/qa/rules/out/10-extra-probes.log, 10-extra-probes.run1.log

### rules-07

**A name that starts with = + - or @ is written to the CSV as it is, so a spreadsheet runs it as a formula.**

- **Severity:** minor. **Call:** fix. **The finder's confidence:** confirmed. **Engines:** Chromium.
- **Where:** Download CSV and Download CSV (who gave what) (packages/app/src/app/csv.ts:5)
- **Expected:** docs/01-prd.md §11 S4: 'The CSV lands in the budget document without retyping.' The critter column is text a member or the creator chose.
- **Observed:** Results CSV rows: "@SUM(1+1)*cmd\|' /C calc'!A0,0x9a52...,80,0.200000" and '=1+1 😀...,0xf4e2...,60,0.150000'; options: "=cmd\|' /C calc'!A0,,100,0.333333", '+1 (555) 0100,,100,0.333333', '-2+3,,0,0.000000'. The giver CSV carries the same names as column headings and row labels. Quoting of commas, quotes and line breaks is correct. The file has no byte-order mark, so Excel may also misread non-ASCII names.
- **To reproduce:** mise exec node@22.22.1 -- node .scratch/qa/rules/06-untrusted-text.mjs
- **Evidence:** .scratch/qa/rules/out/06-people-results.csv, 06-options-results.csv, 06-people-givers.csv, 06-untrusted-text.json

### rules-08

**A name with one long word, or a right-to-left override, breaks the burrow and feast pages at phone width.**

- **Severity:** minor. **Call:** fix. **The finder's confidence:** confirmed. **Engines:** Chromium 375 px.
- **Where:** Burrow page, its remove dialog, feast page in gathering, signed-out arrival page, at 375 px (member-list strong, h1 and .feast-title have no overflow-wrap; packages/app/src/styles/app.css)
- **Expected:** Brief item 6: nothing may break the layout. docs/01-prd.md §9: 'Responsive from the start.'
- **Observed:** With one member named 80 W's and an 80-character feast title: the burrow page is 1,335 px wide in a 375 px window, the people feast's gathering and arrival pages 539 px, the options feast's 434 px. On the burrow page 'Remove from burrow' sits on top of the next name and its address. A burrow name ending in U+202E makes the arrival line read '... · ltr srettirc 6' for '· 6 critters': the override runs on into the app's own words. The game screens (reading, scattering, results, who gave what) held at 375 and 1280 px; they cut names with an ellipsis. The name dialog allows 40 characters; the API allows 80.
- **To reproduce:** mise exec node@22.22.1 -- node .scratch/qa/rules/06-untrusted-text.mjs
- **Evidence:** .scratch/qa/rules/out/06-burrow-page.png, 06-people-feast-signed-out-arrival.png, 06-untrusted-text.json

### rules-09

**A NUL character in any text field, or a deadline past the year 9999, answers 503 'can't reach the burrow' instead of a 4xx.**

- **Severity:** minor. **Call:** accept. **The finder's confidence:** confirmed. **Engines:** API, two runs.
- **Where:** POST /api/burrows, PUT /api/me, POST /api/burrows/:id/feasts, PUT /api/feasts/:id/statements/:targetId (packages/api/src/api.ts:115 turns any unexpected error into 503)
- **Expected:** docs/04-technical-spec.md §9: 'errors as { error: '<copy id>', detail? }'; brief item 8: a 4xx, never a 5xx.
- **Observed:** Burrow name, display name, feast title, context, option name or statement containing U+0000: 503 err.storeUnreachable each. scatteringEndsAt 253402300800000 (year 10000) or 8640000000000000: 503. The screens would say 'Can't reach the burrow right now. Try again in a moment.', and trying again never helps. Only a hand-made request reaches this. Everything else of 326 probes answered 4xx with an id from copy.ts and no internals. An oversized body gets a bare 500 from the local proxy and stalls that client's next request once; that is the local runner, not the app.
- **To reproduce:** mise exec node@22.22.1 -- node .scratch/qa/rules/08-bad-input.mjs; mise exec node@22.22.1 -- node .scratch/qa/rules/08c-after-oversize.mjs
- **Evidence:** .scratch/qa/rules/out/08-bad-input.json, 08-bad-input.run2.log, 03-rules-api.json, 08c-after-oversize.json

### rules-10

**Adding a critter by address accepts a mistyped address: the EIP-55 checksum is not checked, and the zero address is accepted.**

- **Severity:** minor. **Call:** decide. **The finder's confidence:** confirmed. **Engines:** API, two runs.
- **Where:** POST /api/burrows/:id/members and the burrow page's Add field (packages/api/src/burrows.ts:18, packages/shared/src/validate.ts:26-28)
- **Expected:** docs/01-prd.md §7 F2: 'A critter exists for every added address from the moment it is added ... so members who never show up are still present, asleep, and feedable.' §7 F9: the CSV's address column is what the payment follows.
- **Observed:** A mixed-case address with one letter in the wrong case, one with a digit mistyped, and 0x000...000: all 200 and listed as critters. The Add field checks nothing either. A wrong address makes a critter nobody can connect as; if the real person never connects, it can still be fed and the CSV pays an address nobody holds.
- **To reproduce:** mise exec node@22.22.1 -- node .scratch/qa/rules/08-bad-input.mjs
- **Evidence:** .scratch/qa/rules/out/08-bad-input.json (group 'addresses')

### rules-11

**The sign-in message names no site, so a signature collected on another site signs that person in here.**

- **Severity:** minor. **Call:** decide. **The finder's confidence:** confirmed. **Engines:** API.
- **Where:** GET /api/session/nonce, POST /api/session; session.message in packages/shared/src/copy.ts:104
- **Expected:** docs/04-technical-spec.md §5 gives the message as built: 'Critter Crumbs / Connect as 0x1234…abcd / Nonce / Issued / Expires'. The app matches it; the question is the spec's.
- **Observed:** The message is 'Critter Crumbs\n\nConnect as 0x2b5a…\n\nNonce: …\nIssued: …\nExpires: …'. A third party can fetch a nonce, show that text on any site, and post the signature: 200 and a session. A wallet has nothing to compare with the page it is on. Such a session cannot scatter (that needs its own signature), but it can rewrite the person's statement, leave the burrow for them during gathering, and cancel or extend their feasts. Everything else held: a nonce works once, also under five simultaneous posts; wrong signer, wrong nonce and a look-alike message are refused; a POST with another Origin is refused.
- **To reproduce:** mise exec node@22.22.1 -- node .scratch/qa/rules/07-session.mjs
- **Evidence:** .scratch/qa/rules/out/07-session.json, 07-session.run2.log

### rules-12

**If the device clock jumps past the scattering deadline, the scatter screen says 'Scattering has closed' for about two seconds before it corrects itself.**

- **Severity:** minor. **Call:** accept. **The finder's confidence:** confirmed. **Engines:** Chromium twice, WebKit once.
- **Where:** Scatter screen (packages/app/src/app/feast.tsx:36-42)
- **Expected:** docs/01-prd.md §5 R13: phases are 'computed from a trusted timestamp — never the browser clock'. docs/04-technical-spec.md §15 E10: 'Deadlines from serverNow'.
- **Observed:** Server in scattering, crumbs entered, device clock moved 3 h forward: 'Scattering has closed. The feast is on its way.' showed for 1.35 s, 2.25 s and 2.1 s in three runs (its dusk sting plays with it), then the screen returned with the crumbs intact and Scatter These saved normally. No results opened and no ciphertext or key was requested. Nothing is lost; a member may believe for a moment that they missed the deadline.
- **To reproduce:** mise exec node@22.22.1 -- node .scratch/qa/rules/05-phase-gates-clock.mjs [--webkit]
- **Evidence:** .scratch/qa/rules/out/05-phase-gates-clock.json, 05-phase-gates-clock-webkit.json, 05-phase-gates-clock.run1.log

### rules-13

**A member who opens another member's draft is told the burrow cannot be reached.**

- **Severity:** minor. **Call:** accept. **The finder's confidence:** confirmed. **Engines:** Chromium 375 px, two runs.
- **State:** Same as lifecycle-08.
- **Where:** /feasts/:id of a draft, as a burrow member who is not its creator (packages/app/src/app/feast.tsx:50, ui.tsx:24-26)
- **Expected:** docs/04-technical-spec.md §9: 'errors as { error: '<copy id>' } so the client maps straight to Design System strings'. The API answers 403 burrow.unknown.title, correctly keeping the draft private.
- **Observed:** 'Can't open this right now. Can't reach the burrow right now. Try again in a moment.' with a Try again button that can never work. The refusal is right; the words describe an outage.
- **To reproduce:** mise exec node@22.22.1 -- node .scratch/qa/rules/03b-rules-screens.mjs
- **Evidence:** .scratch/qa/rules/out/03b-rules-screens.json, 03b-draft-as-other-member.png

### rules-14

**One member can post any number of scatters into a feast; each one is then carried in every member's read of that feast for good.**

- **Severity:** minor. **Call:** decide. **The finder's confidence:** confirmed. **Engines:** API, two runs.
- **Where:** POST /api/feasts/:id/ballots (packages/api/src/ballots.ts:24-35); closeRecord.published in GET /api/feasts/:id
- **Expected:** docs/04-technical-spec.md §7: 'The same address may submit any number of times; each is stored (PRD R12, T11).' No limit is specified.
- **Observed:** 150 scatters from one member, one after another: all 200. After close every member's read of the feast grew from 6.6 KB to 33 KB (177 bytes per extra scatter, in closeRecord.published), and each request to that burrow reads every ballot row first. At that rate a patient member can make the feast slow or unreadable for everyone across the close. Seven members scattering at the same instant were all stored, so ordinary use is fine.
- **To reproduce:** mise exec node@22.22.1 -- node .scratch/qa/rules/10-extra-probes.mjs
- **Evidence:** .scratch/qa/rules/out/10-extra-probes.log, 10-extra-probes.run1.log

### rules-15

**The PRD and the Technical Spec are behind the app in four places.**

- **Severity:** note. **Call:** accept. **The finder's confidence:** confirmed.
- **Where:** docs/01-prd.md §10 and §12; docs/04-technical-spec.md §9, §13, §15, §17
- **Expected:** The four documents are the spec (AGENTS.md).
- **Observed:** 1. PRD §12 still lists Q8 as open and §10 lists 'No removal of one member by another'; decisions.md 2026-09-05 settled it, and POST /api/burrows/:id/removals exists (burrow creator only, checked in every phase) but is not in spec §9's table. 2. Spec §13 gives APP_ORIGIN as https://crittercrumbs.app; deployment.md says https://www.crittercrumbs.app. With the apex value every write from the www page would be refused by the Origin check. 3. Spec §17 says public feasts after close are served 'public, max-age=60'; the API sends no-store. 4. Spec E3 says a resubmitted ballot always succeeds; §7's five-minute rule makes that false (rules-04).
- **To reproduce:** Read the cited sections; for 3, out/02-privacy.json rows with cacheControl.
- **Evidence:** .scratch/qa/rules/out/02-privacy.json, 01-access-matrix.json

### rules-16

**Signing out does not end a session that was copied, and sign-in nonces are never cleared out.**

- **Severity:** note. **Call:** accept. **The finder's confidence:** confirmed. **Engines:** API; Chromium; WebKit.
- **Where:** DELETE /api/session; GET /api/session/nonce (packages/api/src/store.ts:13-25)
- **Expected:** docs/04-technical-spec.md §19 T6: 'Stateless HMAC session cookie ... No sessions table; leaving needs no revocation'. As designed.
- **Observed:** A cookie value copied before Disconnect still answers 200 afterwards, until its 7 days are up, in both engines. 50 nonces requested with no session: 50 rows; an unused nonce is only deleted when someone signs in with it. The cookie itself is right: __Host-cc_session, Secure, HttpOnly, SameSite=Lax, Path=/, no Domain, not readable by page script, refused one second after 7 days by the server clock.
- **To reproduce:** mise exec node@22.22.1 -- node .scratch/qa/rules/07-session.mjs --browser chromium
- **Evidence:** .scratch/qa/rules/out/07-session-chromium.json, 07-session-webkit.json, 07-session-clock.json

### rules-17

**Small things on the screens: the counter reads '2000 / 2,000', a name that is not an address is answered as an ENS outage, and the extension dialog can open on a time it refuses.**

- **Severity:** note. **Call:** accept. **The finder's confidence:** likely. **Engines:** Chromium 375 px.
- **Where:** Statement editor; burrow page Add field (packages/api/src/burrows.ts:20-21); Extend gathering dialog
- **Expected:** docs/02-design-system.md §10: gathering.counter '{n} / 2,000'. docs/04-technical-spec.md §15 E22 is for an RPC that is down.
- **Observed:** The counter prints the count without its comma beside '2,000'. It counts code points, as the server and the database do: 2,000 emoji fit; a family emoji cut at the limit leaves a stray joiner; e plus a combining accent loses the accent. Adding 'not-a-name' answers 503 err.ensUnavailable; by the code a name that does not resolve takes the same path when ENS is up (not run: no ENS here). With under an hour between the deadlines, the extension dialog opens on gathering + 1 h, past its own maximum; the browser refuses it until changed.
- **To reproduce:** mise exec node@22.22.1 -- node .scratch/qa/rules/03b-rules-screens.mjs
- **Evidence:** .scratch/qa/rules/out/03b-rules-screens.json, 08-bad-input.json

## What was checked

| Item | Result | Note |
|---|---|---|
| 1. Access matrix: every route of Technical Spec §9 as no session, outsider, member joined after the freeze, participant, creator and a member who left, in draft, gathering, scattering and after close | pass (API (Playwright request)) | 434 calls, run twice (out/01-access-matrix.run2.log, .run3.log): 0 differ from the spec, 0 leaks. The 'LEAK' in the interrupted run's log does not reproduce; it fits that run's check matching SECRET-1 inside SECRET-10 before the script was corrected. |
| 1a. Statements during gathering, in the JSON other members and visitors are sent (R11) | pass (API; Chromium screens) | No payload or DOM held another member's statement or an option statement before scattering opened (01, 02, 03, 03b, 05). |
| 1b. Ciphertexts and the key before close | pass (API) | GET ballots and GET key answer 400 scatter.closed to members and 401 or 403 to everyone else until the feast; after it, members only. |
| 1c. Who gave what: only when individual scatters are open, only to members, only after close | pass (API; Chromium screens) | Offered on screen exactly when individualOpen; never on the public page. Members receive every ciphertext and the key after close whatever the setting (the PRD's honest limit). |
| 1d. Signed-out visitor: burrow-only feast link compared with a public one | fail (API; Chromium screens) | Same payload before close (title, context, deadlines, critter names and addresses). After close a public feast adds only the recorded aggregate; a burrow-only one adds nothing. The recorded aggregate can be false: rules-02. Cache-Control is no-store where spec §17 says public, max-age=60 (rules-15). |
| 1e. One burrow's member reading or writing another burrow's feast by id | pass (API) | Reads get the public view only; every write 403 burrow.unknown.title. |
| 2. Phase gates under a wrong browser clock | pass (Chromium (twice), WebKit (once), 375 px) | Clock 3 h fast at load and jumped 3 h mid-session, in gathering and in scattering: nothing opened early, no statement, ciphertext or key in any payload, writes still followed the server. One transient wrong message: rules-12. |
| 3. Rules R1 to R17 through the API | pass (API) | 129 checks (03), plus races and limits (10): crumb bounds, three-critter minimum at creation, at open and at freeze (void), freeze, cancel, one extension before the scattering deadline, 2,000-character cap counted in code points, replacement, close, leaving. All as specified. |
| 3. Rules through the screens (setup, gathering, extension, cancel, leaving, scatter, results) | fail (Chromium 375 px, Simple view) | All hold on screen except R5's live part: nothing says who has scattered while scattering is open (rules-03). Options feasts name people by address (rules-05). |
| 4. Bad ballots at tally time | pass (Chromium and WebKit) | Self-scatter, wrong sum, a critter from another feast, negative, fractional, wrong scatterer, wrong feast, wrong participant set, missing and duplicate critter, text amounts, non-canonical JSON, undecryptable bytes: all accepted by the store, all discounted by every client, named as unreadable, no fallback to an earlier valid scatter (T7, E14). |
| 5. Same result everywhere (R14) | pass (Chromium x5, WebKit x2; en-US, de-DE, ar-EG, ja-JP, fa-IR, fr-FR, hi-IN; six time zones; one view in 3D) | One result hash per feast, same rows, lines and CSV byte for byte, equal to totals worked out by hand (04). |
| 6. Untrusted text | fail (Chromium 375 and 1280 px) | 45 screens: nothing executed, no element made from text, every statement link http or https with rel noopener. Fails: long names break the burrow and feast pages (rules-08) and formula cells reach the CSV (rules-07). |
| 7. Session | pass (API; Chromium; WebKit) | Cookie flags, tampering, nonce used once (also under a five-way race), 10-minute nonce and 7-day expiry by the server clock, other origins refused with and without the cookie, sign-out. Risks by design: rules-11, rules-16. |
| 8. Bad input | fail (API) | 326 probes: no stack trace, every error id exists in copy.ts. A NUL character and a deadline past the year 9999 answer 503 err.storeUnreachable (rules-09); mistyped addresses are accepted (rules-10). |
| Extra: the production bundle's signer and opener | fail (dist/ loaded in Node; browser evidence from the interrupted run only) | rules-01. The production stacks are not mine, so this was not driven in a browser. |
| Extra: races, limits and floods | pass (API) | Five extensions at once: one taken. Eight first reads after each deadline: one frozen set, one close record. Seven members scattering in the same instant, three rounds: all stored. No limit on scatters per member: rules-14. |
| Dev endpoints refused in production, headers under vercel.json, real Shutter and Base, ENS | not-run | Need the production stacks or services outside 127.0.0.1. |

## Not run

- The production stacks (5207, 5210, 5211) are not mine: rules-01 was shown from dist/ in Node and from the interrupted run's browser log, not driven in a browser by me. Dev endpoints answering 404 in production and the headers under vercel.json were not checked.
- Real Shutter (Chiado) and Base: every scatter used the mock timelock, and the forged public record used the dev fixture /api/dev/result-transaction. No on-chain attestation was made.
- ENS: the stack has no mainnet RPC, so adding by ENS name, a name that does not resolve, and ENS names as critter names were read from code only.
- Vercel's own request-body limits and body parsing: the 2 MB limit was exercised only through the local runner and its proxy.
- WebKit for the rules-on-screens and untrusted-text scripts (Chromium only, to keep to one light browser at a time); WebKit covered the tally, the clock and the session. 3D was used for one tally view; every other page ran in Simple view.
- Whether the clock-skew notice (err.clockSkew) appears: it was not in the page text when sampled; left to the edge-states area.
- R15 (no analytics) and R17 (retention) beyond reading: no request other than /api was recorded by my scripts' watchers, but they only watch /api.
