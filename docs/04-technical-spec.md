# Critter Crumbs — Technical Spec

**Document 4 of 4** · Status: draft for review · 2026-09-02
Upstream: `01-prd.md` (rules §5, lifecycle §6, privacy §8, edge list, P1–P12), `02-design-system.md` (stage contract §6.3, portraits §5.7, fallback §11, copy IDs §10), `03-game-design.md` (Koota simulation §7, budget §6, sound §5.7). Companion: `AGENTS.md`, `docs/decisions.md`.

**How to read this document.** Written for two coding agents working in parallel, with a human reviewing.

- Normative: "must", "never", every table of names and shapes. Code uses the names here.
- **Decision (T#)** marks an architectural call made in this document; collected in §19. **Open (TQ#)** questions were all resolved in review on 2026-09-02. **Verify (V#)** is a fact this document could not confirm from current sources and that the first day of the build must check before relying on it; collected in §18.
- Current-practice checks were made on 2026-09-02 against Vercel's storage docs, Shutter's API docs, the EAS SDK and its deployment list. Where those change, this document loses.
- The vocabulary and the copy are the PRD's and the Design System's. Code identifiers may say `ballot`; UI never does.

---

## 1. Architecture

```
                    ┌──────────────────────────── browser ────────────────────────────┐
                    │  React + TypeScript (Vite)                                       │
                    │  ┌─────────────┐  ┌───────────────┐  ┌────────────────────────┐ │
                    │  │ DOM screens │  │ Koota world   │  │ lazy chunks            │ │
                    │  │ + copy      │◄─┤ (sim §GD 7)   │◄─┤ three/R3F/drei (3D)    │ │
                    │  │ + portraits │  │ tick(now)     │  │ shutter-sdk + viem      │ │
                    │  └──────┬──────┘  └───────────────┘  │ (crypto, at scattering) │ │
                    │         │ fetch (JSON, session cookie)└────────────────────────┘ │
                    └─────────┼──────────────────────────────────┬──────────────┬──────┘
                              ▼                                  │ signTypedData│ writeContract
                    ┌──────────────────────┐                     ▼              ▼
                    │ Vercel Functions     │             ┌─────────────┐  ┌──────────────┐
                    │ /api/* (Node)        │             │ EIP-6963    │  │ Base (EAS)   │
                    │ auth · burrows       │             │ wallet /    │  │ result       │
                    │ feasts · ballots     │             │ v1 embedded │  │ attestation  │
                    │ key cache · seed     │             └─────────────┘  └──────────────┘
                    └───┬──────────┬───────┘
                        │          │ register / get key
                        ▼          ▼
              ┌──────────────┐  ┌──────────────────┐   ┌────────────────┐
              │ Neon Postgres│  │ Shutter API      │──►│ Gnosis registry│
              │ (Marketplace)│  │ (mainnet/Chiado) │   │ + keypers      │
              └──────────────┘  └──────────────────┘   └────────────────┘
                                          ENS: mainnet RPC, read-only, server-side, cached
```

**Principles that decide the shape**

| Principle | Consequence |
|---|---|
| The store is dumb infrastructure (PRD §8) | The server never sees an allocation. It stores signed ciphertext, serves it back, and publishes the set of UIDs at close. It computes no result. |
| Everyone tallies locally (R14) | The tally is a pure function shipped to every client; the server's only role at reveal is caching the decryption key. |
| Nobody transacts to scatter | The Shutter API registers the feast's identity on Gnosis Chain itself (it can cover the gas, §6), and ballots are off-chain EAS attestations signed with the account. Only posting a public result costs gas, on Base, by whoever chooses to. |
| Time is an input (brief) | Every function that depends on time takes `now`; the server stamps `serverNow` on every response; the client never trusts its own clock for phase. |
| Minimal dependencies | Ten runtime dependencies (§11). ethers, wagmi, query and state libraries, ORMs, markdown and icon libraries are all rejected with reasons. |
| Two agents in parallel | Workstreams split along `/src/core` (crypto, tally, API client, data) and `/src/app` (screens, sim, 3D, audio), joined by `/src/shared` types that are written first (§12, §16). |

### 1.1 Data flow, end to end

1. **Connect** — the account signs a sign-in message (§5); the server sets a session cookie. ENS name resolved server-side; display name prompted if none. The critter variant is stored per address (PRD P10).
2. **Burrow** — create, add members by address or ENS, join via link (admits pre-added addresses only, PRD P2), leave.
3. **Open a feast** — the creator posts the setup; the server validates (bounds, deadline order, minimum critters), registers a Shutter identity with `decryptionTimestamp = scatteringEndsAt` (§6), stores the eon key and identity, and opens gathering.
4. **Gathering** — statements are plain text in Postgres; the server serves only the author's own until scattering opens.
5. **Scattering opens** — automatic by time. The server freezes the participant set (R7) on the first request after the deadline and thereafter serves all statements.
6. **Scatter** — the client builds the allocation, encrypts it with the feast's eon key (§6), wraps the ciphertext in an EAS off-chain attestation signed by the account (§7), posts it. The server verifies the signature, membership and phase, assigns a sequence number, stores it, returns the UID and `seq`. The client re-reads the feast to confirm the UID is present before showing "Scattered." (§15, network drop).
7. **Close** — automatic by time. The first request after `scatteringEndsAt` publishes the close record: every UID received, the counted UID per scatterer (latest `seq`), and `publishedSetHash`. Immutable thereafter.
8. **Reveal** — any client fetches the key from the server (cached from Shutter, §6), decrypts every counted ballot locally, validates, tallies (§8), and renders the feast. Identical everywhere.
9. **Record** — for public feasts, any member posts the result attestation on Base from their own account (§7); the server records the transaction hash and attester.
10. **CSV** — generated client-side from the client's tally.

## 2. Trust and security model

| The server can | The server cannot |
|---|---|
| Refuse service (availability) | Read an allocation before the deadline (Shutter) or forge one (signatures) |
| See who scattered and when (participation is never private) | Drop a ballot silently: the published set is checked by every client for its own UID |
| See statements (they are not secret from the host; they are hidden from *other members* until reveal) | Change a result: every client tallies from the same published set and key |
| Serve stale data | Alter a ballot's contents (signed) |

**Authentication.** Sign-in message over EIP-191 (`personal_sign`), verified with viem; a stateless HMAC session cookie `__Host-cc_session` (`Secure; HttpOnly; SameSite=Lax; Path=/`), 7-day expiry, payload `{ address, exp }`. No sessions table (**T6**). Ballot submission is additionally authenticated by the attestation's own EIP-712 signature.

**Authorisation.** Burrow content requires membership; feast reads follow PRD §8: public aggregate → results readable without a session; burrow-only → members only; individual scatters open → the giver matrix is served only to members and only after close. Ciphertexts are served to members only (public feasts included) — the PRD's honest limit applies regardless.

**Untrusted text.** Statements and names render through `textContent`; URLs are auto-linked by one regex on `https?://` and rendered as elements, never as HTML strings (Design System D13). No `innerHTML` anywhere; lint rule.

**Headers** (all responses, per current guidance): `Strict-Transport-Security: max-age=31536000; includeSubDomains`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), geolocation=(), microphone=(), accelerometer=()`, `Cross-Origin-Opener-Policy: same-origin-allow-popups` (wallet popups), `Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self' <shutter api> <base rpc>; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'`. Vite emits no inline scripts, so no nonces are needed; `'wasm-unsafe-eval'` is there for the Shutter SDK (**V1**: confirm it needs WASM). Fonts and the sound files are self-hosted; no third-party request is ever made from the page except Shutter and the Base RPC.

**No analytics, no telemetry** (R15): no error reporting service, no logging of behaviour server-side beyond request errors with addresses masked.

## 3. Data model

Postgres on Neon, provisioned through the Vercel Marketplace (**T1**, §10). Plain SQL with the Neon serverless driver; migrations are numbered `.sql` files applied by a script. All timestamps `timestamptz` in UTC. Addresses stored lowercase, checksummed on output.

```sql
create table profiles (
  address        text primary key,          -- lowercase 0x…
  variant        smallint not null default 0 check (variant between 0 and 4),
  rerolls_used   smallint not null default 0 check (rerolls_used between 0 and 4),
  display_name   text,                       -- used when no ENS name
  created_at     timestamptz not null default now()
);

