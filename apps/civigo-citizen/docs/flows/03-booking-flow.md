Flow stub: Booking flow (slots-driven)

- Service detail shows open slots from `service_slots` within date range
- Client island slot picker:
  - Date range presets: Today, Next 7 days, Next 14 days
  - Groups slots by day in a grid; keyboard-selectable buttons
  - Preserves range via `?from=YYYY-MM-DD&to=YYYY-MM-DD`; SSR re-fetches on change
- Server Action `createAppointmentFromSlot` uses RPC `book_appointment_slot` (atomic capacity)
  - If RPC unavailable and `CITIZEN_BOOKING_FALLBACK_ENABLED=true`, fallback performs active/capacity checks before insert
  - RPC failure codes map to friendly errors (slot inactive, full, past)
- On success, revalidate `/app/appointments` (literal path) and redirect to `/app/appointments/[id]`

