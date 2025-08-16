BEGIN;

-- RLS hardening and officer restriction documentation
-- identity_verifications: owner read/write; admin full; officers none
-- phone_verifications: owner read/write; admin read; officers none
-- storage (nic-media): private; owner and admin read; officers never see facial captures

-- Recreate policies idempotently to ensure intent is applied

-- identity_verifications
alter table if exists public.identity_verifications enable row level security;

drop policy if exists idv_owner_rw on public.identity_verifications;
create policy idv_owner_rw on public.identity_verifications
for all using (user_temp_id = auth.uid()) with check (user_temp_id = auth.uid());

drop policy if exists idv_admin_all on public.identity_verifications;
create policy idv_admin_all on public.identity_verifications
for all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');

-- phone_verifications
alter table if exists public.phone_verifications enable row level security;

drop policy if exists phone_owner_rw on public.phone_verifications;
create policy phone_owner_rw on public.phone_verifications
for all using (user_temp_id = auth.uid()) with check (user_temp_id = auth.uid());

drop policy if exists phone_admin_read on public.phone_verifications;
create policy phone_admin_read on public.phone_verifications
for select using (public.current_app_role() = 'admin');

-- Storage nic-media: reinforce policies; officers have no explicit policies; admin allowed
-- NOTE: Facial captures are never exposed to officers. Any retrieval must be via server-generated signed GET URLs and only for owner/admin.
-- Policies were created previously; kept here as documentation.

COMMIT;