create table burrows (
  id             uuid primary key,
  name           text not null check (char_length(name) between 1 and 60),
  created_by     text not null references profiles(address),
  created_at     timestamptz not null default now()
);

create table burrow_members (
  burrow_id      uuid not null references burrows(id),
  address        text not null references profiles(address),
  added_by       text not null,
  joined_at      timestamptz,                -- null until the address first connects via the link
  left_at        timestamptz,                -- R16; a left member keeps their row for history
  primary key (burrow_id, address)
);

create type feast_kind as enum ('people', 'options');
create type feast_status as enum ('draft', 'open', 'cancelled', 'void');  -- phases are computed from time, not stored

create table feasts (
  id                   uuid primary key,
  burrow_id            uuid not null references burrows(id),
  created_by           text not null,
  kind                 feast_kind not null,
  title                text not null check (char_length(title) between 1 and 80),
  context              text not null default '' check (char_length(context) <= 140),
  crumbs_per_critter   integer not null check (crumbs_per_critter between 10 and 1000),
  gathering_ends_at    timestamptz not null,
  scattering_ends_at   timestamptz not null,
  gathering_extended   boolean not null default false,        -- R13: once
  aggregate_public     boolean not null,
  individual_open      boolean not null,                       -- independent member-only visibility choice (P14)
  status               feast_status not null default 'draft',
  opened_at            timestamptz,
  cancelled_at         timestamptz,
  -- Shutter (set at open)
  shutter_identity_prefix bytea, shutter_identity bytea, shutter_eon integer, shutter_eon_key bytea,
  shutter_tx_hash      text, shutter_decryption_key bytea,     -- key cached after release
  -- close record (set once, by the first request after scattering_ends_at)
  closed_at            timestamptz, published_set_hash bytea,
  check (gathering_ends_at < scattering_ends_at)
);

-- A critter is a target that may or may not have an owner.
create table targets (
  feast_id       uuid not null references feasts(id),
  target_id      bytea not null,                               -- people: keccak256(address); options: keccak256(feast_id || index)
  kind           text not null check (kind in ('person','option')),
  owner_address  text,                                         -- null for options
  name           text not null,
  position       smallint not null,
  primary key (feast_id, target_id)
);

create table statements (
  feast_id       uuid not null references feasts(id),
  target_id      bytea not null,
  author_address text not null,                                -- the person, or the creator for an option (PRD P1)
  body           text not null check (char_length(body) <= 2000),
  updated_at     timestamptz not null default now(),
  primary key (feast_id, target_id)
);

-- Frozen when scattering opens (R7). Every member of the burrow at that moment who has not left.
create table feast_participants (
  feast_id       uuid not null references feasts(id),
  address        text not null,
  primary key (feast_id, address)
);

create table ballots (
  feast_id       uuid not null references feasts(id),
  seq            bigint not null,                              -- server-assigned, monotonic per feast (T11)
  uid            bytea not null unique,                        -- EAS off-chain UID
  attester       text not null,
  attestation    jsonb not null,                               -- the full signed off-chain attestation (§7)
  ciphertext     bytea not null,
  received_at    timestamptz not null default now(),
  primary key (feast_id, seq)
);

