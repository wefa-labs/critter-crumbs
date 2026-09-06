# V6: Neon HTTP transactions and hermetic Postgres tests

Checked 2026-09-05 against Neon serverless **1.1.0**, Node **22.22.1**, the Phase 1 dependency record, Technical Spec §3–§5, §9–§10 and §14, and ADR 0003. Research and isolated probes only; no live database was contacted and no project dependency was added.

**V6 passes with a transaction constraint:** the pinned Neon driver runs its HTTP path on Node 22 without an application connection pool. HTTP transactions accept a prepared batch; they cannot pause for a JavaScript decision between queries. **PGlite 0.5.8 runs the spec's SQL unchanged and supports an offline API suite.** Its single connection cannot prove PostgreSQL behavior across concurrent database connections, so keep the separate Neon test command for that evidence.

## Verified driver behavior

Neon 1.1.0 declares Node `>=19.0.0` and provides ESM and CommonJS entries. Vercel supports the Node 22 major line and controls its deployed minor and patch versions. The local toolchain can therefore remain exactly 22.22.1 while Vercel uses its managed Node 22 patch. [Pinned Neon manifest](https://raw.githubusercontent.com/neondatabase/serverless/v1.1.0/package.json), [Vercel Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

`neon(connectionString)` uses HTTPS fetch. `sql.transaction([...])` sends several queries in one transaction; an optional synchronous callback only builds that array. Interactive transactions use `Client` or `Pool` over WebSockets. Those are different adapters and must not be silently substituted for the HTTP design. [Pinned Neon README](https://raw.githubusercontent.com/neondatabase/serverless/v1.1.0/README.md), [transaction configuration](https://raw.githubusercontent.com/neondatabase/serverless/v1.1.0/CONFIG.md)

The correct option is **`isolationLevel`**, with values including `ReadCommitted` and `Serializable`. Parts of `CONFIG.md` mistakenly call it `isolationMode`; the exported types and implementation agree on `isolationLevel`. The implementation rejects an async transaction callback before sending a request. [Pinned transaction types](https://raw.githubusercontent.com/neondatabase/serverless/v1.1.0/src/httpTypes.ts), [pinned HTTP implementation](https://raw.githubusercontent.com/neondatabase/serverless/v1.1.0/src/httpQuery.ts)

A local probe imported the installed 1.1.0 ESM entry under Node 22.22.1, injected a recorded response through `neonConfig.fetchFunction`, and trapped global `fetch`. It observed one HTTP POST for two parameterized queries, parameter arrays `[["1"], ["2"]]`, the `Neon-Batch-Isolation-Level: Serializable` header, and rejection of an async callback before another request. There were **zero real network calls**. This proves the pinned transport and runtime behavior; it does not claim a deployed Vercel-to-Neon integration test.

## Preserve the HTTP design without duplicating phase logic

The following is a proposed implementation shape, derived from the verified driver limit and the project's rules. Record it in `docs/decisions.md` before dependent code.

1. Read a consistent database snapshot and its revision. Use a read-only repeatable-read HTTP batch where several reads must agree. Run `phaseAt(feast, serverNow)`, membership checks, and any close-record hashing in TypeScript.
2. Prepare the complete mutation. Commit it through parameterized SQL with an atomic revision comparison. A conservative scope is a revision on the burrow row: every membership and feast mutation in that burrow increments it. That covers membership changes that affect a pending freeze as well as scatter replacement and close publication.
3. A data-modifying CTE performs `UPDATE ... WHERE revision = expectedRevision RETURNING ...`. Every dependent write must consume its returned row; a failed comparison must cause no domain write. Do not execute an unconditional write after a failed guard. A successful gate and all related writes belong to the same transaction.
4. On conflict, reload, obtain a fresh clock input, call `phaseAt` again, and rebuild the mutation. Bound retries and map exhaustion to a copy ID. Never carry a phase or authorization decision from a stale snapshot into an unconditional write.

Postgres rechecks an update's `WHERE` condition after a concurrent updater commits. Data-modifying CTEs can pass their `RETURNING` output to dependent work, but share one statement snapshot: communicate through that output and avoid modifying the same row twice in one statement. These details make the proposed revision gate viable; its actual SQL still needs interface tests. [Postgres isolation](https://www.postgresql.org/docs/current/transaction-iso.html), [Postgres data-modifying CTEs](https://www.postgresql.org/docs/current/queries-with.html#QUERIES-WITH-MODIFYING)

This protocol gives the required operations concrete guards:

- **Freeze:** add a nullable `participants_frozen_at` marker. Checking whether participant rows exist cannot represent a completed empty freeze. The successful revision gate writes the participants, any people-target changes, the marker and the possible `void` status together. Membership changes must first materialize any deadline already crossed for affected feasts, so a late first feast read cannot move the historical participant set.
- **Sequence assignment:** reading `max(seq) + 1` alone is unsafe across connections. It is usable only if every competing scatter write shares the same revision guard and a failed comparison reloads the maximum. A counter updated in the same transaction is another valid choice; neither requires an allocation to reach the server.
- **Close record:** read ordered stored `(seq, uid, attester)` metadata, compute the publication hash, then compare the revision and `closed_at IS NULL` while storing the record. A concurrent accepted scatter changes the revision and forces a new snapshot; a concurrent close produces one immutable record. Do not compute a hash before a lock and then store it without checking that the published set stayed unchanged.
- **Late requests:** a request that loses to close must reevaluate against the new record and a fresh injected clock. The close record must never be followed by an accepted scatter omitted from its set.

No SQL phase function is needed: SQL protects the snapshot and write atomicity; `phaseAt` remains the only phase calculation. An interactive transaction interface exposed by a PGlite test adapter would conceal the production driver's limitation, so the shared data interface should expose the same prepared-operation contract in both adapters.

## PGlite selection and migration proof

The registry's latest eligible stable version was **`@electric-sql/pglite@0.5.8`**, published **2026-08-26T18:40:08.921Z**. This predates the conservative seven-day cutoff of 2026-08-29T00:00:00Z. Its published manifest declares `Apache-2.0`, has no runtime dependency entries, and its own archive contains the Apache 2.0 licence. The archive does not contain a separate `POSTGRES-LICENSE` file; upstream documents the Postgres source licence separately. [Exact registry metadata](https://registry.npmjs.org/@electric-sql/pglite/0.5.8), [registry release timestamps](https://registry.npmjs.org/@electric-sql/pglite), [upstream licensing](https://github.com/electric-sql/pglite/tree/main/packages/pglite#license)

The archive was downloaded and unpacked only under `/private/tmp/critter-v6-pglite-0.5.8`; no install or package lifecycle scripts ran. Evidence:

| Item | Value |
|---|---|
| Archive bytes | `8791923` |
| Registry SHA-512 integrity, verified before extraction | `sha512-n9tsbUOhwx2epK1V0ZG9Ar4SHWUju04dhmzZXiSBXwBoleOvIfals33NAaWgagQVAL4Rbvx/Ptsu3P+pA09f6Q==` |
| Own `LICENSE` SHA-256 | `a6cba85bc92e0cff7a450b1d873c0eaa2e9fc96bf472df0247a26bec77bf3ff9` |
| Verbatim §3 SQL SHA-256 | `6e7b909e896f13824d92155ca9dcd941bff40d581c207e3a3d7e1d8b5f5133cd` |
| Runtime | `v22.22.1` |
| Database version reported | `PostgreSQL 18.3 (PGlite 0.5.8)` |

The probe extracted the entire fenced SQL block from Technical Spec §3, without editing it, and executed it with `PGlite.exec`. It created **nine tables and two enums**. A transaction containing one valid profile insert followed by an invalid variant rolled back both writes. Twenty concurrent calls to a guarded close update produced exactly one changed row. Twenty concurrent transaction callbacks assigning `max(seq) + 1` produced sequences 1–20. Initialization, migration and queries completed with global `fetch` replaced by a throwing trap: **zero fetch calls**.

PGlite's documented `exec` method supports multi-statement migrations; parameterized `query` and transaction callbacks support the test adapter. Load its bundled files locally, rather than from a CDN, so test initialization stays offline. [PGlite API](https://pglite.dev/docs/api)

**Concurrency limit:** PGlite is single-user/single-connection. Its implementation serializes queries and transaction callbacks with a mutex. A second in-memory instance in the probe had an independent empty database; it was not another connection to the first instance. Consequently the passing `max(seq) + 1` probe is evidence of serialization, not evidence that an unguarded maximum is safe on Neon. Keep `test:api:neon` explicitly separate from the default offline suite and run the same handler assertions there with concurrent HTTP requests against a dedicated test database. [PGlite limitation](https://github.com/electric-sql/pglite/tree/main/packages/pglite#limitations), [transaction mutex implementation](https://raw.githubusercontent.com/electric-sql/pglite/main/packages/pglite/src/base.ts)

The temporary, executable evidence is `probe.mjs`, `0001_spec_verbatim.sql`, `evidence.json`, `neon-http-probe.mjs` and `neon-evidence.json` in that directory. Commands used after archive extraction:

```bash
cd /private/tmp/critter-v6-pglite-0.5.8
/Users/afo/.local/share/mise/installs/node/22.22.1/bin/node probe.mjs
/Users/afo/.local/share/mise/installs/node/22.22.1/bin/node neon-http-probe.mjs
```

The repository must retain its own migration and API tests; temporary probe files are not a substitute for merge evidence. Repeat the migration proof against the actual migration after the following additions are decided.

## Schema gaps to decide before implementation

These are conflicts or omissions in the local spec, not Neon restrictions:

- §5 requires `profiles.ens_name` and `ens_checked_at`, absent from §3. Add the two cache columns.
- §5 requires a nonce stored for ten minutes, absent from §3. Add expiring, atomically consumed nonce storage. This is compatible with T6's ban on a sessions table: the session itself remains stateless.
- §4 requires an explicit completed-freeze guard, absent from §3. Add `participants_frozen_at`, plus the revision field needed by the chosen HTTP commit protocol.
- §3 makes `ballots.uid` unique, while E3 says resubmitting the same signed object gets a new `seq`; §7 says each submission is stored. Choose an explicit resolution. Preserving E3 requires permitting repeat UIDs in different `(feast_id, seq)` rows and publishing those sequence-bearing entries deterministically.
- §3 stores `closed_at` and a hash but does not spell out storage for the close record's complete ordered publication and counted-UID lists. Either store the record atomically, or document reconstruction from immutable accepted rows and prove the reconstruction matches the stored hash.
- §3's timestamp defaults use database `now()`. Handlers and seed operations must supply their injected timestamps explicitly; tests must not obtain authoritative time accidentally from those defaults.

PGlite can support the requested hermetic path, and the HTTP limitation has an implementable resolution consistent with ADR 0003. No stop condition is established by V6. Live Neon connectivity and true multi-connection isolation remain follow-up validation, not claims of this research.
