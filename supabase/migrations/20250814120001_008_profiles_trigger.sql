BEGIN;

-- Create a profile row whenever a new auth user is created
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, coalesce((new.raw_user_meta_data->>'role')::text, 'citizen'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- Backfill for existing auth users missing a profile
insert into public.profiles (id, email, role)
select u.id, u.email, 'citizen'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- RLS: allow self-insert for profiles (safe if we ever create from the app)
drop policy if exists profiles_self_insert on public.profiles;
create policy profiles_self_insert on public.profiles
for insert with check (id = auth.uid());

COMMIT;


