# Phase 3 validation and remaining release gates

The mock game and browser UI are implemented in the isolated source checkout described in [the handoff](phase-3-handoff.md). This record distinguishes working code from completed release validation. The reviewed core source, `GEN_VERSION 1`, 49-target limit and 4,096-byte ciphertext limit remain unchanged.

## Automated checks

The final offline run passes 437 tests across 57 files and 11 tooling tests. On 2026-09-23 the integration branch's CI run repeated that result on a clean runner; a local run on a heavily loaded host had five environmental 15-second timeouts that passed in isolation, recorded in [the evidence file](phase-3-test-evidence.txt). Typecheck, lint, generated tokens, development assets, workspace packaging, runtime licences, archive integrity and build all pass. Gzip sizes are 114,863 bytes for the shell (120,000 cap), 249,233 for 3D (250,000 cap), and 53,955 for crypto. The registry vulnerability audit remains blocked by HTTP 403. Earlier timeout runs remain diagnostic evidence; the final full run used unchanged assertions and normal worker configuration.

## Browser and interaction evidence

The final people rehearsal used two local accounts, a private statement, API-controlled deadlines, a replaced allocation, and local key release. Both accounts independently computed `0xdc4525921c05a9b00c20b03fd59e291cd46df7982dad1418bbdcf4c3b1d1ae4c`: Clover 160, Fern 40, all other targets 0, from 200 crumbs actually scattered. Simple view and the 3D surface kept the same result. Earlier options rehearsal covered a 50/50 tie, Unicode/quoted option names, optional local recording, and public aggregate visibility.

Detailed evidence is in the task checkout's `.scratch/evidence/results-browser.md`, `gathering-browser.md`, `scatter-browser.md`, and `audio-browser.md`. The public results screenshot and Lighthouse JSON/HTML reports are retained there. Full private-screen screenshots also appear in the task's browser output.

| Design System §12.4 row | Evidence |
|---|---|
| Tab/Shift+Tab visual order | Native controls and no positive tabindex; complete traversal remains unverified |
| Enter/Space on plus/minus | Enter gives one crumb; shared held-input curve has headless coverage; sustained physical keyboard hold remains a manual rehearsal check |
| Number field | Enter commits, Shift+Up adds 10, and clamping verified; Escape/arrow variants covered in browser tests but automated run blocked |
| Statement details | Enter/native expansion verified, including renderer rect updates |
| Read list | Next via Enter verified; full Left/Right/Home/End pass remains unverified |
| Dialog Escape | Confirmation closes and returns focus to its opener |
| Deadlines | Native details implemented; full keyboard row remains unverified |
| Skip to results | Enter on Skip reached Readable and focused Results after the offscreen-stage repair |

375 px and 320 px layouts had no horizontal page overflow. A real 200% zoom pass, VoiceOver/TalkBack, all-screen axe/Lighthouse audits and slow-phone trials remain release gates. Lighthouse 13.4.1 gave 100 accessibility for arrival and public results in isolated mobile snapshot audits. These are two audited screens, not a claim about the entire application.

## Edge-case ownership

“Tests” refers to offline API/core/app public-seam tests; it does not claim an end-to-end browser fault injection.

