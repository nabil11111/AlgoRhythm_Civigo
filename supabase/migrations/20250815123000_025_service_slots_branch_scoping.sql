BEGIN;

-- Add branch_id to service_slots (nullable initial phase)
alter table if exists public.service_slots
  add column if not exists branch_id uuid references public.branches(id) on delete cascade;

-- Ensure a default branch per department (code: 'main')
insert into public.branches (department_id, code, name)
select d.id, 'main', 'Main Branch'
from public.departments d
where not exists (
  select 1 from public.branches b where b.department_id = d.id
);

-- Backfill service_slots.branch_id to department's default branch
update public.service_slots sl
set branch_id = b.id
from public.services s
join public.branches b on b.department_id = s.department_id and b.code = 'main'
where sl.service_id = s.id and sl.branch_id is null;

-- Enforce NOT NULL and constraints
alter table if exists public.service_slots alter column branch_id set not null;
do $$ begin
  alter table public.service_slots add constraint uq_service_slots unique (service_id, branch_id, slot_at);
exception when duplicate_object then null; end $$;

create index if not exists idx_service_slots_branch_id on public.service_slots(branch_id);
create index if not exists idx_service_slots_svc_branch_slot on public.service_slots(service_id, branch_id, slot_at);

-- Update RLS policies on service_slots for officer and citizen reads
alter table if exists public.service_slots enable row level security;

-- Officer policies: drop and recreate with branch.department check
drop policy if exists service_slots_officer_select on public.service_slots;
create policy service_slots_officer_select on public.service_slots
for select using (
  exists (
    select 1
    from public.services s
    join public.branches b on b.id = public.service_slots.branch_id
    join public.officer_assignments oa on oa.department_id = s.department_id and oa.officer_id = auth.uid() and oa.active
    where s.id = public.service_slots.service_id
      and b.department_id = s.department_id
  )
);

drop policy if exists service_slots_officer_insert on public.service_slots;
create policy service_slots_officer_insert on public.service_slots
for insert with check (
  exists (
    select 1
    from public.services s
    join public.branches b on b.id = public.service_slots.branch_id
    join public.officer_assignments oa on oa.department_id = s.department_id and oa.officer_id = auth.uid() and oa.active
    where s.id = public.service_slots.service_id
      and b.department_id = s.department_id
  )
);

drop policy if exists service_slots_officer_update on public.service_slots;
create policy service_slots_officer_update on public.service_slots
for update using (
  exists (
    select 1
    from public.services s
    join public.branches b on b.id = public.service_slots.branch_id
    join public.officer_assignments oa on oa.department_id = s.department_id and oa.officer_id = auth.uid() and oa.active
    where s.id = public.service_slots.service_id
      and b.department_id = s.department_id
  )
) with check (
  exists (
    select 1
    from public.services s
    join public.branches b on b.id = public.service_slots.branch_id
    join public.officer_assignments oa on oa.department_id = s.department_id and oa.officer_id = auth.uid() and oa.active
    where s.id = public.service_slots.service_id
      and b.department_id = s.department_id
  )
);

drop policy if exists service_slots_officer_delete on public.service_slots;
create policy service_slots_officer_delete on public.service_slots
for delete using (
  exists (
    select 1
    from public.services s
    join public.branches b on b.id = public.service_slots.branch_id
    join public.officer_assignments oa on oa.department_id = s.department_id and oa.officer_id = auth.uid() and oa.active
    where s.id = public.service_slots.service_id
      and b.department_id = s.department_id
  )
);

-- Citizen read policy: must be active/future and enabled for branch
drop policy if exists service_slots_citizen_select on public.service_slots;
create policy service_slots_citizen_select on public.service_slots
for select to authenticated using (
  public.service_slots.active = true
  and public.service_slots.slot_at >= now()
  and exists (
    select 1 from public.service_branch_settings sbs
    where sbs.service_id = public.service_slots.service_id
      and sbs.branch_id = public.service_slots.branch_id
      and sbs.enabled = true
  )
);

COMMIT;



