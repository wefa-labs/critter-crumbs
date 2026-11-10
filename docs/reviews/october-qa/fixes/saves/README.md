# Saves: rules-04 and production-build-04, checked on the production bundle

Captures and end-to-end runs for the fix of QA findings rules-04 and production-build-04 (9 November 2026). Each capture shows the scatter screen after Scatter These and Confirm, at 375 × 812 and 1280 × 800, in light and dark. Each has a line of its own:

| File | What happened | The line |
|---|---|---|
| `sign-locked-*` | The account app was locked (`accountsChanged []`, `eth_accounts` empty) | `scatter.sign.locked` |
| `sign-other-account-*` | The account app moved to another account | `scatter.sign.otherAccount` |
| `sign-expired-*` | The confirmation took six minutes, so it reached the store too old | `scatter.sign.expired` |

## How they were made

They were made on the production bundle (`bun run build`), served under `vercel.json`'s headers, with the local Shutter and the mock API on the session's own ports. The October QA's in-Node wallet (`.scratch/worktree-archive/live-timelock/qa/verify-a/wallet.mjs`) was injected into Chromium, with the app's sound silenced.

In each of the four page loads, the three causes were put right one by one, and Scatter These was pressed once more. The scatter saved every time, in the same page and without a reload.

## The QA's own scripts, run again

These are the runs that found the faults, against the same bundle.

- `stale-retry.mjs prod chromium` (rules-04):
  - A retry straight after a dropped save still resends the same signed scatter, signed once, and it saves.
  - A retry with the stack's clock six minutes on now signs afresh and saves, signed twice in all. In October it answered `400 err.generic` every time.
- `sign-failures.mjs chromium` (production-build-04):
  - A wallet that locked and was unlocked again signs and saves on the first press. In October: "the wallet was asked: nothing · Not confirmed", for ever.
  - A wallet that answers 4100 reads "Your account app is locked…", and saves once it is put right.
  - A declined signature and a declined chain switch still read "Not confirmed…", and save on the next press.
- In the QA's other-account case, the wallet announces another account but still reports the connected one to `eth_accounts`. The page asks it again before refusing, so that scatter saves on the first press. The capture above makes the wallet report the other account, which is what refuses.

The harness from October needed one change for the November frames: its connect step waits for a *visible* profile button, since the page now draws more than one.
