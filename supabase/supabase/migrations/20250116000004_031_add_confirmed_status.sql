BEGIN;

-- Update the status check constraint to include 'confirmed'
ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS appointments_status_check;

ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('booked', 'confirmed', 'cancelled', 'completed'));

COMMIT;
