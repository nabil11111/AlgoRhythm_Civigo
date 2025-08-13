Flow stub: Booking flow (slots-driven)

- Service detail shows open slots from `service_slots` within date range
- Server Action `createAppointmentFromSlot` uses RPC `book_appointment_slot` if available, else fallback insert with checks
- On success, revalidate `/app/appointments` and redirect to detail

