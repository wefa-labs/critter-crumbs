# Rehearsal run sheet

The rehearsal runs on production at https://www.crittercrumbs.app. Until the mainnet Shutter key arrives, production is on testnet: Shutter on Chiado and EAS on Base Sepolia ([deployment.md](deployment.md)).

PRD §10 asks for a full dry run, start to finish, with fake critters and fake statements, on the real deployment and with the real people. Everything it finds is fixed, or consciously accepted, before the October feast.

## 1. The day before: a solo smoke feast

**Who:** Afolabi, about 40 minutes.

This proves the live trust chain on Chiado before anyone else joins: registration, encryption, key release, the local tally and the public record.

1. Open https://www.crittercrumbs.app in a desktop browser that has MetaMask or another extension. Connect, give a name and keep a critter.
2. Create a burrow with only you in it.
3. Set up an options feast with four options. Close gathering 20 minutes from now and scattering 10 minutes after that.
4. Open the feast. It may say the store is unreachable. If so, wait two or three minutes and press Open again: the Chiado registration has to reach a finalized block first.
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
8. Record the public result. The connected account needs a little Base Sepolia ETH. Then open the public view in a private window.

**Pass:**
- every step above works;
- the CSV's totals match your scatter;
- the record shows on Base Sepolia.

**If something fails:**
- note the time and the step;
- a Chiado problem is for the Shutter team, who check their logs by time;
- for anything else, check the function logs in Vercel.

## 2. What each member needs

Send this before the rehearsal.

- **On a phone:** open the link inside the browser of the app you connect with, such as MetaMask, Coinbase Wallet, Rainbow or Rabby. There is no QR-code connect yet, so plain Safari or Chrome on a phone has nothing to connect with.
- **On a computer:** use a browser with one of those extensions.
- **Connecting** signs a short message. It costs nothing.
- **Scattering** asks you to switch to Base Sepolia, a test network, and the first time to add it. Approve both, then sign. It costs nothing and needs no tokens.
- **Recording the public result** needs a little Base Sepolia ETH, and only whoever records it needs any.

## 3. The rehearsal

1. **People feast.**
   - The creator adds every member by address or ENS name. There must be at least three.
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
| F10 | With Sounds off nothing is confusing; with Burrow ambience on nobody asks how to turn it off | | |
| F11 | 30 fps or better on the slowest phone with a pour running | | |
| F12 | Nobody notices the moment 3D replaced the portraits | | |

4. **Trust checks:**
   - every device shows the same totals;
   - the burrow is told who did not scatter;
   - the CSV downloads and matches the results;
   - the public view shows totals only.
5. **Worth trying:**
   - change a scatter after saving;
   - one person on a computer while the rest are on phones;
   - Still critters on;
   - Sounds off.

## 4. After

- Write down every issue. Decide for each: fix before October, or accept it knowingly. File the fixes as issues.
- Then move production to mainnet ([deployment.md](deployment.md#moving-production-to-mainnet)).

## Known rough edges on testnet

- **Opening a feast takes a few minutes,** while the Chiado registration finalizes.
- **Chiado runs on one node** and has had outages of a few hours. If the key is late, the feast waits and polls; nothing is lost.
- **A lost registration means cancelling the draft and setting the feast up again.** The adapter never registers twice on its own.
- **Use www.crittercrumbs.app.** On `critter-crumbs.vercel.app`, pages load but saving fails the origin check.
- **ENS names come from a free public RPC.**
