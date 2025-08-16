BEGIN;

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Allow officers to insert notifications for any user
CREATE POLICY "Officers can insert notifications" ON public.notifications
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'officer'
    )
  );

-- Policy: Allow users to read their own notifications
CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT 
  USING (user_id = auth.uid());

-- Policy: Allow officers to read all notifications for their department
CREATE POLICY "Officers can read department notifications" ON public.notifications
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.officer_assignments oa ON oa.officer_id = p.id
      JOIN public.appointments a ON a.id = notifications.appointment_id
      JOIN public.services s ON s.id = a.service_id
      WHERE p.id = auth.uid() 
      AND p.role = 'officer'
      AND oa.department_id = s.department_id
      AND oa.active = true
    )
  );

-- Policy: Allow system (service role) to insert notifications
CREATE POLICY "Service role can insert notifications" ON public.notifications
  FOR INSERT 
  WITH CHECK (current_user = 'service_role');

-- Policy: Allow service role to read all notifications  
CREATE POLICY "Service role can read all notifications" ON public.notifications
  FOR SELECT 
  USING (current_user = 'service_role');

COMMIT;
