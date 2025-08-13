BEGIN;

-- Temporary onboarding identity verification artifacts
create table if not exists public.identity_verifications (
  id uuid primary key default gen_random_uuid(),
  user_temp_id uuid not null,
  nic text not null,
  nic_front_path text,
  nic_back_path text,
  face_capture_path text,
  status text not null default 'initiated' check (status in ('initiated','phone_verified','pending','approved','rejected')),
  score numeric,
  created_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz
);

create index if not exists idx_identity_verifications_user_temp_id on public.identity_verifications(user_temp_id);
create index if not exists idx_identity_verifications_status on public.identity_verifications(status);

-- OTP phone verification during onboarding
create table if not exists public.phone_verifications (
  id uuid primary key default gen_random_uuid(),
  user_temp_id uuid not null,
  phone text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  verified_at timestamptz
);

create index if not exists idx_phone_verifications_user_temp_id on public.phone_verifications(user_temp_id);
create index if not exists idx_phone_verifications_phone on public.phone_verifications(phone);

-- RLS enablement
alter table if exists public.identity_verifications enable row level security;
alter table if exists public.phone_verifications enable row level security;

-- Grants
grant select, insert, update, delete on public.identity_verifications to authenticated;
grant select, insert, update, delete on public.phone_verifications to authenticated;

-- Policies: owner (user_temp_id) can read/write their temp data; admin full; officers none
drop policy if exists idv_owner_rw on public.identity_verifications;
create policy idv_owner_rw on public.identity_verifications
for all using (user_temp_id = auth.uid()) with check (user_temp_id = auth.uid());

drop policy if exists idv_admin_all on public.identity_verifications;
create policy idv_admin_all on public.identity_verifications
for all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');

drop policy if exists phone_owner_rw on public.phone_verifications;
create policy phone_owner_rw on public.phone_verifications
for all using (user_temp_id = auth.uid()) with check (user_temp_id = auth.uid());

drop policy if exists phone_admin_read on public.phone_verifications;
create policy phone_admin_read on public.phone_verifications
for select using (public.current_app_role() = 'admin');

COMMIT;


