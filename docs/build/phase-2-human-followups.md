# Phase 2 human follow-ups

These are issue-ready requests, intended label `needs-human`. **None is filed:** GitHub Issues remains disabled as checked 2026-09-05. Do not change repository settings. [Phase 1's setup request](../foundation/needs-human-setup.md) already covers enabling Issues, Vercel/Neon, RPC configuration and repository protections; do not duplicate that issue.

## Decide whether one member may remove another

PRD Q8 remains open. Decide whether members may remove someone else and, if so, the authority, timing and effect on gathering, frozen feasts and past history. Phase 2 implements the specified self-leave path; no removal behavior is inferred. References: PRD §5 R16, F3 and Q8.

Local issue body: `.scratch/phase-2/needs-human/01-prd-q8.md`.

## Confirm the project Shutter key and plan

The project account must obtain or confirm the Shutter API key and commercial/gas terms under T14. [Research](../research/shutter-api-v2-v3.md) found anonymous mainnet access and source-documented API-funded gas. It does not establish a paid-plan requirement or future guarantees. Confirm the default tier and secret configuration. No signup, contact, key creation or paid-plan selection was performed. References: Technical Spec V2 and T14.

Local issue body: `.scratch/phase-2/needs-human/02-shutter-account-plan.md`.

## Run the reviewed live Chiado and Base Sepolia feast

After the fixture adapters and registration tooling are reviewed, the reviewer supplies the §13 Chiado/Base Sepolia variables and registers both EAS schemas. Run a real registration, wait for key release, verify equal local results, and post the public result only with an explicitly authorized account. Phase 2 does not post to a real chain or provision credentials. Record transaction/schema IDs and evidence without secrets.

Blocked by the Shutter adapter and result-record tickets, plus phase 1 project/RPC setup. References: Technical Spec §6–§7, §13, M4 and the phase 2 scope restrictions.

Local issue body: `.scratch/phase-2/needs-human/03-live-chiado-base.md`.

## Filing after Issues is enabled

Search existing issues first. File each request with its exact title above and a body file containing only that request, using `gh issue create --repo wefa-labs/critter-crumbs --label needs-human --title … --body-file …`. Record the resulting issue URL in the phase 2 handoff. The three local files already contain those individual bodies; this document preserves their substance for a fresh checkout.
