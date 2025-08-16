BEGIN;

-- Departments write policies (admin all; officer update in assigned department)
alter table if exists public.departments enable row level security;
drop policy if exists departments_admin_all on public.departments;
create policy departments_admin_all on public.departments
for all using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

drop policy if exists departments_officer_update on public.departments;
create policy departments_officer_update on public.departments
for update using (
  exists (
    select 1 from public.officer_assignments oa
    where oa.department_id = public.departments.id
      and oa.officer_id = auth.uid()
      and oa.active
  )
) with check (
  exists (
    select 1 from public.officer_assignments oa
    where oa.department_id = public.departments.id
      and oa.officer_id = auth.uid()
      and oa.active
  )
);

-- Seed service_branch_settings for all (service, branch same department) as enabled=true
insert into public.service_branch_settings (service_id, branch_id, enabled)
select s.id, b.id, true
from public.services s
join public.branches b on b.department_id = s.department_id
on conflict do nothing;

COMMIT;



