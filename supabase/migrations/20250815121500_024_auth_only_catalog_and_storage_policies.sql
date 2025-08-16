BEGIN;

-- Restrict catalog browsing to authenticated users (drop public read)
alter table if exists public.departments enable row level security;
drop policy if exists departments_public_select on public.departments;
drop policy if exists departments_auth_select on public.departments;
create policy departments_auth_select on public.departments
for select to authenticated using (true);

alter table if exists public.services enable row level security;
drop policy if exists services_public_select on public.services;
drop policy if exists services_auth_select on public.services;
create policy services_auth_select on public.services
for select to authenticated using (true);

-- Branches select to authenticated only (replacing public browse)
alter table if exists public.branches enable row level security;
drop policy if exists branches_public_select on public.branches;
drop policy if exists branches_auth_select on public.branches;
create policy branches_auth_select on public.branches
for select to authenticated using (true);

-- Storage: bucket 'departments' is private; define policies
-- ensure bucket exists and is private
insert into storage.buckets (id, name, public)
values ('departments','departments', false)
on conflict (id) do nothing;
update storage.buckets set public=false where id='departments';

-- read: authenticated users can read files in this bucket
drop policy if exists "departments auth read" on storage.objects;
create policy "departments auth read" on storage.objects
for select to authenticated using (
  bucket_id = 'departments'
);

-- write logos: officers/admins limited by department (logos/{deptId}/...)
drop policy if exists "departments officers write logos" on storage.objects;
create policy "departments officers write logos" on storage.objects
for insert to authenticated with check (
  bucket_id = 'departments'
  and (storage.foldername(name))[1] = 'logos'
  and exists (
    select 1 from public.officer_assignments oa
    where oa.officer_id = auth.uid()
      and oa.active
      and oa.department_id = ((storage.foldername(name))[2])::uuid
  )
);

-- write files (flat files/ path)
drop policy if exists "departments officers write files" on storage.objects;
create policy "departments officers write files" on storage.objects
for insert to authenticated with check (
  bucket_id = 'departments'
  and (storage.foldername(name))[1] = 'files'
  and exists (
    select 1 from public.officer_assignments oa
    where oa.officer_id = auth.uid()
      and oa.active
  )
);

-- admin all in departments bucket
drop policy if exists "departments admin all" on storage.objects;
create policy "departments admin all" on storage.objects
for all using (bucket_id='departments' and public.current_app_role()='admin')
with check (bucket_id='departments' and public.current_app_role()='admin');

-- allow deletes for officers/admins within departments bucket (files/logos flat structure)
drop policy if exists "departments officers delete" on storage.objects;
create policy "departments officers delete" on storage.objects
for delete to authenticated using (
  bucket_id = 'departments'
  and (
    public.current_app_role() = 'admin' or exists (
      select 1 from public.officer_assignments oa where oa.officer_id = auth.uid() and oa.active
    )
  )
);

COMMIT;



