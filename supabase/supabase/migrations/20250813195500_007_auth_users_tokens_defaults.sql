BEGIN;

-- Relax NOT NULL and set default empty strings on token fields to avoid
-- SQL errors during user lookup/token generation for SQL-created users.

ALTER TABLE auth.users
  ALTER COLUMN confirmation_token DROP NOT NULL,
  ALTER COLUMN confirmation_token SET DEFAULT '';

ALTER TABLE auth.users
  ALTER COLUMN recovery_token DROP NOT NULL,
  ALTER COLUMN recovery_token SET DEFAULT '';

ALTER TABLE auth.users
  ALTER COLUMN email_change_token_new DROP NOT NULL,
  ALTER COLUMN email_change_token_new SET DEFAULT '';

ALTER TABLE auth.users
  ALTER COLUMN email_change_token_current DROP NOT NULL,
  ALTER COLUMN email_change_token_current SET DEFAULT '';

ALTER TABLE auth.users
  ALTER COLUMN email_change DROP NOT NULL,
  ALTER COLUMN email_change SET DEFAULT '';

-- Timestamp column: drop NOT NULL; no string default
ALTER TABLE auth.users
  ALTER COLUMN email_change_sent_at DROP NOT NULL;

COMMIT;


