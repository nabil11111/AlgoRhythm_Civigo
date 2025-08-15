BEGIN;

-- profiles.gov_id and generator function (stub)
do $$ begin
  alter table public.profiles add column if not exists gov_id text unique;
exception when duplicate_column then null; end $$;

create unique index if not exists idx_profiles_gov_id_unique on public.profiles(gov_id);

-- Stub: generate_gov_id normalizes NIC into a canonical gov_id.
-- Old NIC format (9 digits + V/X): strip the trailing letter and keep digits.
-- New NIC format (12 digits): keep as-is.
create or replace function public.generate_gov_id(p_nic text)
returns text
language plpgsql
immutable
as $$
declare
  v text;
begin
  if p_nic is null then
    return null;
  end if;
  v := lower(regexp_replace(p_nic, '[^0-9vx]', '', 'g'));
  if v ~ '^[0-9]{9}[vx]$' then
    return substr(v, 1, 9);
  elsif v ~ '^[0-9]{12}$' then
    return v;
  else
    -- Unknown format; return null for now to allow server-side validation to handle.
    return null;
  end if;
end;
$$;

COMMIT;


