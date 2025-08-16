BEGIN;

-- Departments (Sri Lanka)
insert into public.departments (code, name)
values
  ('IMMIG', 'Department of Immigration & Emigration'),
  ('DMT', 'Department of Motor Traffic'),
  ('DRP', 'Department for Registration of Persons')
on conflict (code) do update set name = excluded.name;

-- Branches for each department
with dept as (
  select id, code from public.departments where code in ('IMMIG','DMT','DRP')
), to_ins as (
  select d.id as department_id, bcode as code, bname as name, baddr as address
  from dept d
  join (
    values
      ('IMMIG','COL', 'Head Office - Colombo', 'Suhurupaya, Battaramulla'),
      ('IMMIG','KND', 'Regional Office - Kandy', 'Kandy'),
      ('DMT','WEH', 'Head Office - Werahera', 'Werahera'),
      ('DMT','GAM', 'District Office - Gampaha', 'Gampaha'),
      ('DRP','BAT', 'Head Office - Battaramulla', 'Suhurupaya, Battaramulla'),
      ('DRP','KUR', 'Regional Office - Kurunegala', 'Kurunegala')
  ) as b(dept_code, bcode, bname, baddr) on b.dept_code = d.code
)
insert into public.branches (department_id, code, name, address)
select department_id, code, name, address from to_ins
on conflict (department_id, code) do update set
  name = excluded.name,
  address = coalesce(excluded.address, public.branches.address);

-- Services under each department
with dept as (
  select id, code from public.departments where code in ('IMMIG','DMT','DRP')
)
insert into public.services (department_id, code, name)
select d.id, s.scode, s.sname
from (
  values
    ('IMMIG','PASSPORT_NEW','New Passport Application'),
    ('IMMIG','PASSPORT_RENEW','Passport Renewal'),
    ('DMT','DL_NEW','New Driving License'),
    ('DMT','DL_RENEW','Driving License Renewal'),
    ('DRP','NIC_NEW','New NIC Application'),
    ('DRP','NIC_DUP','Duplicate NIC')
) as s(dept_code, scode, sname)
join dept d on d.code = s.dept_code
on conflict (code) do update set
  name = excluded.name,
  department_id = excluded.department_id;

-- Enable services at all branches within the same department
insert into public.service_branch_settings (service_id, branch_id, enabled)
select s.id, b.id, true
from public.services s
join public.branches b on b.department_id = s.department_id
on conflict do nothing;

-- Fix auth trigger to not reference non-existent profiles.updated_at
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(
      (new.raw_user_meta_data->>'role')::text,
      (new.raw_app_meta_data->>'role')::text,
      'citizen'
    )
  )
  on conflict (id) do update set
    email = excluded.email,
    role = excluded.role;
  return new;
end;
$$;

-- Ensure trigger exists and points to the updated function
do $$
begin
  if exists (
    select 1 from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    where c.relname = 'users' and t.tgname = 'on_auth_user_created'
  ) then
    execute 'drop trigger on_auth_user_created on auth.users';
  end if;
  execute 'create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_auth_user()';
