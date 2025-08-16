BEGIN;

-- Ensure upsert/replace semantics by making user_temp_id unique
create unique index if not exists ux_phone_verifications_user_temp
  on public.phone_verifications(user_temp_id);

COMMIT;


