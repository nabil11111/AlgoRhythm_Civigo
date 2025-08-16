BEGIN;

-- Fix the trigger to allow role specification in user_metadata when creating officers
-- Update the handle_new_auth_user trigger to check user_metadata for role

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check for role in user_metadata first, then app_metadata, then default to citizen
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::text,
      (NEW.raw_app_meta_data->>'role')::text,
      'citizen'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

COMMIT;
