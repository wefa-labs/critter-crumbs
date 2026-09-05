alter table profiles add column critter_locked boolean not null default false;
update profiles set critter_locked=true where rerolls_used=4;
