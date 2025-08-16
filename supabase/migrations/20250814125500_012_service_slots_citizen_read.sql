BEGIN;

-- Allow authenticated citizens to read open service slots for booking.
-- Rows are limited to active future slots.
alter table if exists public.service_slots enable row level security;

drop policy if exists service_slots_citizen_select on public.service_slots;
create policy service_slots_citizen_select on public.service_slots
for select
to authenticated
using (
  active = true
  and slot_at >= now()
);

COMMIT;