create table result_attestations (
  feast_id       uuid primary key references feasts(id),
  chain_id       integer not null, tx_hash text not null, uid bytea, attester text not null,
  posted_at      timestamptz not null default now()
);
```

Rules the schema enforces: crumb bounds (P9), deadline order, the invalid privacy combination (PRD §8), one statement per target, one profile per address across burrows (P10), left members keep history (R16, R17). Rules the server enforces: minimum three people-critters at creation and at scattering open (P8, P11), the single extension (R13), phase gates on every write (§4), membership on every read.

**Derived target ids.** People: `keccak256(lowercaseAddress)`; options: `keccak256(feastId ‖ uint8(index))`. The generator seeds from the string `targetId` for options and from the address for people (Design System §5.1), so an option's critter is stable for the feast's life and a person's is stable for theirs.

## 4. Time and phase

```ts
type Phase = 'draft' | 'gathering' | 'scattering' | 'feast' | 'cancelled' | 'void';
function phaseAt(feast: FeastRow, now: number): Phase;   // pure; the only place phase is computed
```

- Every API response carries `serverNow` (ms). The client keeps `offset = serverNow − Date.now()` from the latest response and computes `now()` as `Date.now() + offset`; every deadline display, countdown and `Clock` trait uses it. A skew over 5 minutes shows `err.clockSkew` once (Design System §8).
- The server is the trusted timestamp (**T4**): phase gates on writes use the function's own clock, which Vercel keeps synchronised. Shutter's key release is the ground truth for *reveal*; the app never claims a feast is open before the key exists.
- Transitions are not events. Nothing runs at a deadline; state is derived on read. The two "first request after" side effects — freezing participants and publishing the close record — are idempotent inserts guarded by `where … is null` and a transaction, so concurrent first requests produce one record.
- Tests inject `now` everywhere; the Koota `Clock` trait and the API handlers share the same discipline (§14).

## 5. Identity, connect, and the account abstraction

```ts
interface Account {
  address: `0x${string}`;
  kind: 'injected' | 'embedded';                 // v1 adds 'embedded'
  signMessage(message: string): Promise<Hex>;      // EIP-191, sign-in
  signTypedData(typed: TypedData): Promise<Hex>;   // EIP-712, ballots
  sendTransaction?(tx: TxRequest): Promise<Hex>;   // optional; only the result attestation needs it
  disconnect(): Promise<void>;
}
interface AccountProvider { discover(): Promise<AccountOption[]>; connect(option: AccountOption): Promise<Account>; }
```

- **v0 provider:** EIP-6963 discovery (the `eip6963:announceProvider` handshake is ~30 lines; no library) feeding viem's `createWalletClient({ transport: custom(provider) })`. No wagmi, no connector kits (**T5**).
- **v1 provider:** an embedded-wallet SDK wrapped to the same interface; `kind: 'embedded'`. The rest of the app never imports a provider directly.
- **Chains.** Signing in needs no chain. Signing a ballot and posting the result need the EAS chain, Base (chain id 8453; Base Sepolia 84532 in dev and during the testnet period): the account is asked to switch (`wallet_switchEthereumChain`) at those moments, and to add the chain (`wallet_addEthereumChain`) when the wallet does not know it. MetaMask refuses typed data whose domain chainId is not the active chain; a wallet that cannot switch signs as it is (decision of 2026-10-08).
- **ENS** is resolved server-side against a mainnet RPC (`MAINNET_RPC_URL`, a dependency named in the brief) with a 24-hour cache in Postgres (`profiles.ens_name`, `ens_checked_at`); the client never holds an RPC key. Failure shows addresses (`err.ensUnavailable`).
- **Sign-in message** (EIP-191), copy in the Design System's voice, never the word wallet:

```
Critter Crumbs

Connect as 0x1234…abcd

Nonce: <32 hex>
Issued: <ISO time>
Expires: <ISO time, +10 min>
```
The server issues the nonce (`GET /api/session/nonce`, stored 10 minutes), verifies with viem `verifyMessage`, and sets the cookie.

## 6. Shutter integration

Checked against the Shutter API docs (2026-09-02). Base URLs: mainnet `https://shutter-api.shutter.network`, Chiado `https://shutter-api.chiado.staging.shutter.network`. Flow:

| Step | Who | Call | Stored |
|---|---|---|---|
| Register | server, at feast open | `POST /register_identity { decryptionTimestamp, identityPrefix }` → `{ eon, eon_key, identity, tx_hash }`. The API registers on Gnosis Chain itself and "can optionally cover the gas fees" | all four fields on `feasts` |
| Encryption params | server (cached) | `GET /get_data_for_encryption?identityPrefix=` | served to clients with the feast |
| Encrypt | client, at scatter | `encryptData(message, eonPublicKey, identityPreimage, sigma)` from `@shutter-network/shutter-sdk`, `sigma` = 32 random bytes from `crypto.getRandomValues` | ciphertext goes into the ballot |
| Key | server, once, on first reveal request after the deadline | `GET /get_decryption_key?identity=` → cached in `feasts.shutter_decryption_key` | served at `GET /api/feasts/:id/key` |
| Decrypt | every client | `decrypt(encryptedData, epochSecretKey)` | in memory only |

**Who holds the Shutter API key (T14).** The project account (Afolabi) registers for the API key; it lives only in the Vercel project's environment (`SHUTTER_API_KEY`), never in the repo or the client, and is rotated after the October feast. Start on the default tier: the whole of v0 needs a handful of registrations (one per feast, rehearsal included) and one key fetch per feast. If **V2** shows that mainnet gas coverage needs a paid plan, take it — it is cheaper than running a funded Gnosis wallet, which stays the fallback design (a server-held xDAI key that submits the registration transaction itself).

**Why the server registers (T3).** The brief wants one registration per feast by the creator and no scatterer transactions. The API performs the on-chain registration; the creator's action triggers it and nobody signs a Gnosis transaction. If the API's gas coverage requires a paid key, the server holds that key (`SHUTTER_API_KEY`). **V2**: confirm the key/plan requirements, whether the API pays gas on mainnet, and the identity derivation (`identity = f(identityPrefix, registrant)`), since the registrant is the API's address, not ours.

**Why the server caches the key (T4b).** The documented mainnet rate limit is 20 `get_decryption_key` calls per day; ten members opening the feast at once would spend half of it. One fetch, cached, served to everyone. The client also carries a direct-to-Shutter fallback for the day the store is down but Shutter is up (§15). **V3**: whether the API allows browser CORS for that fallback.

**Identity prefix.** `identityPrefix = keccak256("critter-crumbs" ‖ feastId ‖ 32 random bytes)`; unique per feast; recorded before the call so a retried registration reuses it.

**Payload.** Plaintext is canonical JSON, keys sorted, no whitespace:
```json
{"v":1,"feast":"<uuid>","scatterer":"0x…","participants":"<hex publishedParticipantSetHash>","allocation":[["<targetId hex>",12],["<targetId hex>",0]],"nonce":"<16 hex>"}
```
Every target in the feast appears once, in `targets.position` order, with a whole number ≥ 0; the sum equals `crumbs_per_critter` (R2). `participants` binds the ballot to the frozen set so it cannot be replayed into a re-run. Size: under 1 KB for ten critters; ciphertext limit enforced at 4 KB.

