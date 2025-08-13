BEGIN;

-- Departments are a public catalog; allow public read to support browsing.
alter table if exists public.departments enable row level security;

drop policy if exists departments_public_select on public.departments;
create policy departments_public_select on public.departments
for select using (true);

COMMIT;


