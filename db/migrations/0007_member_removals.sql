-- Each re-admission starts a distinct membership period. Repeated additions do not.
alter table burrow_members add column membership_version integer not null default 1 check (membership_version > 0);
create table member_removals (
  id uuid primary key,
  burrow_id uuid not null references burrows(id),
  sequence bigint not null,
  operation_id uuid not null,
  actor_address text not null references profiles(address),
  member_address text not null references profiles(address),
  membership_version integer not null check (membership_version > 0),
  actor_name text not null,
  member_name text not null,
  removed_at timestamptz not null,
  unique (burrow_id, actor_address, operation_id),
  unique (burrow_id, sequence),
  unique (burrow_id, member_address, membership_version)
);
