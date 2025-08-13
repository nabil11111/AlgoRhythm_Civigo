BEGIN;

-- Log OTP send attempts for basic rate limiting
create table if not exists public.phone_verification_events (
  id uuid primary key default gen_random_uuid(),
  user_temp_id uuid not null,
  phone text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_phone_verification_events_user_temp_id on public.phone_verification_events(user_temp_id);
create index if not exists idx_phone_verification_events_phone_created_at on public.phone_verification_events(phone, created_at desc);

alter table if exists public.phone_verification_events enable row level security;

grant select, insert on public.phone_verification_events to authenticated;

drop policy if exists phone_events_owner_rw on public.phone_verification_events;
create policy phone_events_owner_rw on public.phone_verification_events
for select using (user_temp_id = auth.uid())
with check (user_temp_id = auth.uid());

drop policy if exists phone_events_admin_read on public.phone_verification_events;
create policy phone_events_admin_read on public.phone_verification_events
for select using (public.current_app_role() = 'admin');

COMMIT;


