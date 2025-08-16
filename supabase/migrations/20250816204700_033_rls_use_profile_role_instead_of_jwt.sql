BEGIN;

-- Fix RLS policies to check public.profiles.role instead of JWT app_metadata.role
-- This is more reliable and doesn't require JWT app_metadata setup

-- Helper function to get current user's role from profiles table
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'citizen'
  );
$$;

-- Update departments policies to use profile role instead of JWT role
DROP POLICY IF EXISTS departments_admin_all ON public.departments;
CREATE POLICY departments_admin_all ON public.departments
FOR ALL USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

-- Update services policies 
DROP POLICY IF EXISTS services_admin_all ON public.services;
CREATE POLICY services_admin_all ON public.services
FOR ALL USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

-- Update branches policies
DROP POLICY IF EXISTS branches_admin_all ON public.branches;
CREATE POLICY branches_admin_all ON public.branches
FOR ALL USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

-- Update service_branch_settings policies
DROP POLICY IF EXISTS service_branch_settings_admin_all ON public.service_branch_settings;
CREATE POLICY service_branch_settings_admin_all ON public.service_branch_settings
FOR ALL USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

-- Update service_slots policies
DROP POLICY IF EXISTS service_slots_admin_all ON public.service_slots;
CREATE POLICY service_slots_admin_all ON public.service_slots
FOR ALL USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

COMMIT;