**Capacity.** A feast supports at most **49 targets**, for both people and options. This fits every valid complete allocation at 10–1,000 crumbs in both mock and Shutter encryption. The largest valid 49-target plaintext is 3,868 bytes and its Shutter ciphertext is 4,001 bytes; a valid 50-target scatter can require 4,097 bytes. The [capacity proof](research/scatter-capacity.md) supersedes the earlier uint8-derived 256-option decision. Validate options at setup, people targets at creation, and both kinds at opening. Under the burrow revision guard, reject admissions and re-admissions that would exceed 49 active members while any people feast is draft or gathering; an already active member consumes no new place. Materialize due freezes first, so frozen feasts do not limit later burrow growth. Options feasts limit targets, not participants. Rejections use `err.feastCapacity`; never shorten the complete allocation or raise the ciphertext cap.

**Modes.** One interface, three implementations, selected by `SHUTTER_MODE`:

```ts
interface Timelock {
  register(feastId, decryptionTimestamp): Promise<{ identity, eon, eonKey }>;
  encrypt(plaintext: Uint8Array, params: EncryptionParams): Promise<Uint8Array>;   // client
  getKey(identity): Promise<Uint8Array | null>;                                    // null before release
  decrypt(ciphertext: Uint8Array, key: Uint8Array): Promise<Uint8Array>;          // client
}
```
- `mainnet` and `chiado`: the API + SDK above.
- `mock`: AES-GCM with a per-feast key derived server-side (`HKDF(MOCK_SECRET, feastId)`); `getKey` returns null until `decryptionTimestamp` has passed on the server clock **or** `POST /api/dev/release-key` has been called, so a whole lifecycle runs in seconds. The client path is byte-for-byte the same code; only the `Timelock` implementation differs. The mock is never enabled in production (`DEV_ENDPOINTS_ENABLED` is unset there).

## 7. EAS

EAS is not deployed on Gnosis Chain (checked against the EAS deployment list); it is on Base (`EAS 0x4200000000000000000000000000000000000021`, `SchemaRegistry 0x4200000000000000000000000000000000000020`, same addresses on Base Sepolia). **T2** — Base is the attestation chain for both the off-chain ballots' domain and the on-chain results. Gnosis remains the Shutter registry, which nobody in the burrow touches.

**No `eas-sdk` at runtime (T3b).** The SDK depends on ethers; viem already covers signing and contract calls. Ballots are signed with `account.signTypedData` using the SDK's own domain and types, reproduced in `/src/core/eas/typedData.ts`:

```ts
domain = { name: 'EAS Attestation', version: '0.26', chainId: 8453, verifyingContract: EAS_ADDRESS }
types  = { Attest: [ version uint16, schema bytes32, recipient address, time uint64, expirationTime uint64,
                     revocable bool, refUID bytes32, data bytes, salt bytes32 ] }   // off-chain version 2
```
The off-chain UID is computed as the SDK does; **V4** — the exact preimage is taken from the SDK source, and a dev-only test signs the same attestation with `@ethereum-attestation-service/eas-sdk` (devDependency) and asserts equal UIDs and a passing `verifyOffchainAttestationSignature`. That test is the contract; if it fails, the runtime implementation is wrong, never the other way round.

**Ballot schema** (registered once on Base and Base Sepolia; UIDs in config):
```
bytes32 feastId, bytes32 shutterIdentity, bytes ciphertext, uint32 payloadVersion
```
Attestation fields: `recipient = 0x0`, `expirationTime = 0`, `revocable = false`, `refUID = 0x0`, `time` = client `now()` (server accepts ±5 minutes), `salt` random. The server verifies with viem `verifyTypedData` (attester recovers), checks `feastId` and `shutterIdentity` match the feast, attester ∈ `feast_participants`, phase = scattering at server time, ciphertext ≤ 4 KB, then assigns `seq` and stores the whole signed object as received. The same address may submit any number of times; each is stored (PRD R12, T11).

**Result schema** (on-chain, Base; shaped so a v1 custody contract can read it — PRD §10):
```
bytes32 feastId, bytes32 publishedSetHash, uint32 crumbsIssued, uint16 scatterers,
bytes32[] targetIds, address[] owners, uint32[] crumbs
```
`owners[i]` is zero for an option. Any member may post it from their own account with viem `writeContract(EAS.attest)` after switching to Base; the server records `(tx_hash, attester)` and the UI shows `results.attest.done`. A second poster sees the existing record and is not offered the button (§15). Gas on Base is the poster's; sponsored gas is v1.

## 8. Tally

`tally(input): Result` is a pure, synchronous function in `/src/core/tally`, shared by the client and every test. It takes ordered inputs only.

```ts
interface TallyInput {
  feastId; crumbsIssued; targets: { id, ownerAddress | null, position }[];          // position order
  participants: string[];                                                            // frozen set, sorted
  ballots: { seq; attester; plaintext | null }[];                                    // counted candidates in seq order; null = failed to decrypt
}
interface Result {
  counted: { attester, seq }[]; rejected: { attester, seq, reason }[]; didNotScatter: string[];
  totals: { targetId, crumbs, share /* rational as [num, den] */ }[];                // position order
  totalScattered; ties: string[][]; resultHash;
}
```

Algorithm:
1. For each participant, take the candidate with the highest `seq` (**T11** — latest wins; earlier submissions are never counted). Non-participants' ballots are `rejected: not_participant`.
2. Validate the plaintext: parses; `v == 1`; `feast` matches; `scatterer == attester`; `participants` hash matches; the allocation lists every target exactly once in position order; every amount is a whole number ≥ 0; the sum equals `crumbsIssued` (R2); the owner of every target with crumbs > 0 is not the attester (R3). A failure rejects that scatterer's *latest* ballot and counts them as not having scattered (**T7** — no fallback to an earlier submission; the client never produces an invalid ballot, so this path is for tampering or corruption, and it is visible in the results as `results.unreadable`).
3. `totals[t] = Σ counted allocations[t]`; `totalScattered = Σ totals`; `share = totals[t] / totalScattered` as a reduced rational (R4); if `totalScattered == 0`, shares are `[0, 1]` and the result is "nobody scattered".
4. Ties: groups of targets with equal `totals` and `crumbs > 0`, in position order.
5. `resultHash = keccak256(canonicalJSON({ feastId, publishedSetHash, crumbsIssued, counted: [...uids], totals }))`.

