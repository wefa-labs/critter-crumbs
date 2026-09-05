create table profiles (
  address        text primary key,          -- lowercase 0x…
  variant        smallint not null default 0 check (variant between 0 and 4),
  rerolls_used   smallint not null default 0 check (rerolls_used between 0 and 4),
  ens_name       text,
  ens_checked_at timestamptz,
  display_name   text,                       -- used when no ENS name
  created_at     timestamptz not null default now()
);

create table burrows (
  id             uuid primary key,
  revision       bigint not null default 0,
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
  individual_open      boolean not null,                       -- must be false when aggregate_public is false
  status               feast_status not null default 'draft',
  opened_at            timestamptz,
  cancelled_at         timestamptz,
  -- Shutter (set at open)
  shutter_identity_prefix bytea, shutter_identity bytea, shutter_eon integer, shutter_eon_key bytea,
  shutter_tx_hash      text, shutter_decryption_key bytea,     -- key cached after release
  -- close record (set once, by the first request after scattering_ends_at)
  participants_frozen_at timestamptz, close_record jsonb,
  closed_at            timestamptz, published_set_hash bytea,
  check (gathering_ends_at < scattering_ends_at),
  check (aggregate_public or not individual_open)
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
  uid            bytea not null,                        -- EAS off-chain UID
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

-- Ephemeral sign-in challenges; sessions themselves are stateless.
create table sign_in_nonces (nonce text primary key, issued_at timestamptz not null, expires_at timestamptz not null);
create index ballots_uid_lookup on ballots(uid);
create index feasts_burrow on feasts(burrow_id);
create index burrow_members_address on burrow_members(address);
