-- The app only ever needs one saved (default) delivery address per account —
-- a unique constraint lets the client `upsert` by profile_id instead of
-- hand-rolling select-then-insert-or-update logic.
alter table public.addresses add constraint addresses_profile_id_unique unique (profile_id);