end $$;
/*

-- Users
-- Admin user from local dump: admin@civigo.local / 12345678
do $$
declare
  v_user_id uuid;
begin
  if not exists (select 1 from auth.users where email = 'admin@civigo.local') then
    insert into auth.users (
      id, email, encrypted_password, email_confirmed_at,
      raw_user_meta_data, raw_app_meta_data, aud
    )
    values (
      'a2272e1c-735e-4a88-a64a-80726d3dae3a',
      'admin@civigo.local',
      '$2a$06$4QfdS4QALeeLAf9GUaWAF.MsRiZML.zJKXFZAaLYvECT2CEIw2NyS',
      now(),
      jsonb_build_object('role','admin'),
      jsonb_build_object('provider','email','providers',array['email']),
      'authenticated'
    ) returning id into v_user_id;
  else
    select id into v_user_id from auth.users where email = 'admin@civigo.local';
    update auth.users
    set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role','admin')
    where id = v_user_id;
  end if;

  -- Ensure profile role stays in sync
  update public.profiles set role = 'admin' where id = v_user_id;
end$$;

-- Ensure identity for admin@civigo.local
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'admin@civigo.local';
  if v_user_id is not null and not exists (
    select 1 from auth.identities where user_id = v_user_id and provider = 'email'
  ) then
    insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id)
    values (
      v_user_id,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'admin@civigo.local', 'email_verified', false, 'phone_verified', false),
      'email',
      now(), now(), now(), gen_random_uuid()
    );
  end if;
end$$;

-- Officer user from local dump: officer@civigo.local / 12345678
do $$
declare
  v_user_id uuid;
  v_dept_id uuid;
begin
  if not exists (select 1 from auth.users where email = 'officer@civigo.local') then
    insert into auth.users (
      id, email, encrypted_password, email_confirmed_at,
      raw_user_meta_data, raw_app_meta_data, aud
    )
    values (
      '3439dcad-5243-4506-88cb-a0d8a4b7430d',
      'officer@civigo.local',
      '$2a$06$e9AzQYfQqM2MH1STNX5va.DY3C9XMUlEQkb9Jt4dCBC.vdnJe2zae',
      now(),
      jsonb_build_object('role','officer'),
      jsonb_build_object('provider','email','providers',array['email']),
      'authenticated'
    ) returning id into v_user_id;
  else
    select id into v_user_id from auth.users where email = 'officer@civigo.local';
    update auth.users
    set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role','officer')
    where id = v_user_id;
  end if;

  update public.profiles set role = 'officer' where id = v_user_id;

  -- Assign officer to Department of Motor Traffic (DMT)
  select id into v_dept_id from public.departments where code = 'DMT';
  insert into public.officer_assignments (officer_id, department_id, active)
  values (v_user_id, v_dept_id, true)
  on conflict (officer_id, department_id) do update set active = true;
end$$;

-- Ensure identity for officer@civigo.local
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'officer@civigo.local';
  if v_user_id is not null and not exists (
    select 1 from auth.identities where user_id = v_user_id and provider = 'email'
  ) then
    insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id)
    values (
      v_user_id,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'officer@civigo.local', 'email_verified', false, 'phone_verified', false),
      'email',
      now(), now(), now(), gen_random_uuid()
    );
  end if;
end$$;

-- Citizen user: citizen@civigo.local / 12345678, with a proper NIC
do $$
declare
  v_user_id uuid;
  v_nic text := '912345678V';
begin
  if not exists (select 1 from auth.users where email = 'citizen@civigo.local') then
    insert into auth.users (
      id, email, encrypted_password, email_confirmed_at,
      raw_user_meta_data, raw_app_meta_data, aud
    )
    values (
      gen_random_uuid(),
      'citizen@civigo.local',
      crypt('12345678', gen_salt('bf')),
      now(),
      jsonb_build_object('role','citizen'),
      jsonb_build_object('provider','email','providers',array['email']),
      'authenticated'
    ) returning id into v_user_id;
  else
    select id into v_user_id from auth.users where email = 'citizen@civigo.local';
    update auth.users
    set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role','citizen')
    where id = v_user_id;
  end if;

  update public.profiles
  set full_name = coalesce(full_name, 'Test Citizen'),
      nic = coalesce(nic, v_nic),
      gov_id = coalesce(gov_id, public.generate_gov_id(v_nic)),
      verified_status = coalesce(verified_status, 'approved')
  where id = v_user_id;
end$$;

-- Ensure identity for citizen@civigo.local
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'citizen@civigo.local';
  if v_user_id is not null and not exists (
    select 1 from auth.identities where user_id = v_user_id and provider = 'email'
  ) then
    insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id)
    values (
      v_user_id,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'citizen@civigo.local', 'email_verified', false, 'phone_verified', false),
      'email',
      now(), now(), now(), gen_random_uuid()
    );
  end if;
end$$;

-- Additional user from dump: test@civigo.local
do $$
declare
  v_user_id uuid;
begin
  if not exists (select 1 from auth.users where email = 'test@civigo.local') then
    insert into auth.users (
      id, email, encrypted_password, email_confirmed_at,
      raw_user_meta_data, raw_app_meta_data, aud
    )
    values (
      'fcc86e9a-bfa1-4b14-8ae8-ec6e3355cdb3',
      'test@civigo.local',
      '$2a$10$0tLa/ZtaVCzULWNvfffel.b0g/U271IkwfbdqAoNb0ys03l0WkONq',
      now(),
      jsonb_build_object('email_verified', true),
      jsonb_build_object('provider','email','providers',array['email']),
      'authenticated'
    ) returning id into v_user_id;
  else
    select id into v_user_id from auth.users where email = 'test@civigo.local';
    update auth.users
    set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('email_verified', true)
    where id = v_user_id;
  end if;
end$$;

-- Additional officer from dump: officer@civigo.com
do $$
declare
  v_user_id uuid;
begin
  if not exists (select 1 from auth.users where email = 'officer@civigo.com') then
    insert into auth.users (
      id, email, encrypted_password, email_confirmed_at,
      raw_user_meta_data, raw_app_meta_data, aud
    )
    values (
      '666717ca-6adf-4d77-a4c8-22e05e18ed45',
      'officer@civigo.com',
      '$2a$10$amxgBTZCjEUdjGI8WzI9bewREG6h9rkwxVEup/3tsTx02E1F1pq8e',
      now(),
      jsonb_build_object('role','officer','full_name','test officer','email_verified', true),
      jsonb_build_object('role','officer','provider','email','providers',array['email']),
      'authenticated'
    ) returning id into v_user_id;
  else
    select id into v_user_id from auth.users where email = 'officer@civigo.com';
    update auth.users
    set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role','officer','full_name','test officer','email_verified', true),
        raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role','officer')
    where id = v_user_id;
  end if;

  -- Ensure profile role is officer (trigger will set, but we enforce idempotently)
  update public.profiles set role = 'officer' where id = v_user_id;
end$$;

-- Ensure identity for test@civigo.local
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'test@civigo.local';
  if v_user_id is not null and not exists (
    select 1 from auth.identities where user_id = v_user_id and provider = 'email'
  ) then
    insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id)
    values (
      v_user_id,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'test@civigo.local', 'email_verified', false, 'phone_verified', false),
      'email',
      now(), now(), now(), gen_random_uuid()
    );
  end if;
end$$;

-- Ensure identity for officer@civigo.com
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'officer@civigo.com';
  if v_user_id is not null and not exists (
    select 1 from auth.identities where user_id = v_user_id and provider = 'email'
  ) then
    insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id)
    values (
      v_user_id,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'officer@civigo.com', 'email_verified', false, 'phone_verified', false),
      'email',
      now(), now(), now(), gen_random_uuid()
    );
  end if;
end$$;

*/
COMMIT;


