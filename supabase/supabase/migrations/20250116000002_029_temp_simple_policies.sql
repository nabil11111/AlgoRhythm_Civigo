-- Temporary simple policies for testing - more permissive
-- These can be tightened once we confirm the basic functionality works

-- Simple logo write policy - just check if user is an officer with active assignment
drop policy if exists "departments officers write logos" on storage.objects;
create policy "departments officers write logos" on storage.objects
for insert to authenticated with check (
  bucket_id = 'departments'
  and (storage.foldername(name))[1] = 'logos'
  and exists (
    select 1 from public.officer_assignments oa
    where oa.officer_id = auth.uid()
      and oa.active
  )
);

-- Simple logo update policy  
drop policy if exists "departments officers update logos" on storage.objects;
create policy "departments officers update logos" on storage.objects
for update to authenticated using (
  bucket_id = 'departments'
  and (storage.foldername(name))[1] = 'logos'
  and exists (
    select 1 from public.officer_assignments oa
    where oa.officer_id = auth.uid()
      and oa.active
  )
);

-- Simple file write policy
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

-- Simple file update policy
drop policy if exists "departments officers update files" on storage.objects;
create policy "departments officers update files" on storage.objects
for update to authenticated using (
  bucket_id = 'departments'
  and (storage.foldername(name))[1] = 'files'
  and exists (
    select 1 from public.officer_assignments oa
    where oa.officer_id = auth.uid()
      and oa.active
  )
);
