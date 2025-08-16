BEGIN;

-- Rollback notes:
-- - Drop columns added to departments/services if reverting.
-- - Drop service_branch_settings and branches tables after removing FKs/policies.

-- 1) branches
create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  code text not null,
  name text not null,
  address text,
  location_lat double precision,
  location_lng double precision,
  meta jsonb,
  created_at timestamptz not null default now(),
  unique (department_id, code)
);
create index if not exists idx_branches_department on public.branches(department_id);
alter table if exists public.branches enable row level security;

-- Policies for branches
drop policy if exists branches_public_select on public.branches;
create policy branches_public_select on public.branches for select using (true);
drop policy if exists branches_admin_all on public.branches;
create policy branches_admin_all on public.branches
for all using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');
drop policy if exists branches_officer_write on public.branches;
create policy branches_officer_write on public.branches
for all using (
  exists (
    select 1 from public.officer_assignments oa
    where oa.department_id = public.branches.department_id
      and oa.officer_id = auth.uid()
      and oa.active
  )
) with check (
  exists (
    select 1 from public.officer_assignments oa
    where oa.department_id = public.branches.department_id
      and oa.officer_id = auth.uid()
      and oa.active
  )
);

-- 2) service_branch_settings (per-branch enable/disable for services)
create table if not exists public.service_branch_settings (
  service_id uuid not null references public.services(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (service_id, branch_id)
);
create index if not exists idx_sbs_branch on public.service_branch_settings(branch_id);
alter table if exists public.service_branch_settings enable row level security;

-- Policies for service_branch_settings
drop policy if exists sbs_public_select on public.service_branch_settings;
create policy sbs_public_select on public.service_branch_settings for select using (true);
drop policy if exists sbs_admin_all on public.service_branch_settings;
create policy sbs_admin_all on public.service_branch_settings
for all using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');
drop policy if exists sbs_officer_write on public.service_branch_settings;
create policy sbs_officer_write on public.service_branch_settings
for all using (
  exists (
    select 1 from public.services s
    join public.branches b on b.id = public.service_branch_settings.branch_id
    join public.officer_assignments oa on oa.department_id = s.department_id and oa.officer_id = auth.uid() and oa.active
    where s.id = public.service_branch_settings.service_id
      and b.department_id = s.department_id
  )
) with check (
  exists (
    select 1 from public.services s
    join public.branches b on b.id = public.service_branch_settings.branch_id
    join public.officer_assignments oa on oa.department_id = s.department_id and oa.officer_id = auth.uid() and oa.active
    where s.id = public.service_branch_settings.service_id
      and b.department_id = s.department_id
  )
);

-- 3) Presentation/instructions columns
alter table if exists public.departments add column if not exists logo_path text;
alter table if exists public.departments add column if not exists description_richtext jsonb not null default '{}'::jsonb;
alter table if exists public.departments add column if not exists description_updated_at timestamptz;

alter table if exists public.services add column if not exists instructions_richtext jsonb not null default '{}'::jsonb;
alter table if exists public.services add column if not exists instructions_pdf_path text;
alter table if exists public.services add column if not exists instructions_updated_at timestamptz;

COMMIT;



