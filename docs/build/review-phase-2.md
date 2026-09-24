# Independent review of the phase 2 core

Review the complete Critter Crumbs phase 2 core for correctness and merge readiness. Work in `/Users/afo/Code/wefa/critter-crumbs`. The user wants you to do the review because manually reading the stack is too tedious. This is review authorization, not merge or deployment authorization.

Read `AGENTS.md`, `CONTEXT.md`, `docs/build/phase-2-core.md`, `docs/build/phase-2-plan.md`, the complete Technical Spec, its cited PRD/design/game sections, ADRs, decisions, and `docs/build/phase-2-handoff.md`. Use `$code-review` with separate Standards and Spec reviewers. Prior reviews and green logs are evidence to check, not reasons to skip an independent review.

The stack is PRs #3–#14 on `wefa-labs/critter-crumbs`: preflight plus eleven implementation tickets. Query GitHub for their current heads, bases and status; record the exact SHAs reviewed. The original baseline is `1f64379`, and the completed phase 2 head is `e9d67f94129583360b013d5b74c34276028135c7`. If the PR heads have changed, use the current heads and explain the difference. If already merged, review their recorded merge commits. Fetch refs as needed and use a separate worktree so other ongoing work remains untouched. Do not assume the current checkout is the review target.

Review the cumulative core once, then inspect each PR's incremental diff and dependency order. Cover:

- Shared copy IDs/typed slots, all feel constants, hand-written parsers, canonical JSON, frozen generator draw order and layout fixtures.
- Exact phase boundaries from injected server time; sessions, nonce replay, authorization, membership history, and freeze/close effects under concurrency.
- The dumb-store rule: no server decryption, allocation inspection or tally. Distinguish active membership from a feast's immutable participant set.
- Complete EAS signature/domain/schema/UID verification; server-assigned sequence; identical signed retries; 4 KB ciphertext cap; latest-only tally with no fallback; participants and publication hash binding.
- SQL snapshot/revision guards, transaction atomicity, interrupted registration/key recovery, concurrent first requests, and the limits of PGlite's single connection.
- All §8 tally cases, independent fixture provenance and the full headless lifecycle. Ensure expected values are independent of the implementation.
- Shutter real-mode parsing/recovery, mainnet configuration mismatch, SDK loading, anonymous fallback, session/privacy headers and default offline tests.
- Result-record chain/receipt/event/getter verification, membership/phase/public gates, immutable first record, and truthful public aggregates before recording.
- Dev endpoints, seed/migration/schema scripts, Vercel versus local behavior, dependency decisions, import direction, wall-clock allow-list and unchanged app source.

One newer product decision was made after this stack: only the person who created the burrow may remove another member, and remaining members must see a clear removal record. That is a follow-up change; the original stack intentionally implements self-leave only. Do not report the previously unresolved Q8 as a hidden regression, but identify what the follow-up must preserve, especially frozen participants and historical results. Deployment support added after the phase 2 head is outside this review unless needed to explain a deployment limitation.

Select Bun 1.4.2 and Node 22.22.1. Run `bun run check`, `bun run test -- --reporter=verbose`, and `bun run build` from the reviewed worktree. Inspect the required tally names and lifecycle result. The full check includes its separate localhost asset proof and audit; default tests must stay offline. Do not use live database credentials, sign/send chain transactions, change repository settings, merge, push fixes, or post review comments. Local findings files and read-only GitHub inspection are authorized.

Write `docs/build/phase-2-independent-review.md` in your review worktree. Lead with a verdict: ready, ready with nonblocking follow-ups, or blocked. For each actionable finding give severity, file and line, violated requirement, concrete failing scenario, and a reproduction/test where possible. Keep Standards and Spec findings separate. Distinguish proven bugs, unverified risks, operational setup and accepted limitations. List exact tested SHAs/commands/results and anything you could not verify. Finish with the recommended merge order and a short list of decisions the human actually needs to make. Do not merge anything.
