-- Durable, non-secret recovery context. RPC credentials stay in server configuration.
alter table feasts add column shutter_registration_state jsonb;
