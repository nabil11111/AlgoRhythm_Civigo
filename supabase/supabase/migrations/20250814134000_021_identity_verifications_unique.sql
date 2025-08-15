BEGIN;

-- Ensure one onboarding record per temp user id for idv
create unique index if not exists ux_identity_verifications_user_temp
  on public.identity_verifications(user_temp_id);

COMMIT;


