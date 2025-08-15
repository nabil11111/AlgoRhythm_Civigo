BEGIN;

-- Enable RLS
alter table if exists public.profiles enable row level security;
alter table if exists public.officer_assignments enable row level security;
alter table if exists public.appointments enable row level security;
alter table if exists public.appointment_feedback enable row level security;
alter table if exists public.notifications enable row level security;
alter table if exists public.documents enable row level security;
alter table if exists public.appointment_documents enable row level security;

-- Departments and services are readable by all; keep RLS disabled for them
-- (no edits here)

-- Grants: allow anon/authenticated to read open catalogs; allow authenticated to operate on protected tables (RLS gates rows)
grant usage on schema public to anon, authenticated;
grant select on public.departments to anon, authenticated;
grant select on public.services to anon, authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.officer_assignments to authenticated;
grant select, insert, update, delete on public.appointments to authenticated;
grant select, insert, update, delete on public.appointment_feedback to authenticated;
grant select, insert, update, delete on public.notifications to authenticated;
grant select, insert, update, delete on public.documents to authenticated;
grant select, insert, update, delete on public.appointment_documents to authenticated;

-- Helper: function to extract role claim from JWT (text)
create or replace function public.current_app_role()
returns text language sql stable as $$
  select coalesce(current_setting('request.jwt.claims', true)::jsonb->>'role', 'citizen');
$$;

-- profiles policies
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
for select using (auth.uid() = id or public.current_app_role() = 'admin');

drop policy if exists profiles_admin_select on public.profiles;
create policy profiles_admin_select on public.profiles
for select using (public.current_app_role() = 'admin');

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles
for update using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');

-- officer_assignments policies
drop policy if exists officer_assignments_self_select on public.officer_assignments;
create policy officer_assignments_self_select on public.officer_assignments
for select using (
  officer_id = auth.uid() or public.current_app_role() = 'admin'
);

drop policy if exists officer_assignments_admin_all on public.officer_assignments;
create policy officer_assignments_admin_all on public.officer_assignments
for all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');

-- appointments policies
drop policy if exists appointments_citizen_select on public.appointments;
create policy appointments_citizen_select on public.appointments
for select using (citizen_id = auth.uid());

drop policy if exists appointments_citizen_insert on public.appointments;
create policy appointments_citizen_insert on public.appointments
for insert with check (citizen_id = auth.uid());

drop policy if exists appointments_citizen_update on public.appointments;
create policy appointments_citizen_update on public.appointments
for update using (citizen_id = auth.uid()) with check (citizen_id = auth.uid());

drop policy if exists appointments_officer_read on public.appointments;
create policy appointments_officer_read on public.appointments
for select using (
  exists (
    select 1 from public.services s
    join public.departments d on d.id = s.department_id
    join public.officer_assignments oa on oa.department_id = d.id
    where s.id = public.appointments.service_id
      and oa.officer_id = auth.uid()
      and oa.active = true
  ) or public.current_app_role() = 'admin'
);

drop policy if exists appointments_officer_update on public.appointments;
create policy appointments_officer_update on public.appointments
for update using (
  exists (
    select 1 from public.services s
    join public.departments d on d.id = s.department_id
    join public.officer_assignments oa on oa.department_id = d.id
    where s.id = public.appointments.service_id
      and oa.officer_id = auth.uid()
      and oa.active = true
  ) or public.current_app_role() = 'admin'
) with check (
  exists (
    select 1 from public.services s
    join public.departments d on d.id = s.department_id
    join public.officer_assignments oa on oa.department_id = d.id
    where s.id = public.appointments.service_id
      and oa.officer_id = auth.uid()
      and oa.active = true
  ) or public.current_app_role() = 'admin'
);

drop policy if exists appointments_admin_all on public.appointments;
create policy appointments_admin_all on public.appointments
for all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');

-- appointment_feedback policies
drop policy if exists feedback_citizen_rw on public.appointment_feedback;
create policy feedback_citizen_rw on public.appointment_feedback
for all using (
  exists (
    select 1 from public.appointments a
    where a.id = appointment_id and a.citizen_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.appointments a
    where a.id = appointment_id and a.citizen_id = auth.uid()
  )
);

drop policy if exists feedback_officer_read on public.appointment_feedback;
create policy feedback_officer_read on public.appointment_feedback
for select using (
  exists (
    select 1 from public.appointments ap
    join public.services s on s.id = ap.service_id
    join public.officer_assignments oa on oa.department_id = s.department_id and oa.officer_id = auth.uid() and oa.active = true
    where ap.id = appointment_id
  ) or public.current_app_role() = 'admin'
);

-- notifications policies
drop policy if exists notifications_user_select on public.notifications;
create policy notifications_user_select on public.notifications
for select using (user_id = auth.uid() or public.current_app_role() = 'admin');

drop policy if exists notifications_admin_select on public.notifications;
create policy notifications_admin_select on public.notifications
for select using (public.current_app_role() = 'admin');

-- documents policies
drop policy if exists documents_owner_select on public.documents;
create policy documents_owner_select on public.documents
for select using (owner_user_id = auth.uid());

drop policy if exists documents_owner_insert on public.documents;
create policy documents_owner_insert on public.documents
for insert with check (owner_user_id = auth.uid());

drop policy if exists documents_owner_update on public.documents;
create policy documents_owner_update on public.documents
for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

drop policy if exists documents_admin_all on public.documents;
create policy documents_admin_all on public.documents
for all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');

drop policy if exists documents_officer_read_scope on public.documents;
create policy documents_officer_read_scope on public.documents
for select using (
  exists (
    select 1 from public.appointment_documents ad
    join public.appointments ap on ap.id = ad.appointment_id
    join public.services s on s.id = ap.service_id
    join public.officer_assignments oa on oa.department_id = s.department_id and oa.officer_id = auth.uid() and oa.active = true
    where ad.document_id = public.documents.id
  ) or public.current_app_role() = 'admin'
);

-- appointment_documents policies
drop policy if exists appt_docs_owner_select on public.appointment_documents;
create policy appt_docs_owner_select on public.appointment_documents
for select using (
  exists (
    select 1 from public.appointments a
    where a.id = appointment_id and a.citizen_id = auth.uid()
  )
);

drop policy if exists appt_docs_owner_insert on public.appointment_documents;
create policy appt_docs_owner_insert on public.appointment_documents
for insert with check (
  exists (
    select 1 from public.appointments a
    where a.id = appointment_id and a.citizen_id = auth.uid()
  )
);

drop policy if exists appt_docs_owner_delete on public.appointment_documents;
create policy appt_docs_owner_delete on public.appointment_documents
for delete using (
  exists (
    select 1 from public.appointments a
    where a.id = appointment_id and a.citizen_id = auth.uid()
  )
);

drop policy if exists appt_docs_officer_read on public.appointment_documents;
create policy appt_docs_officer_read on public.appointment_documents
for select using (
  exists (
    select 1 from public.appointments ap
    join public.services s on s.id = ap.service_id
    join public.officer_assignments oa on oa.department_id = s.department_id and oa.officer_id = auth.uid() and oa.active = true
    where ap.id = appointment_id
  ) or public.current_app_role() = 'admin'
);

COMMIT;

