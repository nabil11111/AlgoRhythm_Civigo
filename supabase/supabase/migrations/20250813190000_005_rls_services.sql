BEGIN;

-- Enable RLS on services
alter table if exists public.services enable row level security;

-- Admin full access policy (uses existing current_app_role())
drop policy if exists services_admin_all on public.services;
create policy services_admin_all on public.services
for all
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

-- Officer read policy: officer can read services within departments they are actively assigned to
drop policy if exists services_officer_read on public.services;
create policy services_officer_read on public.services
for select
using (
  exists (
    select 1 from public.officer_assignments oa
    where oa.department_id = public.services.department_id
      and oa.officer_id = auth.uid()
      and oa.active = true
  )
);

-- Officer insert policy: can create services only in assigned departments
drop policy if exists services_officer_insert on public.services;
create policy services_officer_insert on public.services
for insert
with check (
  exists (
    select 1 from public.officer_assignments oa
    where oa.department_id = public.services.department_id
      and oa.officer_id = auth.uid()
      and oa.active = true
  )
);

-- Officer update policy: can update services only in assigned departments
drop policy if exists services_officer_update on public.services;
create policy services_officer_update on public.services
for update
using (
  exists (
    select 1 from public.officer_assignments oa
    where oa.department_id = public.services.department_id
      and oa.officer_id = auth.uid()
      and oa.active = true
  )
)
with check (
  exists (
    select 1 from public.officer_assignments oa
    where oa.department_id = public.services.department_id
      and oa.officer_id = auth.uid()
      and oa.active = true
  )
);

-- Officer delete policy: can delete services only in assigned departments
drop policy if exists services_officer_delete on public.services;
create policy services_officer_delete on public.services
for delete
using (
  exists (
    select 1 from public.officer_assignments oa
    where oa.department_id = public.services.department_id
      and oa.officer_id = auth.uid()
      and oa.active = true
  )
);

COMMIT;


