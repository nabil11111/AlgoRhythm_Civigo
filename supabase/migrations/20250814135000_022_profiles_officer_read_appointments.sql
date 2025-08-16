BEGIN;

-- Allow officers to read minimal citizen profile rows when an appointment
-- exists in a service within their active department assignment scope.
-- Read-only; admin already has broader access.

drop policy if exists profiles_officer_read_appointments on public.profiles;
create policy profiles_officer_read_appointments on public.profiles
for select using (
  exists (
    select 1 from public.appointments ap
    join public.services s on s.id = ap.service_id
    join public.officer_assignments oa
      on oa.department_id = s.department_id
     and oa.officer_id = auth.uid()
     and oa.active = true
    where ap.citizen_id = public.profiles.id
  ) or public.current_app_role() = 'admin'
);

COMMIT;




