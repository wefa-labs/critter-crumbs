# Critter Crumbs

> Everyone gets a handful of crumbs to share.

A private way for a group to decide how something gets shared out. Your **burrow** gathers, everyone gets the same handful of **crumbs**, and you **scatter** yours to the **critters** you think earned them. Every crumb stays encrypted until the **feast** — then it all opens at once, and everyone computes the same result on their own device.

Two uses, one mechanic:

- **People feast** — recognising contribution. Crumbs go to other people.
- **Options feast** — splitting a budget. Crumbs go to named options.

Either way, every target is a critter: a small 3D creature generated from an address, that grows a little when fed.

## How a feast works

1. **Gathering** — everyone writes what they did, hidden from each other.
2. **Scattering** — statements open all at once; everyone reads, then scatters their crumbs privately. Tap to give a crumb, hold to pour.
3. **The feast** — at the deadline the decryption key is released, every client decrypts and tallies locally, and the critters wake and grow. Results and a CSV follow.

Scatters are threshold-encrypted until the deadline (Shutter), signed by each member (EAS off-chain attestations) so nothing can be forged or quietly dropped, and public results can be recorded on-chain (Base). The server stores ciphertext and serves it back; it never sees an allocation and never computes a result. No analytics, no telemetry.

## Status

Phase 3 game and browser UI implemented for local mock rehearsal, September 2026. Integration and remaining validation gates are tracked in the [Phase 3 handoff](docs/build/phase-3-handoff.md). First real use: a council of 6–10 people in October 2026, with a rehearsal feast in September. The four documents in `docs/` are the specification: [product requirements](docs/01-prd.md), [design system](docs/02-design-system.md), [game design](docs/03-game-design.md), [technical spec](docs/04-technical-spec.md). Coding agents read [AGENTS.md](AGENTS.md) first (any agent: Claude Code, Codex, others), use the glossary in [CONTEXT.md](CONTEXT.md) and the skills vendored in `.agents/skills/`; decisions are logged in [docs/decisions.md](docs/decisions.md) and [docs/adr/](docs/adr/).

## Local rehearsal

Use Bun 1.4.2 and Node 22.22.1. From the repository root:

```sh
bun install --frozen-lockfile --ignore-scripts
SHUTTER_MODE=mock DEV_ENDPOINTS_ENABLED=1 LOCAL_API_PORT=4300 bun run dev:local
```

Then run `LOCAL_API_PORT=4300 bun run seed --phase gathering` in another terminal and open the printed feast at `http://127.0.0.1:5173`. The Connect dialog exposes eight local rehearsal accounts only in development with the server's mock controls enabled. Use the API clock and key-release controls from [local core](docs/build/local-core.md) to move through the feast. Local result recording uses a recorded transaction fixture; it sends no real transaction.

`bun run check`, `bun run build`, and `bun run e2e` are the validation commands. E2E requires Chromium (`bun run e2e:install`) and the running mock app/API. See [validation evidence and remaining gates](docs/build/phase-3-validation.md).

## Stack

Vite, React, TypeScript · React Three Fiber and drei for the critters · Koota for the simulation core · viem for signing · Shutter for timelock encryption · EAS for attestations · Vercel Functions and Neon Postgres.

## Licence

Copyright © 2026 WEFA LLC. All rights reserved. See [LICENSE](LICENSE).
