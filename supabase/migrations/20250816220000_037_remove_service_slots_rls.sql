BEGIN;

-- Remove all RLS policies for service_slots and disable RLS to allow reads/writes

-- Drop known policies (names from prior migrations)
DROP POLICY IF EXISTS service_slots_admin_all ON public.service_slots;
DROP POLICY IF EXISTS service_slots_officer_select ON public.service_slots;
DROP POLICY IF EXISTS service_slots_officer_insert ON public.service_slots;
DROP POLICY IF EXISTS service_slots_officer_update ON public.service_slots;
DROP POLICY IF EXISTS service_slots_officer_delete ON public.service_slots;
DROP POLICY IF EXISTS service_slots_citizen_select ON public.service_slots;

-- Finally, disable RLS on service_slots so policies are not required for access
ALTER TABLE IF EXISTS public.service_slots DISABLE ROW LEVEL SECURITY;

COMMIT;


