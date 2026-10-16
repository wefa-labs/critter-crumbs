-- Production identities used v1. Preserve their variants, locks and reroll counts.
alter table profiles add column generator_version text not null default '1';
alter table profiles add column renderer_version text not null default '1';
alter table profiles add constraint profiles_identity_versions
  check (generator_version in ('1','2') and renderer_version=generator_version);

alter table targets add column portrait_variant smallint not null default 0 check (portrait_variant between 0 and 4);
alter table targets add column generator_version text not null default '1';
alter table targets add column renderer_version text not null default '1';
alter table targets add column portrait_source text not null default 'legacy-baseline';
alter table targets add column portrait_captured_at timestamptz;
alter table targets add constraint targets_identity_versions
  check (generator_version in ('1','2') and renderer_version=generator_version);
alter table targets add constraint targets_portrait_source
  check ((portrait_source='legacy-baseline' and portrait_captured_at is null)
    or (portrait_source in ('creation','freeze') and portrait_captured_at is not null));

-- Earlier feast appearances were not saved. This is the current-known baseline,
-- not a reconstruction of the appearance at an earlier deadline.
update targets t set portrait_variant=p.variant,generator_version=p.generator_version,renderer_version=p.renderer_version
  from profiles p where t.owner_address=p.address;