Determinism: no floats, no `Date`, no iteration over object keys (arrays in position order everywhere). Two clients with the same close record and key produce the same `resultHash` — that is success criterion S3, and the on-chain attestation carries the numbers so anyone can recompute.

Presentation is outside the function: the UI shows shares to one decimal, the CSV to six decimals (`share` as a decimal string) plus the crumbs integer, and the giver matrix only when `individual_open`.

**Unit tests (required, deterministic):** must-scatter-all rejected; self-scatter rejected; proportions of scattered not issued (one of four never scatters); latest `seq` wins over an earlier valid one; an invalid latest does not fall back; a non-participant is rejected; nobody scatters; exactly one scatters; a three-way tie; an option feast has no self-rule; `resultHash` is stable across input orderings that the spec normalises.

## 9. API

All under `/api`, Vercel Functions on the Node runtime, JSON in and out, `serverNow` on every response, errors as `{ error: '<copy id>', detail? }` so the client maps straight to Design System strings.

| Method, path | Auth | Purpose |
|---|---|---|
| `GET /session/nonce` | — | Sign-in nonce |
| `POST /session` | — | Verify the signed message; set the cookie; return profile |
| `DELETE /session` | session | Clear the cookie (`Clear-Site-Data: "cookies"`) |
| `GET /me` | session | Profile, burrows, ENS name |
| `PUT /me` | session | Display name; re-roll (`variant`, guarded by `rerolls_used ≤ 4`) |
| `POST /burrows` | session | Create |
| `GET /burrows/:id` | member | Members, feasts (phase computed), join state |
| `POST /burrows/:id/members` | member | Add by address (ENS resolved server-side) |
| `POST /burrows/:id/join` | session | Join via link: succeeds only if pre-added (P2) |
| `POST /burrows/:id/leave` | member | R16 |
| `POST /burrows/:id/removals` | creator | Remove another member; the burrow keeps a visible record of who was removed, by whom and when (decisions of 2026-09-05 and 2026-09-06) |
| `POST /burrows/:id/feasts` | member | Create draft (validation §3) |
| `GET /feasts/:id` | phase-aware | Public: title, context, deadlines, targets asleep. Member: plus statements per §4 gates, participation, own ballot UIDs, close record after close, `result_attestation` |
| `POST /feasts/:id/open` | creator | Registers Shutter identity; sets `opened_at` |
| `POST /feasts/:id/cancel` | creator, gathering | R8 |
| `POST /feasts/:id/extend` | creator, gathering, once | R13, P6 |
| `PUT /feasts/:id/statements/:targetId` | author, gathering | Own statement; options by the creator |
| `POST /feasts/:id/ballots` | participant, scattering | Verify, store, return `{ uid, seq }` |
| `GET /feasts/:id/ballots` | member, after close | Counted ballots' ciphertexts + attestations + the close record |
| `GET /feasts/:id/key` | member, after close | Cached decryption key; `503 err.keyUnreachable` with `Retry-After` while Shutter has not released it |
| `POST /feasts/:id/result-attestation` | member, after close, public feasts | Record `{ txHash, attester }` after verifying the tx on Base |
| `GET /dev/config`, `POST /dev/seed`, `POST /dev/time`, `POST /dev/release-key` | dev only | §14; `config` tells the browser whether the rehearsal accounts may be offered |
| `POST /dev/result-transaction` | dev only, local API only | Stands in for the Base transaction when a result is recorded in the local rehearsal. Only `scripts/local-api.ts` can answer it, so it has no route file |

Validation is a hand-written set of small parsers in `/src/shared/validate.ts` (no schema library). Every write is wrapped in a transaction; every phase gate calls `phaseAt(feast, serverNow)`.

## 10. Storage and hosting

**Neon Postgres via the Vercel Marketplace (T1).** Checked 2026-09-02: Vercel's first-party storage is Blob and Global Config; KV and Postgres were sunset in favour of Marketplace providers (Upstash for Redis, Neon for Postgres). The data here is relational (burrows → members → feasts → targets, statements, ballots, participants) and must be retained indefinitely (R17); Postgres fits and a KV store would re-invent it. Ciphertexts are under 1 KB, so Vercel Blob is not needed; if a future payload grows past a few KB, ballots move to Blob with the row keeping the pointer. Provision with `vercel install neon`; the driver is `@neondatabase/serverless` over HTTP (no connection pool to manage in functions).

**Vercel Functions**: Node.js runtime, one function per route file under `/api`, region pinned next to the Neon branch. Every path the handler answers needs its route file: for any other `/api` path Vercel answers with a 404 of its own and the handler is never asked. The API tests fail on an answer from a path that has none (`tests/api/route-files.ts`). A `vercel.json` rewrites everything except `/api/*` to `index.html` and sets the headers of §2. Preview deployments per branch; the production project is the rehearsal and October deployment.

**Static assets**: the Young Serif subset (OFL), the sound set (sixteen MP3 files under `/public/audio`, 5.6 MB, none in the first load; `docs/research/audio-assets.md`), the arrival illustration (WebP), all under `/public`, all same-origin.

## 11. Dependencies

Runtime (10):

| Package | Why it earns its place | License |
|---|---|---|
| `react`, `react-dom` | The brief | MIT |
| `three` | The brief | MIT |
| `@react-three/fiber` | The brief; React 19 line | MIT |
| `@react-three/drei` | `View` (stage contract), `RoundedBox`; imported per-module so only those ship | MIT |
| `koota` | The simulation core (Game Design G10); React bindings from `koota/react` | MIT |
| `viem` | Signing, typed data, contract calls, ENS, EIP-6963 transport; the only web3 library | MIT |
| `@shutter-network/shutter-sdk` | Threshold encryption client; no substitute | **V1** (license and size) |
| `@neondatabase/serverless` | The database driver in functions | Apache-2.0 |
| `@vercel/functions`? — **not used**; plain handlers suffice | — | — |

