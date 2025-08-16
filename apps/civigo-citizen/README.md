Citizen-facing app for Civigo. SSR-first with Supabase auth and RLS. Booking flow is slot-driven using `service_slots`.

Routes:

- `/(auth)/sign-in`, `/(auth)/sign-up`
- `/(protected)/app` (browse departments)
- `/(protected)/app/departments/[id]` (services in department)
- `/(protected)/app/services/[id]` (slots + booking)
- `/(protected)/app/appointments` (list)
- `/(protected)/app/appointments/[id]` (detail)
- `/(auth)/onboarding/*` (NIC → phone (OTP) → names → password → NIC photos → face → finalize)

Standards:

- SSR auth via `@supabase/ssr` with cookie adapter.
- No service-role in browser; privileged ops in Server Actions.
- Zod validation; shadcn/ui basics; `sonner` Toaster in root layout.
- Use literal URLs in `revalidatePath` (for dynamic routes use concrete path like `/app/appointments`, not a route pattern; do not pass the type param when giving a specific path).

RLS notes:

- `appointments` self-only policies; `departments/services` readable.
- Slots are read from `service_slots` where `active=true` and `slot_at>=now()`.
- Onboarding:
- - `identity_verifications` owner read/write; admin full; officers no access.
- - `phone_verifications` owner read/write; admin read; officers no access.
- Storage:
- - `nic-media` (private): folders `nic/front`, `nic/back`, `face/captures`. Owner/admin access; officers excluded from `face` assets.
- - `citizen-documents` (private): `identity/nic`, `appointments/{id}`, `uploads/{gov_id}`. Officers see only where permitted (e.g., linked to a booking).

Setup:

1) Add env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and optionally `SUPABASE_SERVICE_ROLE_KEY` for server).
2) Install and run: `npm i` then `npm run dev`.

Booking flow (RPC-first):

- Server Action `createAppointmentFromSlot` calls DB RPC `book_appointment_slot` for atomic capacity enforcement and passes `citizen_gov_id`.
- If the RPC is unavailable, enable fallback via `CITIZEN_BOOKING_FALLBACK_ENABLED=true` to use a guarded insert with active/capacity checks.
- On success, `revalidatePath('/app/appointments')` and redirect to `/app/appointments/[id]`.

Onboarding flow:

- SSR-first; no service-role in the browser; all uploads via server actions.
- Step 1 (NIC): validate old/new formats, check uniqueness.
- Step 2 (Phone): OTP send/verify; 1/min and 5/hour rate-limit.
- Step 3 (Names): transient httpOnly cookie storage.
- Step 4 (Password): transient httpOnly cookie storage.
- Step 5 (NIC photos): upload to `nic-media/nic/front|back`; persist paths.
- Step 6 (Face): upload to `nic-media/face/captures`; persist path; status='pending'. Officers cannot read face captures.
- Step 7 (Finalize): normalize NIC, `generate_gov_id(nic)`, create auth user (admin), update `profiles.gov_id`, create NIC document in `citizen-documents/identity/nic` linked via `owner_gov_id`, clear temp cookies, redirect to sign-in.

NIC formats and generate_gov_id:

- Old: 9 digits + V/X (case-insensitive). Canonical form strips the trailing letter.
- New: 12 digits as-is. `generate_gov_id(nic)` currently returns the canonical NIC.

gov_id usage:

- Bookings write `citizen_gov_id` alongside `citizen_id` (RPC and fallback).
- Documents use `owner_gov_id` alongside `owner_user_id`.

Revalidation and SSR notes:

- Always use literal URLs in `revalidatePath`.
- Server Actions only in `_actions.ts` files; utilities must not contain `use server`.

Appointments filters:

- `/app/appointments?status=upcoming|past` to filter by time relative to now; default shows all.
- Pagination persists across filters; filter changes reset page to 1.

Agent (feature-flagged):

- Set `AGENT_ENABLED=true` to enable the chat UI mount; otherwise hidden.
- API route `/api/agent` uses server-only tools with RLS; no file contents or signed URLs are returned.
- Optional `GEMINI_API_KEY` (server only) for future Gemini integration; not exposed to client.
