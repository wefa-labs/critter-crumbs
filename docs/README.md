# Critter Crumbs documentation

Start with the [README](../README.md): what Critter Crumbs is, why it exists and where it stands. On the beta, [How it works](https://www.crittercrumbs.app/how-it-works) and [Why nobody can peek](https://www.crittercrumbs.app/how-it-works/why) open without an account. [CONTEXT.md](../CONTEXT.md) is the glossary.

## The specifications

Written in September 2026 for the first release, for coding agents with a person reviewing their work, and kept up to date as the app changes. Their rules are current; their dates are not. The September rehearsal and the October 2026 feasts they plan have not happened yet, and production is a testnet beta ([decisions](decisions.md), 10 November 2026).

| Document | What it covers |
|---|---|
| [01 Product requirements](01-prd.md) | The problem, who it is for, the rules, the feast lifecycle, and privacy and trust (§8) |
| [02 Design system](02-design-system.md) | The look, the components, every screen and state, and every line of copy (§10) |
| [03 Game design](03-game-design.md) | Feel, sound, the feast sequence and the critter simulation |
| [04 Technical spec](04-technical-spec.md) | Architecture, encryption and signing, storage, the API, the tally and every failure state |

## Decisions

- [decisions.md](decisions.md): consequential choices, newest last. It is append-only, so a later entry can supersede an earlier one.
- [adr/](adr): numbered architecture decisions, one paragraph each, with the options rejected.

## Running it

- [build/deployment.md](build/deployment.md): production on testnet, its configuration and the record of every deployment.
- [build/rehearsal.md](build/rehearsal.md): the run sheet for the solo smoke feast and the rehearsal with the group.
- [build/local-core.md](build/local-core.md): the local stack, with fixtures, clock controls and simulated key release.
- [research/](research): notes from primary sources on Shutter, EAS, hosting and dependencies, behind the specifications' choices.

## Dated working material

These are kept as a record of how the app was built. They are not maintained, so check a document's date before relying on it.

- [reviews/](reviews): QA passes and design and UI audits, with captures. The [October QA](reviews/october-qa/README.md) lists its 127 findings and which have been fixed.
- [explorations/](explorations): design directions, prototypes, briefs, and sound and art studies. GitHub shows the HTML pages as source; open them from a local copy.
- [pitch/](pitch): the pitch deck from September 2026, as HTML and PDF. Its plans and dates are from then.
- [build/README.md](build/README.md) and the `build/phase-*` files: the first build's plan, prompts and handoffs, from September 2026.
- [foundation/](foundation): notes on the September 2026 workspace scaffold.
- [agents/](agents): settings for the coding agents' skills.
- [images/](images): the README's screenshots, taken on 10 November 2026.
