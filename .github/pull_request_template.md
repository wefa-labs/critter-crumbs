## Why

What problem this solves, in one or two sentences.

## Measured

The numbers or observations that show the problem, and what changed.

- Agent: <agent>, model <model>, effort <effort>

<!-- An agent fills the line above with what `~/.agents/evals/bin/agent-model --pr` prints, read from its own session log; `dev evals scoreboard` reads it. Leave it out for work no agent made. -->

## Verification

Tier: <routine | sensitive | critical>, from `.agents/merge-policy.json` (`node scripts/select-checks.mjs` prints it with the checks it asks for).

- Routine: the targeted check that exercises the change, with its command and result.
- Sensitive: `bun run check` green, and an adversarial review by a fresh agent with its findings addressed.
- Critical: `bun run check` and `bun run vercel-build` green (CI's `check` job), and an adversarial review by a fresh agent with its findings addressed.
- A change that renders under `packages/app/src`: labeled captures at 375 and 1280 wide, or why they are pending.

## Not verified

What was not checked, and why.
