-- Fix storage policies for better compatibility
-- Simplified approach for logo and file uploads

-- Update logo write policy with simplified pattern matching
drop policy if exists "departments officers write logos" on storage.objects;
create policy "departments officers write logos" on storage.objects
for insert to authenticated with check (
  bucket_id = 'departments'
  and (storage.foldername(name))[1] = 'logos'
  and exists (
    select 1 from public.officer_assignments oa
    where oa.officer_id = auth.uid()
      and oa.active
      and oa.department_id::text = any(
        select d.id::text from public.departments d 
        where (storage.filename(name)) like 'logo-' || replace(trim(d.code), ' ', '-') || '.%'
      )
  )
);

-- Update logo update policy for upserts  
drop policy if exists "departments officers update logos" on storage.objects;
create policy "departments officers update logos" on storage.objects
for update to authenticated using (
  bucket_id = 'departments'
  and (storage.foldername(name))[1] = 'logos'
  and exists (
    select 1 from public.officer_assignments oa
    where oa.officer_id = auth.uid()
      and oa.active
      and oa.department_id::text = any(
        select d.id::text from public.departments d 
        where (storage.filename(name)) like 'logo-' || replace(trim(d.code), ' ', '-') || '.%'
      )
  )
);

-- Update file write policy with simplified pattern matching
drop policy if exists "departments officers write files" on storage.objects;
create policy "departments officers write files" on storage.objects
for insert to authenticated with check (
  bucket_id = 'departments'
  and (storage.foldername(name))[1] = 'files'
  and exists (
    select 1 from public.officer_assignments oa
    where oa.officer_id = auth.uid()
      and oa.active
      and oa.department_id = any(
        select s.department_id from public.services s 
        where (storage.filename(name)) like 'instructions-' || lower(replace(trim(s.name), ' ', '-')) || '.pdf'
      )
  )
);

-- Update file update policy for upserts
drop policy if exists "departments officers update files" on storage.objects;
create policy "departments officers update files" on storage.objects
for update to authenticated using (
  bucket_id = 'departments'
  and (storage.foldername(name))[1] = 'files'
  and exists (
    select 1 from public.officer_assignments oa
    where oa.officer_id = auth.uid()
      and oa.active
      and oa.department_id = any(
        select s.department_id from public.services s 
        where (storage.filename(name)) like 'instructions-' || lower(replace(trim(s.name), ' ', '-')) || '.pdf'
      )
  )
);
