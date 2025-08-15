-- Update storage policies for new file path formats
-- logos/logo-{dept-code}.{ext} and files/instructions-{service-name}.pdf

-- Update logo write policy to handle new format: logos/logo-{dept-code}.{ext}
drop policy if exists "departments officers write logos" on storage.objects;
create policy "departments officers write logos" on storage.objects
for insert to authenticated with check (
  bucket_id = 'departments'
  and (storage.foldername(name))[1] = 'logos'
  and exists (
    select 1 from public.officer_assignments oa
    join public.departments d on d.id = oa.department_id
    where oa.officer_id = auth.uid()
      and oa.active
      and (storage.filename(name)) like 'logo-' || d.code || '.%'
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
    join public.departments d on d.id = oa.department_id
    where oa.officer_id = auth.uid()
      and oa.active
      and (storage.filename(name)) like 'logo-' || d.code || '.%'
  )
);

-- Update file write policy to handle new format: files/instructions-{service-name}.pdf
drop policy if exists "departments officers write files" on storage.objects;
create policy "departments officers write files" on storage.objects
for insert to authenticated with check (
  bucket_id = 'departments'
  and (storage.foldername(name))[1] = 'files'
  and exists (
    select 1 from public.officer_assignments oa
    join public.services s on s.department_id = oa.department_id
    where oa.officer_id = auth.uid()
      and oa.active
      and (storage.filename(name)) like 'instructions-' || lower(replace(trim(s.name), ' ', '-')) || '.pdf'
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
    join public.services s on s.department_id = oa.department_id
    where oa.officer_id = auth.uid()
      and oa.active
      and (storage.filename(name)) like 'instructions-' || lower(replace(trim(s.name), ' ', '-')) || '.pdf'
  )
);

-- Delete policies remain unchanged as they check existing paths in the database