Dev (build and test only): `vite`, `@vitejs/plugin-react`, `typescript`, `vitest`, `@types/*`, `eslint` with the TypeScript plugin, `@ethereum-attestation-service/eas-sdk` (cross-check tests only, §7), `playwright` (one lifecycle e2e in mock mode).

Rejected, with the reason: `ethers` (duplicate of viem; only reachable via the dev-only EAS SDK), `wagmi` / `rainbowkit` / `connectkit` (connector weight; EIP-6963 + viem is 30 lines), `@tanstack/react-query` (a 60-line fetch cache with `serverNow` handling replaces it), `zustand` (Koota holds real-time state; React state holds the rest), `drizzle`/`prisma` (ten tables of plain SQL), `zod` (hand parsers), `siwe` (depends on ethers; the message is 6 lines), `tailwind` (tokens are CSS custom properties), any markdown, icon, date or animation library (Design System D4, D13; `Intl` for dates; Koota systems for motion).

## 12. Repository

```
critter-crumbs/
├── AGENTS.md                 vocabulary, rules, workstreams, how to run and test
├── LICENSE                   all rights reserved (PRD P12; holder per Q9)
├── docs/                     01–04, explorations/, decisions.md
├── api/                      one-line Vercel route exports from @critter-crumbs/api
│   └── session/…  me.ts  burrows/…  feasts/…  dev/…
├── db/migrations/0001_init.sql …
├── packages/
│   ├── shared/src/           types, copy IDs, constants, validators — owned by both agents
│   ├── core/src/             account/, eas/, timelock/, tally/, api-client/, phase.ts, generator/
│   ├── api/src/              server handlers, database/session/timelock adapters, HTTP runtime
│   └── app/                  src/: screens, components, sim, three, portrait, audio, design; public/: assets
├── scripts/                  seed.ts, migrate.ts, register-schemas.ts
├── tests/                    unit/ sim/ api/ e2e/
├── vercel.json  vite.config.ts  tsconfig.json  package.json
```

**Two agents.** A owns `/src/core`, `/api`, `/db`, `/scripts`; B owns `/src/app` and `/public`. Both may edit `/src/shared` only through small, reviewed changes; the first two days produce it (§16). `docs/decisions.md` is append-only: date, decision, why, who — for every call not in the four documents. `AGENTS.md` carries the vocabulary table, the banned words, the "no innerHTML / no Date.now in logic / no new dependency without a decisions entry" rules, and the commands.

**Licence.** This is a for-profit product. `LICENSE` reads `Copyright © 2026 <holder>. All rights reserved.` followed by a short notice that the source is published for review and no rights to use, copy, modify or distribute are granted (PRD P12). The holder is **WEFA LLC**; the repository moves to the WEFA GitHub organisation, which changes nothing in the file. Consequence for dependencies: every runtime dependency must be permissively licensed (MIT, Apache-2.0, OFL are; a copyleft licence such as GPL or AGPL on the Shutter SDK would be a blocker for a proprietary product — **V1** now includes this check, and the fallback is to isolate the SDK behind the `Timelock` interface as a separately licensed module or to replace it).

## 13. Environments and configuration

| Variable | Dev | Rehearsal / October (production project) |
|---|---|---|
| `SHUTTER_MODE` | `mock` (default) or `chiado` | `mainnet` |
| `SHUTTER_API_BASE`, `SHUTTER_API_KEY` | Chiado URL when not mock | mainnet URL, key (**V2**) |
| `EAS_CHAIN_ID`, `EAS_ADDRESS`, `EAS_BALLOT_SCHEMA_UID`, `EAS_RESULT_SCHEMA_UID` | Base Sepolia | Base |
| `BASE_RPC_URL` (server verification), `VITE_BASE_RPC_URL` (client) | Sepolia public RPC | a provider key |
| `MAINNET_RPC_URL` | any | a provider key (ENS) |
| `DATABASE_URL` | Neon dev branch | Neon main |
| `SESSION_SECRET`, `MOCK_SECRET` | random | random; mock unused |
| `DEV_ENDPOINTS_ENABLED` | `1` | unset |
| `APP_ORIGIN` | `http://localhost:5173` | `https://crittercrumbs.app` |

**T8** — the rehearsal runs on the production configuration: mainnet Shutter, Base mainnet, `crittercrumbs.app`. The point of the rehearsal is the real path; Base gas is cents and the registration limit of five per day is ample. The rehearsal's fake feast also posts its public result on Base (**T13**), so the recording path is exercised before it matters.

## 14. Testing and development

| Layer | Tool | What |
|---|---|---|
| Unit | vitest | `tally` (§8 list), `phaseAt`, the generator (fixed seeds → fixed parameters, `GEN_VERSION` frozen), validators, canonical JSON, the sign-in message |
| Crypto | vitest | Mock timelock round-trip; EAS typed-data cross-check against the SDK (§7); UID stability |
| Sim | vitest, no DOM | Game Design §7.5: the pour, the wall, the feast timeline, the sound-event sequence, growth values — the world ticked with synthetic time |
| API | vitest against a Neon branch | Every phase gate with injected `now`; membership; the close record is produced once under concurrency; ballot verification rejects bad signatures, wrong feast, non-participants, late submissions |
| E2E | playwright, mock mode | One script: seed → sign in as N local accounts (viem `privateKeyToAccount`, no wallet UI) → statements → advance time → scatter → advance → release key → every client's `resultHash` equal → CSV downloaded |
| Rehearsal | people | Game Design §10 checklist on real phones |

**Seeding.** `scripts/seed.ts` (and `POST /api/dev/seed`) creates a burrow of eight fake critters from deterministic addresses, statements from `fixtures/statements.json`, a people feast and an options feast in any phase, with `POST /api/dev/time` setting a server-wide clock offset so deadlines can be crossed on demand. The same seed powers the rehearsal's fake critters and statements on the real deployment, with the dev endpoints disabled and the seed run once by script.

**Dev workflow.** `npm run dev` runs Vite and the functions locally (`vercel dev`), mock timelock, a Neon dev branch; `npm test`; `npm run e2e`; `npm run migrate`; `npm run seed`.

## 15. Edge and error states

For each: what the person sees (Design System copy IDs), what they can do, whether the feast can still complete. "Yes" means the rules still produce a result.

