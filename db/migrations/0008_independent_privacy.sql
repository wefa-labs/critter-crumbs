-- PRD P14, approved 2026-09-17: preserve rows and all other constraints.
-- 0001 creates the deadline check first and the privacy check second.
alter table feasts drop constraint feasts_check1;
