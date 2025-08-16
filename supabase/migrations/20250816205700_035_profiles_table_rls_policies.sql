BEGIN;

-- Fix profiles table RLS policies to use current_user_role() instead of current_app_role()

-- Update profiles_admin_select policy
DROP POLICY IF EXISTS profiles_admin_select ON public.profiles;
CREATE POLICY profiles_admin_select ON public.profiles
FOR SELECT USING (public.current_user_role() = 'admin');

-- Update profiles_admin_update policy
DROP POLICY IF EXISTS profiles_admin_update ON public.profiles;
CREATE POLICY profiles_admin_update ON public.profiles
FOR UPDATE USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

-- Update profiles_self_select policy
DROP POLICY IF EXISTS profiles_self_select ON public.profiles;
CREATE POLICY profiles_self_select ON public.profiles
FOR SELECT USING (auth.uid() = id OR public.current_user_role() = 'admin');

-- Update profiles_officer_read_appointments policy
DROP POLICY IF EXISTS profiles_officer_read_appointments ON public.profiles;
CREATE POLICY profiles_officer_read_appointments ON public.profiles
FOR SELECT USING (
  (EXISTS (
    SELECT 1
    FROM ((appointments ap
      JOIN services s ON ((s.id = ap.service_id)))
      JOIN officer_assignments oa ON (((oa.department_id = s.department_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true))))
    WHERE (ap.citizen_id = profiles.id)
  )) OR (public.current_user_role() = 'admin')
);

COMMIT;