| Cases | Owner and evidence |
|---|---|
| E1, E28 key unavailable/not yet | Core timelock + app opening; API/browser-feast key/fallback tests; real Shutter availability remains external |
| E2 rejected signature | Core account + scatter UI; rejection preserves allocation; physical connector rejection not exercised in this mock pass |
| E3 uncertain save | App receipts/confirmation and API latest sequence tests; allocation remains editable; offline browser fault injection unverified |
| E4 unknown member | API membership + arrival UI; authorization tests |
| E5 nobody, E6 one, E7 tie | Pure tally and feast director tests; tie observed in options browser rehearsal |
| E8 incomplete gathering | API freeze and reveal UI; missing statement placeholder and deadline tests |
| E9 renderer loss | Render-policy tests and actual forced-context-loss browser recovery; target 49 retained through retry |
| E10 wrong device clock | API clock adapter; skew notice observed, phases advanced only through dev server clock |
| E11 missing accepted UID | App receipts/close-record audit + browser-feast tests; warning retains UID |
| E12 replacement, E26 two tabs | API serial sequence tests and app receipt tests; replacement proved in final browser tally; simultaneous browser tabs not rerun |
| E13 registration failure | Existing core/API draft/open tests; UI retains draft and retry |
| E14 unreadable allocation | Core tally and browser-feast tests; earlier invalid-nonce rehearsal remained visibly unreadable, without rewriting history |
| E15 late scatter, E16 nonparticipant | API phase/frozen-set tests; UI uses the same copy IDs |
| E17 removal/too few, E18 creator departure | Creator-removal transaction/history tests plus existing freeze/void/leave coverage; durable visible history implemented |
| E19 expired session | Session renewal/reconnection preserves entered allocation; signer restoration observed in browser |
| E20 recording failure, E21 duplicate record | Optional record UI + recorded-results API tests, including concurrency/restart; no real Base transaction made |
| E22 ENS unavailable | Address fallback notice observed; no claim of live ENS reliability |
| E23 store outage | API client errors and retained statement/scatter form state; sustained browser outage unverified |
| E24 extension too late | API fresh-clock/deadline tests; phase-selected controls |
| E25 invalid setup | Shared validators/API regressions; P14 accepts all four privacy combinations |
| E27 long statement | Unicode-aware cap tests, client notice, server rejection |

## Game Design §10 desktop findings

F1–F4: the public world tests cover immediate tap, 3.3–3.5 s pour, release/wall behavior and reversal. F5: the mobile heap and All scattered state were observed. F6–F7: idle and calm/content poses are implemented; desktop visuals reviewed, subjective feel still belongs to rehearsal. F8: headless feast timing stays within 8 s, and readable results/skip focus are browser checks. F9: Still disables motion except opacity transitions; director and portrait tests cover the state changes. F10: all 14 finite sound recipes and pour limits have browser OfflineAudioContext evidence; every sound has a DOM reply. The ambience setting explains that its asset is deferred. F11 requires the slowest actual phone. F12 portrait-to-mesh fades are implemented; whether they are unnoticed needs human observation.

## Browser QA on the integration branch

On 2026-09-24 a manual pass in the desktop app's built-in browser walked the whole people lifecycle at 375 px on a fresh data directory: arrival, connect, name prompt, meet-your-critter re-roll and keep, burrow creation, adding two members, creator removal with the confirmation and history, re-admission, feast setup with all four privacy combinations, the three-critter rule, draft review, the open confirmation, gathering with the assistant prompt and statement save, the mock clock advance, the reveal screen, the read pass, the scatter pass through the number field, the plus control by keyboard, the confirmation and signing, replacement, a second participant, key release, the local tally, Skip to results, replay, the local rehearsal recording, the anonymous public view, the settings dialog and a 320 px reflow. Four defects were fixed on the branch with regression specs: unnamed row-level removal controls, the raw address that widened the burrow page, and the silent reconnect after a rejected write, plus the Standards review's copy and title findings. Recorded follow-ups: the ENS fallback warning is announced on every full load and can overwrite the reveal announcement on the same polite region (only without `MAINNET_RPC_URL`); a transient 5xx on `/api/me` during a server restart is treated as signed out until reload; the add-member announcement reads the full typed address. The built-in browser pane runs `requestAnimationFrame` at about four frames per second, so tick-driven motion (the reveal wake, the feast skip, the carousel snap) lags there by seconds while headless Playwright shows the specified timing; feel remains a rehearsal check on phones.

## Automated browser run

In the Codex sandbox, Playwright could not launch Chromium (MachPortRendezvous EPERM), so the in-app browser supplied manual evidence and isolated Lighthouse tooling supplied the two audit reports. On 2026-09-23 the suite ran on the integration branch against the mock stack and passed all 13 specs: people and options feasts in Simple view and 3D with separate browser contexts, latest scatters, matching hashes, screenshots and the CSV download; statement privacy, cap and reveal; portraits; the 49-target context-loss retry and renderer switching; and creator removal with visible history. The only change needed was in the test helper, which now reads authenticated state through the page. Ticket 15's automated proof is therefore complete; its remaining rows (keyboard matrix, 200 % zoom, VoiceOver/TalkBack, real phones) stay open above.