| # | State | Sees | Can do | Completes |
|---|---|---|---|---|
| E1 | Shutter unreachable at reveal | `feast.waiting.*`, then `err.keyUnreachable` after 20 s; the waiting screen keeps polling `/key` every 60 s | Wait; come back later. The client also tries Shutter directly (**V3**) | Yes, later. Keys are released once and recoverable after keyper downtime (Shutter docs) |
| E2 | Wallet rejects the signature mid-scatter | `scatter.sign.rejected`; the allocation stays in the DOM | Press *Scatter these* again | Yes |
| E3 | Network drops after pressing *Scatter these* | Before the POST resolves: `err.saveFailed` — allocation kept. After: the client re-reads the feast; until its UID appears: `err.saveUnverified`; then `err.saveVerified` / the done line | Retry; the same ballot resubmitted gets a new `seq` and the same effect | Yes |
| E4 | Someone not in the burrow opens the link | Arrival (F1) then `burrow.unknown.*` after connecting | Ask a member to add them; a member adds, they reload | Yes |
| E5 | Nobody scatters | Feast plays without a wave; `results.nobody`; CSV has zeros | Nothing to do; a new feast can be started | Yes, as an empty result |
| E6 | One person scatters | Normal; `results.one` | — | Yes |
| E7 | Exact tie | `results.tie` line; the table shares the line; CSV carries both | — | Yes |
| E8 | Gathering deadline arrives with two of eight statements | Scattering opens anyway (R13); empty cards show `read.noStatement` | The creator may have extended once beforehand; not after | Yes |
| E9 | WebGL unavailable or fails mid-session | Portraits; `fallback.initial` / `fallback.midSession` once; every control works (Design System §11) | *Try 3D again* once per session | Yes |
| E10 | Device clock wrong | Deadlines from `serverNow`; `err.clockSkew` once | Nothing needed | Yes |
| E11 | A UID missing from the published set | The client checks its own UIDs against the close record on every results load: `err.uidMissing` with the UID | Tell the burrow; the ballot exists in the store (signed) and the close record is immutable, so this is a bug or an outage to be reported, not silently absorbed | The feast completes for everyone else; the affected scatterer's ballot is provably theirs and the burrow decides |
| E12 | Same address submits twice | Both stored; the latest `seq` counts (T11); the done line reflects the latest | Change again until close | Yes |
| E13 | Shutter registration fails at open | `err.storeUnreachable` variant for open: the feast stays a draft | Retry *Open the feast*; the identity prefix is reused | Yes, once it succeeds |
| E14 | A ballot fails to decrypt or validate at tally | `results.unreadable` names the scatterer; they count as not having scattered (T7) | The scatterer can show their signed ballot; nothing else | Yes |
| E15 | Submission arrives after scattering closed | `scatter.closed`; the server rejects with the same id | Nothing; the last accepted ballot stands | Yes |
| E16 | Ballot from a non-participant (joined after freeze) | Server rejects `err.notParticipant` (new string) | Wait for the next feast | Yes |
| E17 | A member leaves during gathering | Removed from the feast; if a people feast drops below three at scattering open, status `void` and `feast.tooFew` (P11) | Start a new feast | The void case does not; every other case does |
| E18 | The creator leaves the burrow mid-feast | Nothing changes: the feast has no owner role beyond cancel/extend, which now nobody can do | — | Yes |
| E19 | Session expired | Silent re-sign-in prompt on the next write; reads of public content continue | Connect again | Yes |
| E20 | Base RPC down or poster has no gas when recording the result | `err.storeUnreachable` / the wallet's own error; the button stays | Any member can try later | Yes; the recording is optional to completion |
| E21 | Two members post the result at once | First recorded tx wins; the second sees `results.attest.done` on reload; a duplicate on-chain attestation is harmless | — | Yes |
| E22 | ENS RPC down | Addresses shown, `err.ensUnavailable` | — | Yes |
| E23 | Store down during gathering or scattering | `err.storeUnreachable`; typed statements and allocations stay in the DOM | Retry; the deadline does not move (only the single extension can, before it passes) | Yes if it returns before close; a store outage across the close is the one real risk, mitigated by Vercel + Neon availability and by the feast's deadlines being days, not minutes |
| E24 | Extension requested after the gathering deadline | Rejected: `gathering.extend` is hidden once `phaseAt` says scattering | — | Yes |
| E25 | Duplicate option names, zero options, crumbs out of bounds, deadline order | Inline form errors (`setup.*`) | Fix and resubmit | — |
| E26 | Two tabs, one scattering in each | Each submission gets its own `seq`; the latest counts; both tabs re-read and show the latest | — | Yes |
| E27 | Statement over 2,000 characters pasted | Truncated at the cap client-side; `gathering.limit`; the server rejects longer | — | Yes |
| E28 | Reveal opened before Shutter's timestamp on a fast clock | `feast.keyNotYet`; nothing decrypts | Wait | Yes |

New copy IDs introduced here (to be added to the Design System §10): `results.unreadable`, `err.notParticipant`, `err.feastCapacity` (“A feast can include at most 49 critters.”).

## 16. Build order to the rehearsal

Two agents, A (core) and B (app), from Wednesday 2026-09-03. Rehearsal-ready build on the production deployment by **Thursday 2026-09-25**; rehearsal the week of 2026-09-28; the October feast after fixes.

