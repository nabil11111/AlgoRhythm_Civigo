BEGIN;

-- Storage bucket for NIC media (private)
-- This uses Supabase Storage policies; bucket creation is idempotent in SQL using extension API if available.
-- If running locally, ensure the bucket is also created via CLI if needed.
insert into storage.buckets (id, name, public)
values ('nic-media', 'nic-media', false)
on conflict (id) do nothing;

-- Policies: owner access (path-based by user/{auth.uid()}/...) and admin full
-- NOTE: If you use front/back/captures folders without user prefix, prefer server-signed URLs for owner access.

drop policy if exists "nic-media owner read" on storage.objects;
create policy "nic-media owner read" on storage.objects
for select using (
  bucket_id = 'nic-media' and (
    (storage.foldername(name))[1] = 'user' and (storage.foldername(name))[2] = auth.uid()::text
  )
  or public.current_app_role() = 'admin'
);

drop policy if exists "nic-media owner insert" on storage.objects;
create policy "nic-media owner insert" on storage.objects
for insert with check (
  bucket_id = 'nic-media' and (
    (storage.foldername(name))[1] = 'user' and (storage.foldername(name))[2] = auth.uid()::text
  )
);

drop policy if exists "nic-media owner update" on storage.objects;
create policy "nic-media owner update" on storage.objects
for update using (
  bucket_id = 'nic-media' and (
    (storage.foldername(name))[1] = 'user' and (storage.foldername(name))[2] = auth.uid()::text
  )
);

drop policy if exists "nic-media admin all" on storage.objects;
create policy "nic-media admin all" on storage.objects
for all using (
  bucket_id = 'nic-media' and public.current_app_role() = 'admin'
) with check (
  bucket_id = 'nic-media' and public.current_app_role() = 'admin'
);

COMMIT;


