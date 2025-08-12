BEGIN;

-- profiles
create unique index if not exists idx_profiles_email_unique on public.profiles (email);
create unique index if not exists idx_profiles_nic_unique on public.profiles (nic);

-- services
create index if not exists idx_services_department_id on public.services (department_id);

-- officer_assignments
create index if not exists idx_officer_assignments_officer_id on public.officer_assignments (officer_id);
create index if not exists idx_officer_assignments_department_id on public.officer_assignments (department_id);

-- appointments
create index if not exists idx_appointments_citizen_id on public.appointments (citizen_id);
create index if not exists idx_appointments_service_id on public.appointments (service_id);
create index if not exists idx_appointments_assigned_officer_id on public.appointments (assigned_officer_id);
create index if not exists idx_appointments_appointment_at on public.appointments (appointment_at);
create index if not exists idx_appointments_service_id_appointment_at on public.appointments (service_id, appointment_at);
create index if not exists idx_appointments_status on public.appointments (status);

-- notifications
create index if not exists idx_notifications_user_id_created_at on public.notifications (user_id, created_at desc);
create index if not exists idx_notifications_appointment_id on public.notifications (appointment_id);
create index if not exists idx_notifications_status_partial on public.notifications (status) where status <> 'sent';

-- documents
create index if not exists idx_documents_owner_user_id on public.documents (owner_user_id);

-- appointment_documents
create index if not exists idx_appointment_documents_appointment_id on public.appointment_documents (appointment_id);
create index if not exists idx_appointment_documents_document_id on public.appointment_documents (document_id);

COMMIT;

