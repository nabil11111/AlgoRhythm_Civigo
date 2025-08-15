BEGIN;

-- service_slots table
create table if not exists public.service_slots (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  slot_at timestamptz not null,
  duration_minutes int not null default 15 check (duration_minutes between 5 and 240),
  capacity int not null default 1 check (capacity between 1 and 100),
  active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (service_id, slot_at)
);

-- indexes
create index if not exists idx_service_slots_service_id on public.service_slots(service_id);
create index if not exists idx_service_slots_slot_at_desc on public.service_slots(slot_at desc);
create index if not exists idx_service_slots_service_id_slot_at on public.service_slots(service_id, slot_at);

-- appointments linkage
do $$ begin
  alter table public.appointments add column if not exists slot_id uuid references public.service_slots(id) on delete set null;
exception when duplicate_column then null; end $$;

-- Enable RLS
alter table if exists public.service_slots enable row level security;

-- Admin full access
drop policy if exists service_slots_admin_all on public.service_slots;
create policy service_slots_admin_all on public.service_slots
for all using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

-- Officer SELECT policy (service belongs to officer's assigned department)
drop policy if exists service_slots_officer_select on public.service_slots;
create policy service_slots_officer_select on public.service_slots
for select using (
  exists (
    select 1 from public.services s
    join public.officer_assignments oa on oa.department_id = s.department_id
    where s.id = public.service_slots.service_id
      and oa.officer_id = auth.uid()
      and oa.active = true
  )
);

-- Officer INSERT policy
drop policy if exists service_slots_officer_insert on public.service_slots;
create policy service_slots_officer_insert on public.service_slots
for insert with check (
  exists (
    select 1 from public.services s
    join public.officer_assignments oa on oa.department_id = s.department_id
    where s.id = public.service_slots.service_id
      and oa.officer_id = auth.uid()
      and oa.active = true
  )
);

-- Officer UPDATE policy
drop policy if exists service_slots_officer_update on public.service_slots;
create policy service_slots_officer_update on public.service_slots
for update using (
  exists (
    select 1 from public.services s
    join public.officer_assignments oa on oa.department_id = s.department_id
    where s.id = public.service_slots.service_id
      and oa.officer_id = auth.uid()
      and oa.active = true
  )
)
with check (
  exists (
    select 1 from public.services s
    join public.officer_assignments oa on oa.department_id = s.department_id
    where s.id = public.service_slots.service_id
      and oa.officer_id = auth.uid()
      and oa.active = true
  )
);

-- Officer DELETE policy
drop policy if exists service_slots_officer_delete on public.service_slots;
create policy service_slots_officer_delete on public.service_slots
for delete using (
  exists (
    select 1 from public.services s
    join public.officer_assignments oa on oa.department_id = s.department_id
    where s.id = public.service_slots.service_id
      and oa.officer_id = auth.uid()
      and oa.active = true
  )
);

COMMIT;


