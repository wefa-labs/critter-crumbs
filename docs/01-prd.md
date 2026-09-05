# Critter Crumbs — Product Requirements

**Document 1 of 4** · Status: revised after review, 2026-09-01
Downstream: `02-design-system.md` · `03-game-design.md` · `04-technical-spec.md`

**How to read this document.** It is written for coding agents, with a human reviewing.

- "Must" and "never" are binding.
- **Proposal (P#)** marks a decision made in this document that was not in the project brief. Implement as written unless the reviewer overrules it. All proposals are collected in §12.
- **Open (Q#)** marks a genuinely undecided question. Do not implement an assumption. Collected in §12, alongside the questions the reviewer has already resolved.
- Everything else restates settled decisions from the project brief and the 2026-09-01 review. Do not re-litigate them in implementation.
- Interaction timings appear here for completeness; the Game Design document owns the tuned values. Architecture, storage, and failure handling belong to the Technical Spec.

---

## 1. What Critter Crumbs is

> Everyone gets a handful of crumbs to share.

**The problem (P13).** A group decides how to share something out. It usually goes one of four ways.

- **Someone proposes a split.** Whoever goes first sets the anchor, and everyone else adjusts by a little.
- **The visible work wins.** Loud, recent and demonstrable beats quiet, early and structural.
- **Everyone can see who gave what.** Giving turns into trading, and the numbers end up describing who is owed rather than who did the work.
- **It goes to a show of hands.** The result tracks who is best known.

Critter Crumbs changes one thing: nobody sees where anyone's crumbs went until every crumb is in.

Critter Crumbs is a private way for a group to decide how something gets shared out. Your burrow gathers, everyone gets the same handful of crumbs, and you scatter yours where you think they should go. Every crumb stays private until the feast — then it all opens at once.

Two use cases, one mechanic:

- **People feast.** Recognising contribution. Crumbs go to other people.
- **Options feast.** Splitting a budget. Crumbs go to named options.

Both render identically. Every target is a critter, whether or not a person is behind it. A budget line called "Knowledge Commons" has a critter that grows when fed, exactly like a person's.

It is a 3D app: critters are procedurally generated 3D characters, and feeding them is the interface. Playful and game-like — but it is a tool adults use to move real money. Charming, not childish. It should feel good to use twice a year, not demand attention.

**Precedent.** The allocation mechanic comes from Coordinape. Three deliberate differences:

1. Allocations are encrypted until the feast, rather than visible as they land.
2. Targets can be budget options, not only people.
3. It is playful, rather than a grid of number inputs.

Borrow the mechanic, not the interface.

## 2. Who it is for

| Fact | Value |
|---|---|
| First real users | A council of roughly 6–10 people |
| First real use | October 2026: one contribution allocation (people feast), then one budget split across four options (options feast). Rehearsal in September. |
| Wallets | Every member already has one; v0 is fully web3-native |
| Geography | Four continents — see deadline display rules (§6) |
| Cadence | A few times a year; the app must explain itself on every return, not rely on habit |
| Burrows | A member can belong to any number of burrows (v0). The October council is one of them. |

Design for this group, not for scale.

| Role | Who | Powers beyond a member's |
|---|---|---|
| Member | Anyone in the burrow | — (write own statement, scatter, view per privacy settings, create feasts, add members, leave the burrow) |
| Creator | The member who created a given feast | Set it up; cancel during draft or gathering; extend the gathering deadline once |
| Payment operator | Whoever moves the money afterwards | None in-app; consumes the CSV (F9) |

There is no owner or admin role (R9).

## 3. Vocabulary

Canonical. Use these words in all four documents and in all UI copy.

| Term | Meaning |
|---|---|
| **Critter** | A target. A person or a budget option. Generated from an address. |
| **Burrow** | The group. Persistent, reused across feasts. |
| **Feast** | One whole event, and the moment everything opens. |
| **Gathering** | Phase one. Everyone writes what they did, hidden from each other. |
| **Scattering** | Phase two. Statements open, everyone scatters crumbs privately. |
| **Crumbs** | What you have to give. The same handful for everyone. |
| **Scatter** | The act of giving crumbs to a critter. |

In use: *the October Feast; gathering closes Tuesday; scattering closes Friday.*

Rules of use:

- Never use **"seal"**, **"round"**, **"cache"**, **"vote"** or **"ballot"** in user-facing copy.
- "Ballot" is permitted in code and technical documents as the term for a scatterer's signed, encrypted allocation payload. It never reaches the UI.
- Copy says **"connect"**, never "connect your wallet". The wording must survive the v1 move to email sign-in.

## 4. The two feast types

| | People feast | Options feast |
|---|---|---|
| Targets | The participants themselves | Options named by the creator at setup |
| Target identity | Member address | Derived identifier, no owner (Technical Spec) |
| Scatterers | All participants in the frozen set (R7) | All participants in the frozen set (R7) |
| Statements | Each member writes their own | **P1** — the creator writes one per option |
| Cannot scatter to self (R3) | Applies | Never triggers (no critter has the viewer as owner) |
| Minimum critters (R6) | 3 | None |
| Rendering, feeding, growth | Identical | Identical |
| October instance | Contribution allocation | Budget split across four options |

**Proposal P1 — options-feast gathering.** The brief defines gathering around members writing statements, which only fits people feasts. For an options feast: the creator authors a statement per option (same format and cap as personal statements, R10) during draft or gathering; members write nothing; the creator may set a short gathering window. Option statements follow the same reveal rule (hidden until scattering opens, R11), so both feast types share one code path.

## 5. Rules

All binding. ⚖ marks rules the tally must enforce. Ballots are encrypted in flight, so submit-time checks in our own client are a courtesy; tally-time validation is the guarantee (R14).

| # | Rule |
|---|---|
| R1 | Everyone in a feast gets the same number of crumbs. No weighting, no seniority. The creator sets crumbs per critter at feast setup; default 100; whole numbers only; bounds per P9. |
| R2 ⚖ | You must scatter all of them. A scatter can only be submitted when the pile is exactly 0. A valid allocation assigns whole crumbs ≥ 0, only to this feast's critters, summing exactly to the issued amount. |
| R3 ⚖ | You cannot scatter to yourself. Applies when the scatterer's address matches a critter's owner; options feasts are unaffected. |
| R4 ⚖ | Results are proportions of crumbs actually scattered, not crumbs issued. Someone who does not participate must not silently dilute everyone else. |
| R5 | Giving and receiving are separate. Someone who never scatters still receives crumbs — but the burrow is told who did not scatter, live while scattering is open and on the results. |
| R6 | A people feast needs at least three critters. An options feast has no minimum. **P8** — checked at feast creation and again when scattering opens; if leaving (R16) has taken a people feast below three by then, the feast ends without scattering (P11). |
| R7 | The participant set freezes when scattering opens. Members who join the burrow during gathering are in. Nobody joins a feast in progress. |
| R8 | The creator can cancel during draft or gathering, never once scattering has started. |
| R9 | Any member of a burrow can create a feast in it. There is no owner role. |
| R10 | Statements are plain text, capped at 2,000 characters with a live counter, line breaks preserved, URLs auto-linked. No markdown in v0 (richer formatting is a v1 question). |
| R11 | Statements are hidden during gathering; each author sees and edits their own throughout. When scattering opens, every statement is revealed at once, and all statements lock. |
| R12 ⚖ | A scatter is private the moment it is made and final when scattering closes; until then it can be replaced. A submission is always a complete allocation — partial updates do not exist. The submission that counts per scatterer is their latest (see tally definition below). |
| R13 | Phases advance automatically at their deadlines, computed from a trusted timestamp — never the browser clock. The creator may extend the gathering deadline once, only while gathering is still open. No other manual phase control exists. Phases advance regardless of readiness: if the gathering deadline arrives with two of eight statements written, scattering opens anyway — the extension is the escape hatch. |
| R14 | Nobody triggers the feast. Any client opened after scattering closes fetches the decryption key, decrypts every ballot, and tallies locally. Everyone computes the identical result. There is no operator and no "run the count" button. Rule validation happens at tally time. |
| R15 | No analytics and no telemetry. Nothing about usage leaves the browser. Network requests exist only to make the product function (feast data, ballots, Shutter, ENS RPC). No usage events, no crash reporting, no server-side behaviour logs. |
| R16 | A member can leave a burrow. Leaving removes their critter from future feasts; past feasts and their results are unchanged. Leaving during a feast's draft or gathering removes them from that feast. A member already in a feast's frozen participant set (R7) stays in that feast: they can still receive, and if they do not scatter they are listed as not having scattered. |
| R17 | Ballots and statements are retained indefinitely, so the burrow keeps its history. Configurable retention is a later option (§10). |

**Tally definition.** For each scatterer, take their latest submission that passes validation (R2, R3). A critter's total is the sum of crumbs assigned to it across those counted ballots. A critter's share is its total divided by the sum of all crumbs in counted ballots. Because R2 forces full spend, the denominator equals (number of counted scatterers) × (crumbs per critter). How a ballot that fails validation is handled — and whether an earlier valid submission falls back in — is defined in the Technical Spec's edge states, not improvised.

## 6. Feast lifecycle

**Draft → Gathering → Scattering → Feast.** Two deadlines, both set at creation, both unmissable on screen throughout — a single countdown is not enough.

| Phase | Starts | Ends | Statements | Scatters |
|---|---|---|---|---|
| **Draft** | Creator begins setup | Creator opens the feast (the one manual transition) — or discards it | Options feast: creator drafts option statements (P1) | — |
| **Gathering** | Creator opens the feast | Gathering deadline, automatic | Hidden; own statement visible and editable (R11) | — |
| **Scattering** | Gathering deadline | Scattering deadline, automatic | All revealed at once, locked (R11) | Private, replaceable (R12); participation visible (R5) |
| **Feast** | Scattering deadline | Never — results are permanent | Readable | Final; each client decrypts and tallies locally (R14) |

Notes:

- The statement reveal at scattering open, and the feast itself, are designed moments, not mere state changes. The Game Design document owns both sequences.
- Cancel: creator only, draft and gathering only (R8). Extension: gathering deadline only, once, creator only, while gathering is open (R13). **P6** — the extended gathering deadline must still fall before the scattering deadline, which never moves.
- Deadlines display in the viewer's local time with the absolute time one tap away (users span four continents).
- Phase state comes from a trusted timestamp source (named in the Technical Spec). A skewed device clock is an enumerated edge state there.
- If a people feast has fewer than three critters when scattering would open (R6, R16), it ends without scattering; the burrow is told, and anyone can start a new one (**P11**).

## 7. User flow

### F1 — Arriving

A cold link, before connecting, shows: the burrow name, what the feast is for (title and context line), both deadlines, and the critters asleep. Understand first, connect second. Nothing beyond this is visible before connecting; after connecting, visibility follows phase (§6) and privacy (§8).

### F2 — Meet your critter

On first connect, a critter is generated deterministically from the member's address plus a stored variant number. The member can re-roll **up to four times** so it feels chosen, then it locks. The critter's name comes from ENS reverse resolution, else a display name typed at first connect. No separate critter names.

**Proposal P10 — one critter per address.** A critter belongs to an address, not a burrow: the same critter appears in every burrow the member is in, and the re-rolls happen once, at the first meeting.

A critter exists for every added address from the moment it is added, with the default variant until its owner first connects — so members who never show up are still present, asleep, and feedable.

### F3 — The burrow

Any connected user can create a burrow: name it, add critters by address or ENS. Members join via link — no approval queue. Any member can add further members. A member can belong to any number of burrows; the home screen lists them (F10).

**Proposal P2 — who the link admits.** The join link admits only addresses already added to the burrow. An unknown address sees the burrow's name and a line saying it doesn't know them, and to ask a member to add them (this is the "not in the burrow" edge state). If instead anyone holding the link may join, say so and the Technical Spec adjusts.

Any member can leave a burrow (R16). Whether one member can remove another is **Q8**.

### F4 — Setting up a feast

| Field | Notes |
|---|---|
| Title | Required |
| Context | One line |
| Type | People or options |
| Options | Options feast only: name plus statement per option (P1) |
| Crumbs per critter | Default 100; whole number from 10 to 1,000 (**P9**). The form presents 100 as the norm — the simplest arithmetic for most people — and changing it is a deliberate act, not a prominent choice |
| Gathering deadline | Required; before the scattering deadline |
| Scattering deadline | Required |
| Aggregate result | Public, or burrow only (§8) |
| Individual scatters | Closed, or open to the burrow; forced closed while the aggregate is burrow only (§8) |

Opening the feast starts gathering. A people feast requires three critters in the burrow at creation (R6).

### F5 — Gathering

Each member writes their own statement (R10) with a live character counter and a prompt encouraging them to draw on notes and other records rather than starting from a blank page. Editable until scattering opens; invisible to everyone else until then (R11).

**Proposal P3 — participation during gathering.** The burrow sees who has written a statement (participation is never private, §8 — this mirrors R5's rule for scattering). Content stays hidden.

### F6 — Scattering: read pass, then scatter pass

When scattering opens, every statement reveals at once — the first designed moment. Reading eight statements while allocating across eight critters is unusable on a phone, so the flow is two passes:

1. **Read pass.** Statements one at a time, swipeable.
2. **Scatter pass.** Every critter listed with its statement collapsed to one line, expandable in place.

Controls, per critter:

| Control | Behaviour |
|---|---|
| Tap | +1 crumb |
| Hold | After ~300 ms, pours at ~8 crumbs/s, ramping to ~40/s over ~1.5 s, then caps. Release stops instantly. (Tuned values: Game Design.) |
| Minus | Identical tap-and-hold behaviour in reverse. Overshooting is guaranteed when everything must be spent, so taking back is as good as giving. |
| Number field | Type an exact amount, for anyone who wants exactly 33. |

No swipe gestures for allocation — they fight with scrolling.

- **The pile is the progress bar.** It depletes visibly; empty means done. Sticky bottom bar on mobile so it sits under the thumb; side rail on desktop.
- **Your own critter is present but asleep and not feedable.** It is quietly eating what others give it, which you cannot see (R3).
- **Participation is visible, allocation is not.** "Five of eight have scattered", and who has not yet — never anything about where crumbs went (R5).
- Submitting requires an empty pile (R2) and a wallet signature on the ballot.

### F7 — After scattering

Done, but changeable: "Scattered. You can change this until Friday." (pattern: *until {scattering deadline}*). No prominent edit button that makes people feel unfinished. Resubmitting replaces the whole allocation (R12).

### F8 — The feast

On first open after the scattering deadline, the client fetches the key, decrypts every ballot, and tallies (R14) — then plays the feast: critters wake and grow in sequence, then settle into a static, readable state. A replay button. A budget result must be readable within about three seconds of the animation ending. (Beat-by-beat sequence: Game Design.)

### F9 — Results

- Totals and share per critter.
- Who gave what, only if individual scatters are open (§8).
- Who did not scatter, as a plain line, not a callout.
- **CSV export.** The point is numbers landing in a payment process without retyping. **Proposal P4 — columns:** `critter` (display name), `address` (owner address; empty for options), `crumbs` (integer received), `share` (decimal 0–1). When individual scatters are open, a second export with the full giver-by-critter matrix. Exact formatting and precision: Technical Spec.
- **Public feasts: the on-chain result attestation.** Any member may post it; the creator is prompted first. Whoever posts pays the gas in v0 (sponsored gas is v1). Once posted, the results show who posted it and link to it.

### F10 — Home and burrow home

Home lists every burrow the member belongs to. A burrow's home shows its critters, past feasts with their results (per privacy settings), and starting a new feast.

## 8. Privacy and trust

Two independent switches, three valid states. The invalid fourth is never offered:

| Aggregate result | Individual scatters | Valid | Meaning |
|---|---|---|---|
| Burrow only | Closed | ✓ | The burrow sees totals; nobody sees who gave what |
| Public | Closed | ✓ | Anyone with the link sees totals; nobody sees who gave what |
| Public | Open to the burrow | ✓ | Anyone sees totals; the burrow additionally sees who gave what |
| Burrow only | Open | ✗ | Not a valid combination. The UI forces individual scatters closed while the aggregate is burrow only |

- **Participation is never private. Allocation always is, until the feast.** Who has written, who has scattered: visible to the burrow. Where crumbs went: encrypted until the feast — and "open to the burrow" takes effect only at the feast, never before. (Ballots are signed, so the store necessarily knows *who* scattered before it can know *what* — that is how live participation counts work.)
- Results are attested on-chain only when the aggregate is public, so a public budget decision is independently verifiable. Any member may post the attestation; the creator is prompted first (F9). Ballots stay off-chain, always.

What the system guarantees, and how (one line each; details in the Technical Spec):

| Guarantee | Mechanism |
|---|---|
| Nobody — including the creator and the host — reads a scatter before the feast | Threshold timelock encryption (Shutter); a threshold of keypers releases the key at the deadline |
| The backend cannot forge a scatter | Every ballot is an off-chain attestation signed by the scatterer (EAS) |
| The backend cannot silently drop a scatter | The set of attestation UIDs is published at close; anyone can check their own is present |
| Everyone gets the same numbers | Deterministic client-side tally; no operator (R14) |
| A public result can be checked later | On-chain result attestation |

**Honest limit — state it, don't bury it.** After the key is released, anyone who can fetch the ciphertexts can decrypt every ballot. "Individual scatters: closed" is enforced by what the product displays and by who the store serves ballots to (Technical Spec), not by cryptography. In practice, burrow members could always reconstruct who gave what after the feast. The switch is an access-control and product-surface commitment the burrow agrees to respect — not a mathematical guarantee. Before the feast, the guarantee *is* cryptographic. Accepted for v0; a later version should explore stronger cryptographic privacy for individual scatters and member-only ownership of results (§10, v1).

**No analytics and no telemetry** (R15). A tool whose entire premise is privacy should not phone home, and there is nothing here worth measuring that is worth the contradiction.

## 9. Experience requirements

Product-level requirements that documents 2–4 elaborate:

- **Runs on a mid-range phone.** The 3D scene has a stated performance budget (Game Design) and the implementation holds to it: low-poly geometry, no heavy post-processing, instancing where possible.
- **The landing, arrival, and statement screens must not pay for the 3D bundle.** The canvas lazy-loads; Three.js + R3F + drei is a real bundle in direct tension with the minimal-dependency principle, and it is the deliberate exception.
- **A no-WebGL fallback is a first-class design.** If WebGL is unavailable or fails, including mid-session, the app remains fully usable in a 2D representation — every rule, every deadline, every scatter still works. Designed deliberately (Design System), not left to an error boundary.
- **Only critters live in the canvas.** All UI chrome — crumb counts, statements, buttons, deadlines, results tables — is DOM overlaid on the canvas, never rendered in WebGL. Text stays selectable, screen readers work, layout stays responsive.
- **Responsive from the start.** Critter grid: two columns on mobile, three or four on desktop. Not a desktop app that shrinks.
- **`prefers-reduced-motion`** reduces 3D animation to near-static and damps audio.
- **Sound never carries state alone.** Every audio cue has a visual counterpart. Two separate toggles: ambient bed (default **off**) and UI effects (default **on**), both persisted. The ambient bed starts only after first interaction — browsers block audio before that, and unexpected background music in a work tool makes people mute everything.
- **Deadlines are unmissable.** Both phase deadlines visible, local time, absolute time one tap away (§6).

## 10. Scope

### v0 — October, fully on-chain and web3-native

The acceptance envelope for October: **one burrow runs one people feast, then one options feast**, start to finish. Multi-burrow membership must work, but October exercises it lightly.

| In v0 | Notes |
|---|---|
| Connect with a wallet | All first users have one; copy still says "connect" (§3) |
| Burrow: create, name, add by address/ENS, join via link, leave | F3, R16 |
| Membership in multiple burrows | Home lists them (F10); one critter per address (P10) |
| People feast and options feast, full lifecycle | §6 |
| Statements | Plain text, 2,000 cap (R10) |
| Timelock encryption via Shutter | One registry registration per feast by the creator; scatterers never transact |
| Ballots as signed EAS off-chain attestations | Published UID set at close (§8) |
| Deterministic client-side tally | R14, §5 |
| On-chain result attestation | Public feasts only; any member may post (F9) |
| Results and CSV export | F9 |
| 3D critters with a fully usable 2D fallback | §9 |
| Responsive, phone-first | §9 |
| Sound per the Design System and Game Design docs | Two toggles, defaults per §9 |
| A rehearsal feast, in September | Below |
| Dev affordances | Mock Shutter mode, injectable time, seeded fake feasts (Technical Spec) |

### v1 and later — explicitly not v0

- **Email sign-in with embedded wallets**; nobody sees a seed phrase. The v0 account abstraction exists so this is one layer changing, not a rewrite.
- **Sponsored gas.**
- **Notifications.**
- **Fund custody.** A feast holds the funds and releases them according to the result when the feast opens — the fully on-chain form of the mechanic. Candidate for a grant application. v0's on-chain result attestation must be shaped so a payout contract could consume it (Technical Spec).
- **Stronger privacy.** Explore cryptographic — not only access-control — privacy for individual scatters, and member-only ownership of results (§8, honest limit).
- **Configurable retention**, decided by the burrow or the creator (R17).
- Other kinds of groups beyond burrows.
- Richer statement formatting.

### Known limitations — stated plainly, not designed around

| Limitation | Consequence |
|---|---|
| **No notifications in v0** | Someone shares the link in a group chat. Deadlines can be missed. Mitigations: unmissable on-screen deadlines, the creator's single extension. |
| Wallet required | Fine for the first users; strangers wait for v1 |
| Individual scatters are decryptable after the feast | §8 honest limit |
| Statements are plain text | Links yes, formatting no |
| Leaving a feast in progress | A member in a frozen participant set stays in that feast's results (R16) |
| No removal of one member by another | Q8 |
| External dependencies | Shutter keyper liveness at reveal, an ENS RPC endpoint, the ballot store. Failure behaviour is enumerated in the Technical Spec's edge states. |

### The rehearsal feast — in scope, not optional testing

There is one shot at the October feast: a hard deadline and real money. Before it, a full dry run end to end — fake critters and fake statements, on the real deployment, with the real people. Issues found are fixed or consciously accepted before the real feast. The Technical Spec's build order must reserve time for it. **P7 (revised)** — the rehearsal happens in September. With the feast in October, the rehearsal-ready build must be on the real deployment by about **2026-09-25**, leaving a week or two to fix what the rehearsal finds.

### Five weeks, honestly

The real deadline is the rehearsal, not the feast: roughly four weeks from this revision (2026-09-01). The v0 list above is believed to fit; the Technical Spec's build order is where that claim is tested against the September date, and anything that does not fit is cut there visibly — not discovered in week four. **Proposal P5 — cut priority if time runs short.** Protect, in order: (1) the encryption–ballot–tally trust chain, (2) the scatter flow on phones, (3) results and CSV, (4) the 2D fallback. The flex zone is feast-animation richness, replay, and sound polish — the feast must still resolve to readable results, but its spectacle is the only thing on this list that can thin without breaking a success criterion.

## 11. Success criteria — the October feast

All four must hold. Nothing else counts.

| # | Criterion |
|---|---|
| S1 | The October feast — people feast, then options feast — runs start to finish without anyone needing help. |
| S2 | No ballot is lost or unreadable: every scatterer finds their attestation UID in the published set, and every published ballot decrypts. |
| S3 | Everyone computes the same result: any two clients tallying the feast produce identical numbers, and the on-chain attestation matches them for public feasts. |
| S4 | The CSV lands in the budget document without retyping. |

Preconditions: the rehearsal feast has completed, in September (§10). Measurement: by the people in the burrow — there is deliberately no analytics (R15). The feast is in October; the exact date is the council's and is not fixed, and "October" is enough for planning.

## 12. Proposals and open questions

### Proposals made in this document — overrule in review or they stand

| # | Proposal | Where |
|---|---|---|
| P1 | Options feast: creator authors one statement per option; members write nothing; same reveal rule as people feasts | §4 |
| P2 | The burrow join link admits only pre-added addresses; unknown addresses are told to ask a member | F3 |
| P3 | During gathering, the burrow sees who has written a statement (never the content) | F5 |
| P4 | CSV columns: `critter`, `address`, `crumbs`, `share`; plus a giver matrix when individual scatters are open | F9 |
| P5 | Cut priority if time runs short: trust chain → scatter flow → results/CSV → 2D fallback; feast spectacle is the flex zone | §10 |
| P6 | An extended gathering deadline must still fall before the scattering deadline, which never moves | §6 |
| P7 | Rehearsal in September; rehearsal-ready build on the real deployment by about 2026-09-25 | §10 |
| P8 | Minimum-critters rule checked at feast creation and again when scattering opens | R6 |
| P9 | Crumbs per critter: minimum 10, maximum 1,000, default 100. Below 10 the proportions are too coarse to mean anything; above 1,000 the pour stops feeling like a handful and the number field does all the work | F4 |
| P10 | One critter per address, shared across all burrows; re-rolls happen once, at first meeting | F2 |
| P11 | A people feast that falls below three critters before scattering opens ends without scattering; the burrow is told; anyone can start a new one | §6 |
| P12 | License form: an explicit `LICENSE` file — "Copyright © 2026 {holder}. All rights reserved." — plus a short notice that the source is published for review only and no rights to use, copy, modify or distribute are granted. This is the most protective option and can be relaxed to an open license later; the reverse is hard | §13 |
| P13 | The problem statement: four ways a group's split goes wrong, and the one thing Critter Crumbs changes | §1 |

### Resolved in review, 2026-09-01

| # | Question | Answer |
|---|---|---|
| Q1 | Can a critter leave a burrow? | Yes (R16). History is kept: past feasts are unchanged. |
| Q2 | Are re-rolls limited? | Yes: up to four (F2). |
| Q3 | Retention of ballots and statements? | Indefinite for now, so there is history (R17). Configurable by burrow or creator later (§10). |
| Q4 | Bounds on crumbs per critter? | Have a minimum and maximum; default 100 and lean toward it. Values per P9. |
| Q5 | Who signs and pays for the on-chain result attestation? | The creator, or any member of the burrow (F9). |
| Q6 | Dates? | Feast in October, not fixed; rehearsal in September (P7). |
| Q7 | License? | Retain full ownership; a strongly protective license to start (P12 for the form). |
| — | Minimum critters for a people feast | Three, not four (R6). |
| — | Multiple burrows | v0, not v1 (§2, F3, F10). |
| — | The §8 honest limit | Accepted for v0; stronger privacy is a v1 exploration. |
| — | Fund custody | v1; grant candidate (§10). |

### Still open — flag, do not answer in implementation

| # | Question | Blocks |
|---|---|---|
| Q8 | Can one member remove another from a burrow, or only leave themselves? | Burrow member list UI |
| Q9 | The exact copyright holder for the `LICENSE` file | Resolved 2026-09-02: WEFA LLC; repo at `wefa-labs/critter-crumbs` |

## 13. What the other documents own

| Document | Owns |
|---|---|
| **02 Design System** | Colour, type, spacing, radius, elevation tokens. Material and lighting palette for the 3D layer, described in the same words as the sound palette. Component inventory with states, split DOM vs canvas. Critter generation approach and parameter space. Breakpoints and the grid. Empty and first-run states. The no-WebGL fallback design. Accessibility: contrast, touch targets, focus, reduced motion, screen reader behaviour over a canvas. |
| **03 Game Design** | Tuned tap-and-hold curve. Growth curve (compressed — a well-fed critter is mostly happier, only somewhat bigger), squash and stretch, expression mapping. The feast sequence beat by beat. The complete sound token table with character notes (warm, wooden, organic; the feast is the one big moment; everything else under 200 ms). Toggle behaviour. The 3D performance budget. What makes a feast satisfying. |
| **04 Technical Spec** | Architecture and data flow. Data model, including a critter as a target that may or may not have an owner, and membership in many burrows. Shutter integration and the mock Shutter mode. EAS schemas — off-chain ballots, on-chain results shaped for a future custody contract. Vercel functions and the storage choice, justified against current Vercel docs. Tally algorithm and tally-time validation, including invalid-ballot handling. The wallet/account abstraction and the v1 email path. Lazy-loading the 3D bundle. Dependency list with justifications and licenses. The build order to the September rehearsal. The full edge-state enumeration (the brief's list, plus any found). Repo layout, `AGENTS.md`, the decisions log, and the `LICENSE` file (P12, holder per Q9). |
