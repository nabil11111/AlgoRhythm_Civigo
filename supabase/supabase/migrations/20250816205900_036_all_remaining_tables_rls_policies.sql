BEGIN;

-- Fix all remaining RLS policies to use current_user_role() instead of current_app_role()

-- officer_assignments policies
DROP POLICY IF EXISTS officer_assignments_self_select ON public.officer_assignments;
CREATE POLICY officer_assignments_self_select ON public.officer_assignments
FOR SELECT USING (
  officer_id = auth.uid() OR public.current_user_role() = 'admin'
);

DROP POLICY IF EXISTS officer_assignments_admin_all ON public.officer_assignments;
CREATE POLICY officer_assignments_admin_all ON public.officer_assignments
FOR ALL USING (public.current_user_role() = 'admin') 
WITH CHECK (public.current_user_role() = 'admin');

-- appointments policies
DROP POLICY IF EXISTS appointments_officer_read ON public.appointments;
CREATE POLICY appointments_officer_read ON public.appointments
FOR SELECT USING (
  (EXISTS (
    SELECT 1
    FROM ((services s
      JOIN departments d ON ((d.id = s.department_id)))
      JOIN officer_assignments oa ON ((oa.department_id = d.id)))
    WHERE ((s.id = appointments.service_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true))
  )) OR (public.current_user_role() = 'admin')
);

DROP POLICY IF EXISTS appointments_officer_update ON public.appointments;
CREATE POLICY appointments_officer_update ON public.appointments
FOR UPDATE USING (
  (EXISTS (
    SELECT 1
    FROM ((services s
      JOIN departments d ON ((d.id = s.department_id)))
      JOIN officer_assignments oa ON ((oa.department_id = d.id)))
    WHERE ((s.id = appointments.service_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true))
  )) OR (public.current_user_role() = 'admin')
);

DROP POLICY IF EXISTS appointments_admin_all ON public.appointments;
CREATE POLICY appointments_admin_all ON public.appointments
FOR ALL USING (public.current_user_role() = 'admin');

-- appointment_feedback policies
DROP POLICY IF EXISTS feedback_officer_read ON public.appointment_feedback;
CREATE POLICY feedback_officer_read ON public.appointment_feedback
FOR SELECT USING (
  (EXISTS (
    SELECT 1
    FROM ((appointments ap
      JOIN services s ON ((s.id = ap.service_id)))
      JOIN officer_assignments oa ON (((oa.department_id = s.department_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true))))
    WHERE (ap.id = appointment_feedback.appointment_id)
  )) OR (public.current_user_role() = 'admin')
);

-- notifications policies
DROP POLICY IF EXISTS notifications_user_select ON public.notifications;
CREATE POLICY notifications_user_select ON public.notifications
FOR SELECT USING (
  user_id = auth.uid() OR public.current_user_role() = 'admin'
);

DROP POLICY IF EXISTS notifications_admin_select ON public.notifications;
CREATE POLICY notifications_admin_select ON public.notifications
FOR SELECT USING (public.current_user_role() = 'admin');

-- documents policies
DROP POLICY IF EXISTS documents_admin_all ON public.documents;
CREATE POLICY documents_admin_all ON public.documents
FOR ALL USING (public.current_user_role() = 'admin') 
WITH CHECK (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS documents_officer_read_scope ON public.documents;
CREATE POLICY documents_officer_read_scope ON public.documents
FOR SELECT USING (
  (EXISTS (
    SELECT 1
    FROM (((appointment_documents ad
      JOIN appointments ap ON ((ap.id = ad.appointment_id)))
      JOIN services s ON ((s.id = ap.service_id)))
      JOIN officer_assignments oa ON (((oa.department_id = s.department_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true))))
    WHERE (ad.document_id = documents.id)
  )) OR (public.current_user_role() = 'admin')
);

-- appointment_documents policies
DROP POLICY IF EXISTS appt_docs_officer_read ON public.appointment_documents;
CREATE POLICY appt_docs_officer_read ON public.appointment_documents
FOR SELECT USING (
  (EXISTS (
    SELECT 1
    FROM ((appointments ap
      JOIN services s ON ((s.id = ap.service_id)))
      JOIN officer_assignments oa ON (((oa.department_id = s.department_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true))))
    WHERE (ap.id = appointment_documents.appointment_id)
  )) OR (public.current_user_role() = 'admin')
);

-- phone_verification_events policies
DROP POLICY IF EXISTS phone_events_admin_read ON public.phone_verification_events;
CREATE POLICY phone_events_admin_read ON public.phone_verification_events
FOR SELECT USING (public.current_user_role() = 'admin');

-- identity_verifications policies
DROP POLICY IF EXISTS idv_admin_all ON public.identity_verifications;
CREATE POLICY idv_admin_all ON public.identity_verifications
FOR ALL USING (public.current_user_role() = 'admin') 
WITH CHECK (public.current_user_role() = 'admin');

-- phone_verifications policies
DROP POLICY IF EXISTS phone_admin_read ON public.phone_verifications;
CREATE POLICY phone_admin_read ON public.phone_verifications
FOR SELECT USING (public.current_user_role() = 'admin');

-- service_branch_settings was already fixed in previous migration, but let's ensure it
DROP POLICY IF EXISTS sbs_admin_all ON public.service_branch_settings;
CREATE POLICY sbs_admin_all ON public.service_branch_settings
FOR ALL USING (public.current_user_role() = 'admin') 
WITH CHECK (public.current_user_role() = 'admin');

-- Storage policies (these use current_app_role but may not directly affect officer creation)
-- We'll leave storage policies as-is for now since they don't affect user creation

COMMIT;
