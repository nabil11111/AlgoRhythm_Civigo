BEGIN;

-- Ensure RLS is disabled and grant explicit privileges so anon/authenticated can read slots
ALTER TABLE IF EXISTS public.service_slots DISABLE ROW LEVEL SECURITY;

-- Lock down generic PUBLIC, then grant precise access to web roles
REVOKE ALL ON public.service_slots FROM PUBLIC;

-- Minimal needed permission for fetching time slots
GRANT SELECT ON public.service_slots TO anon, authenticated;

-- Optionally allow service_role (server-side tasks) to read as well
GRANT SELECT ON public.service_slots TO service_role;

COMMIT;


