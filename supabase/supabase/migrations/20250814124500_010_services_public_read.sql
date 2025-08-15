BEGIN;

-- Allow public/citizen read access to services for browsing in the citizen app.
-- Services contain non-sensitive catalog data and should be readable by all roles.
-- This complements officer/admin policies and preserves SSR + RLS-only access patterns.

-- Ensure RLS is enabled (already enabled by prior migration, but safe to include)
alter table if exists public.services enable row level security;

-- Public read policy (covers anon/authenticated/admin/officer/citizen)
drop policy if exists services_public_select on public.services;
create policy services_public_select on public.services
for select
using (true);

COMMIT;


