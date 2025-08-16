BEGIN;

-- Atomic booking RPC
-- SECURITY NOTE:
-- - SECURITY DEFINER is used to allow this function to read from service_slots and insert into appointments
--   within a single transaction while enforcing caller identity via `p_citizen_id = auth.uid()`.
-- - This approach follows Supabase guidance for safely bypassing table RLS inside trusted server-side functions,
--   provided the function validates inputs and caller identity.
-- - RLS on appointments is bypassed by definer, so we must explicitly enforce that the inserted row belongs
--   to the authenticated caller.

create or replace function public.book_appointment_slot(
  p_slot_id uuid,
  p_citizen_id uuid,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_service_id uuid;
  v_slot_at timestamptz;
  v_capacity int;
  v_active boolean;
  v_booked_count int;
  v_appt_id uuid;
  v_ref text;
begin
  -- Caller identity check
  if p_citizen_id is null or p_citizen_id <> auth.uid() then
    return jsonb_build_object('ok', false, 'error', 'unknown');
  end if;

  -- Lock slot row for update to ensure atomic capacity checks
  select s.service_id, s.slot_at, s.capacity, s.active
  into v_service_id, v_slot_at, v_capacity, v_active
  from public.service_slots s
  where s.id = p_slot_id
  for update;

  if v_service_id is null then
    return jsonb_build_object('ok', false, 'error', 'slot_inactive');
  end if;

  if v_active is not true then
    return jsonb_build_object('ok', false, 'error', 'slot_inactive');
  end if;

  if v_slot_at < now() then
    return jsonb_build_object('ok', false, 'error', 'slot_in_past');
  end if;

  select count(*)::int
  into v_booked_count
  from public.appointments a
  where a.service_id = v_service_id
    and a.appointment_at = v_slot_at;

  if v_booked_count >= v_capacity then
    return jsonb_build_object('ok', false, 'error', 'slot_full');
  end if;

  insert into public.appointments (
    citizen_id,
    service_id,
    slot_id,
    appointment_at,
    status
  ) values (
    p_citizen_id,
    v_service_id,
    p_slot_id,
    v_slot_at,
    'booked'
  ) returning id, reference_code into v_appt_id, v_ref;

  return jsonb_build_object('ok', true, 'appointment_id', v_appt_id, 'reference_code', v_ref);
exception when others then
  return jsonb_build_object('ok', false, 'error', 'unknown');
end;
$$;

-- Allow authenticated users to execute
grant execute on function public.book_appointment_slot(uuid, uuid, text) to authenticated;

COMMIT;


