# Rehearsal run sheet

The rehearsal runs on production at https://www.crittercrumbs.app. Until the mainnet Shutter key arrives, production is on testnet: Shutter on Chiado and EAS on Base Sepolia ([deployment.md](deployment.md)).

PRD §10 asks for a full dry run, start to finish, with fake critters and fake statements, on the real deployment and with the real people. Everything it finds is fixed, or consciously accepted, before the October feast.

## Readiness checked on 12 October 2026

The hosted testnet is available for rehearsal. Read-only checks confirmed the public page and session API respond, all eight database migrations are applied, the Chiado API eon key matches its finalized contract state, and both EAS schemas exist on Base Sepolia. Production uses `SHUTTER_MODE=chiado`, `EAS_CHAIN_ID=84532` and `DEV_ENDPOINTS_ENABLED=0`.

Run the solo smoke feast below before inviting the group: these checks do not prove a new live registration, encrypted scatter or timed key release. Browser rehearsal tests use the local mock stack; they cannot supply that live proof. Use fake statements and a test allocation, with at least three connected members for the people feast. Keep “Who sees the result?” on “Burrow only”: hosted public-result recording is disabled in this build. Connecting and scattering need no funds.

The app shows “Beta · Testnet” and “Still in development. Rehearsal only.” on every route. Mainnet remains blocked on the Shutter setup and coordinated chain configuration described in [moving production to mainnet](deployment.md#moving-production-to-mainnet). Keep the beta notice aligned with that migration.

## 1. The day before: a solo smoke feast

**Who:** Afolabi, about 40 minutes.

This proves the live trust chain on Chiado before anyone else joins: registration, encryption, key release and the local tally. The public record is not part of it. This build records a public result only in the local rehearsal (`docs/decisions.md`, 2026-10-10), so the smoke feast and the rehearsal keep their results to the burrow.

1. Open https://www.crittercrumbs.app in a desktop browser that has MetaMask or another extension. Connect, give a name and keep a critter.
2. Create a burrow with only you in it.
3. Set up an options feast with four options. Close gathering 20 minutes from now and scattering 10 minutes after that. Leave "Who sees the result?" on "Burrow only", as the form first stands.
4. Open the feast straight away. It may say "Can't reach the burrow right now. Try again in a moment." If so, wait two or three minutes and press Open again: the Chiado registration has to reach a finalized block first. Do not let the tries run past the gathering deadline. After it the answer is "Scattering has to close after gathering.", and the draft can only be cancelled and set up again.
5. During gathering, write a statement for each option.
6. When scattering opens:
   1. Read the statements, then give all your crumbs.
   2. Confirm. Your extension asks to switch to Base Sepolia, and the first time to add it. Approve, then sign. Expect "Scattered.".
   3. Change the scatter once and save again. The latest one counts.
7. When scattering closes:
   1. The circle dims, then "The feast is being laid out" appears.
   2. The key comes with the next Chiado block or two.
   3. The feast plays, and the results settle.
   4. Download the CSV.

**Pass:**
- every step above works;
- the CSV's totals match your scatter.

**If something fails:**
- note the time and the step;
- a Chiado problem is for the Shutter team, who check their logs by time;
- if the results say "Nobody scattered, so there's nothing to share out.", your scatter was saved and could not be opened. That is a problem with the key, not a missing scatter;
- for anything else, Vercel's function logs show the address and the status of the request that failed, and no more: the store writes no messages of its own.

## 2. What each member needs

Send this before the rehearsal.

- **On a phone:** open the link inside the browser of the app you connect with, such as MetaMask, Coinbase Wallet, Rainbow or Rabby. There is no QR-code connect yet, so plain Safari or Chrome on a phone has nothing to connect with.
- **On a computer:** use a browser with one of those extensions.
- **Connecting** signs a short message. It costs nothing.
- **Scattering** asks you to switch to Base Sepolia, a test network, and the first time to add it. Approve both, then sign. It costs nothing and needs no tokens.

## 3. The rehearsal

1. **People feast.**
   - The creator adds every member by address or ENS name. There must be at least three.
   - The creator leaves "Who sees the result?" on "Burrow only".
   - Everyone writes a fake statement during gathering.
   - Gathering and scattering can be short, for example 30 minutes each.
2. **Options feast:** four fake options, the same way.
3. **The feel checklist.** Each person runs Game Design §10 on their own phone:

| # | Check | Pass | Notes |
|---|---|---|---|
| F1 | A tap replies on the same frame: the count changes and the critter bumps before the finger lifts | | |
| F2 | A 100-crumb pour empties in 3–4 s and stops within ± 2 crumbs of where you meant | | |
| F3 | The pour sounds like a pour on iOS Safari and Android Chrome | | |
| F4 | Minus feels as good as plus | | |
| F5 | The heap reads as progress from arm's length; empty is unmistakable | | |
| F6 | Idle critters look alive on video and still in a screenshot | | |
| F7 | No critter looks sad at the results | | |
| F8 | The feast plays in under 8 s, the numbers are readable at the settle, and Skip to results works from the first frame | | |
| F9 | With Still critters on, only crossfades move | | |
| F10 | With Sounds off nothing is confusing; with Music on, which is the default, nobody asks how to turn it off | | |
| F11 | 30 fps or better on the slowest phone with a pour running | | |
| F12 | Nobody notices the moment 3D replaced the portraits | | |

4. **Trust checks:**
   - every device shows the same totals and the same Result fingerprint;
   - the burrow is told who did not scatter;
   - the CSV downloads and matches the results.
5. **Worth trying:**
   - change a scatter after saving;
   - one person on a computer while the rest are on phones;
   - Still critters on;
   - Sounds off, and Music off;
   - on a phone, whether the first tap starts the sound, with the silent switch off and on.

## 4. After

- Write down every issue. Decide for each: fix before October, or accept it knowingly. File the fixes as issues.
- Then move production to mainnet ([deployment.md](deployment.md#moving-production-to-mainnet)).

## Known rough edges on testnet

- **Opening a feast takes a few minutes,** while the Chiado registration finalizes.
- **Chiado runs on one node** and has had outages of a few hours. If the key is late, the feast waits and polls; nothing is lost. If Shutter cannot be reached at all, the waiting screen says "Something went wrong. Nothing you did was lost." and asks again every minute.
- **A lost registration means cancelling the draft and setting the feast up again.** The adapter never registers twice on its own.
- **Do not deploy while a feast is running.** A page left open across a deployment goes blank the next time it opens a feast or starts reading. Reloading it brings it back.
- **Results stay with the burrow.** On a feast set to "Public", members still see the result, but a visitor with the link never does: nobody can record one from this build.
- **Use www.crittercrumbs.app.** On `critter-crumbs.vercel.app`, pages load but saving fails the origin check.
- **ENS names come from a free public RPC.**
