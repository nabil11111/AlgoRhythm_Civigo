BEGIN;

-- Add gov_id columns to appointments and documents
do $$ begin
  alter table public.appointments add column if not exists citizen_gov_id text;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table public.documents add column if not exists owner_gov_id text;
exception when duplicate_column then null; end $$;

-- Indexes for new columns
create index if not exists idx_appointments_citizen_gov_id on public.appointments(citizen_gov_id);
create index if not exists idx_documents_owner_gov_id on public.documents(owner_gov_id);

COMMIT;