| Milestone | Date | A · core | B · app | Exit test |
|---|---|---|---|---|
| **M0 shared** | Sep 3–4 | `/src/shared` types, copy IDs, `feel.ts`, `phaseAt`, canonical JSON; repo, CI, Neon, Vercel project; `LICENSE` placeholder | Tokens, portrait generator (`GEN_VERSION 1`), app shell, routing, DOM components without data | `npm test` green on the generator and `phaseAt` |
| **M1 identity + burrow** | Sep 5–8 | Sessions, EIP-6963 account, ENS, burrows API, migrations, seed | Arrive, connect, meet your critter, home, burrow screens | E2E: sign in with two local accounts, create a burrow, add, join, leave |
| **M2 feast lifecycle** | Sep 9–11 | Feast API, phase gates, statements, freeze, close record, mock timelock, **tally with its full test list** | Setup form, gathering, deadline strip, read pass | E2E: lifecycle in mock mode to a close record; tally tests green |
| **M3 scatter** | Sep 12–15 | Ballot signing (viem) + SDK cross-check test, ballot API, ciphertext round-trip in mock | Koota world, scatter pass, heap, hop, tap-and-hold, number field, done state, participation | E2E: N accounts scatter, resubmit, close, reveal, equal `resultHash` |
| **M4 real Shutter** | Sep 16–17 | Chiado registration, key fetch + cache, direct fallback; result attestation on Base Sepolia; schemas registered | Results, CSV, giver matrix, record-on-chain flow | A feast on Chiado + Base Sepolia end to end, real key release |
| **M5 the feel** | Sep 18–22 | Edge states E1–E28 wired to copy; headers; security pass | 3D chunk behind portraits (drei `View`), critter meshes, lights, feast sequence, sound tokens, toggles, reduced motion, Simple view switch | Game Design §10 checklist on two phones; Lighthouse a11y ≥ 95 |
| **M6 freeze** | Sep 23–25 | Production config (mainnet Shutter, Base), schemas on Base, seed the rehearsal feast, monitoring of function errors (no telemetry beyond errors) | Bug fixes only; copy review against the banned list | Rehearsal-ready on the real domain |
| **Rehearsal** | Sep 28 – Oct 2 | The real people, fake critters and statements, both feast types | | The checklist, S1–S4 on the fake feast |

**Cut line (PRD P5), applied to this plan.** If M3 slips, M5's 3D and audio are the flex: the rehearsal can run on portraits with effects only; the feast sequence degrades to the Simple-view stagger. Nothing in M1–M4 or in E1–E28 is cut. The order is deliberately trust chain first (M2–M4), feel last (M5).

## 17. Performance and loading

- **Chunks.** App shell (React, screens, Koota, portraits, tokens) ≤ 120 KB gzipped; `three` chunk (three + fiber + the drei imports used) ≤ 250 KB gzipped, loaded by `import()` only from the scatter grid and results (Design System D6), from a single entry module to avoid Safari's simultaneous-import pitfall with top-level `await`; `crypto` chunk (shutter-sdk + viem's signing) loaded when scattering opens and again at reveal. Budgets are enforced in CI by `vite build` size checks.
- **Render loop.** R3F `frameloop` switches per Game Design §6; the canvas pauses when the grid leaves the viewport (`IntersectionObserver`, with `content-visibility` where supported) and when the tab is hidden.
- **Reveal work.** Decrypting and validating ten ballots is milliseconds; still, the loop yields between ballots (`scheduler.yield()` with a `setTimeout` fallback) so the waiting screen stays responsive on the device floor.
- **Caching.** Static assets immutable with hashed names; API responses `Cache-Control: no-store` except `GET /feasts/:id` for public feasts after close (`public, max-age=60`).

## 18. Verify before building on it

| # | Claim to verify | Where it matters |
|---|---|---|
| V1 | `@shutter-network/shutter-sdk`: exact exports, WASM requirement, gzipped size, and **its licence must be permissive** (a copyleft licence blocks a proprietary product; see §12) | §6, §11, §12, CSP |
| V2 | Shutter API: key/plan needed for `register_identity`, gas coverage on mainnet, identity derivation with the API as registrant, exact rate limits per key vs per IP | §6 |
| V3 | Shutter API CORS for the browser fallback | E1 |
| V4 | EAS off-chain UID preimage and the domain version for off-chain v2; cross-check test | §7 |
| V5 | Koota `useTrait` on world traits (else a dedicated entity, Game Design §7.2) | sim |
| V6 | Neon serverless driver behaviour on Vercel's Node runtime (HTTP mode, no pooling needed) | §10 |
| V7 | drei `View` cost with ten stages on the device floor; fallback is one orthographic camera with pixel-mapped positions | Design System D7 |

## 19. Decisions and open questions

| # | Decision | Why |
|---|---|---|
| T1 | Neon Postgres via the Vercel Marketplace; plain SQL; no Blob in v0 | Relational, retained indefinitely, sub-KB ciphertexts; Vercel KV/Postgres no longer exist |
| T2 | Base is the EAS chain (ballot domain and on-chain results); Gnosis stays Shutter's registry | EAS is not on Gnosis; nobody in the burrow touches Gnosis |
| T3 | The server triggers Shutter registration through the API at feast open; no `eas-sdk` at runtime, viem signs ballots; the SDK is a dev-only cross-check | No scatterer transactions; no ethers |
| T4 | The server is the trusted timestamp (`serverNow`); it caches the decryption key once | Rate limits and one source of time |
| T5 | EIP-6963 + viem behind the `Account` interface; no connector library | Brief; v1 embedded wallets are one provider |
| T6 | Stateless HMAC session cookie after an EIP-191 sign-in | No sessions table; leaving needs no revocation |
| T7 | Latest `seq` wins; an invalid latest ballot counts as not scattered, no fallback | Deterministic and legible; the client never produces one |
| T8 | The rehearsal runs on the production configuration | It rehearses the real path |
| T9 | A 60-line fetch cache instead of a query library | Dependency rule |
| T10 | Result schema carries target ids, owners and crumbs as arrays | A v1 custody contract can consume it |
| T11 | Server-assigned `seq` per feast orders ballots; it is part of the published set | Client clocks cannot order anything |
| T12 | Off-chain attestations use the SDK's domain (`EAS Attestation`, `0.26`, Base) verbatim | Interoperable with EAS tooling and explorers |
| T13 | The rehearsal feast posts its public result on Base | Exercises the recording path for cents before it matters |
| T14 | The project account holds the Shutter API key in the Vercel environment; default tier first, paid plan only if V2 requires it; a funded Gnosis wallet is the fallback design only | One secret, one owner, no client exposure |

| # | Question | Resolution (2026-09-02) |
|---|---|---|
| TQ1 | The production domain | `crittercrumbs.app` |
| TQ2 | Shutter API key or plan and who holds it | T14 |
| TQ3 | EAS chain | Base, confirmed |
| TQ4 | The `LICENSE` holder (PRD Q9) | WEFA LLC; a for-profit product; the repo lives at `wefa-labs/critter-crumbs` |
| TQ5 | Rehearsal posts a public result on Base | Yes, T13 |
