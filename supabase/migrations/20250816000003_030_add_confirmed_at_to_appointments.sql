BEGIN;

-- Add confirmed_at field to appointments table
ALTER TABLE public.appointments 
ADD COLUMN confirmed_at timestamptz;

-- Add comment for the new field
COMMENT ON COLUMN public.appointments.confirmed_at IS 'Timestamp when the appointment was confirmed by the citizen or system';

COMMIT;
