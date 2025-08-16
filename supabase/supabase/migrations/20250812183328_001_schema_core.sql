BEGIN;

-- Required for gen_random_uuid() and digest(..., 'sha256')
create extension if not exists pgcrypto;

-- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'citizen' check (role in ('citizen','officer','admin')),
  full_name text,
  email text unique,
  nic text unique,
  verified_status text default 'unverified',
  phone text,
  created_at timestamptz not null default now()
);

-- departments
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null
);

-- services
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  code text not null unique,
  name text not null
);

-- officer_assignments
create table if not exists public.officer_assignments (
  id uuid primary key default gen_random_uuid(),
  officer_id uuid not null references public.profiles(id) on delete cascade,
  department_id uuid not null references public.departments(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (officer_id, department_id)
);

-- appointments
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  citizen_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  assigned_officer_id uuid references public.profiles(id) on delete set null,
  appointment_at timestamptz not null,
  status text not null default 'booked' check (status in ('booked','cancelled','completed')),
  checked_in_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  no_show boolean not null default false,
  created_at timestamptz not null default now(),
  reference_code text generated always as (
    substr(md5((id)::text), 1, 10)
  ) stored,
  unique (reference_code)
);

-- appointment_feedback
create table if not exists public.appointment_feedback (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  media jsonb,
  created_at timestamptz not null default now()
);

-- notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  channel text not null check (channel in ('email','sms','inapp')),
  type text not null check (type in ('booking_confirmation','reminder','status_update')),
  status text not null default 'queued' check (status in ('queued','sent','failed')),
  sent_at timestamptz,
  payload jsonb,
  created_at timestamptz not null default now()
);

-- documents
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- appointment_documents
create table if not exists public.appointment_documents (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  unique (appointment_id, document_id)
);

-- Storage buckets
insert into storage.buckets (id, name, public)
values 
  ('nic-media', 'nic-media', false),
  ('departments', 'departments', false),
  ('feedback', 'feedback', false)
on conflict (id) do nothing;

COMMIT;

