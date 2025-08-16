BEGIN;

-- Fix storage bucket configuration for departments
-- Make the bucket public so department logos and instruction PDFs can be accessed

-- Ensure the departments bucket exists and is public
insert into storage.buckets (id, name, public)
values ('departments','departments', true)
on conflict (id) do update set public = true;

-- Create/recreate read policy for all users to access department files
drop policy if exists "departments public read" on storage.objects;
create policy "departments public read" on storage.objects
for select using (
  bucket_id = 'departments'
);

-- Also ensure authenticated users can read
drop policy if exists "departments auth read" on storage.objects;
create policy "departments auth read" on storage.objects
for select to authenticated using (
  bucket_id = 'departments'
);

COMMIT;
