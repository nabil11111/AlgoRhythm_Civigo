## Civigo Citizen App — Summary & Architecture

### Purpose

Mobile‑first citizen portal for browsing services, booking appointments, and completing Gov ID–centric onboarding. Built with Next.js App Router (SSR‑first) and Supabase (Auth, PostgREST, Storage, RLS).

### Core Principles

- SSR‑first pages and Server Actions; no service‑role in the browser
- Strict RLS — all data access via user/session context or trusted Server Actions
- Zod validation, friendly error mapping, no PII in logs/toasts
- `revalidatePath` with literal URLs; avoid dynamic route patterns

### High‑Level Flow

1. Browse: Departments → Services → Slots (2‑week window)
2. Book: RPC `book_appointment_slot` (atomic capacity); fallback guarded insert
3. Manage: View appointments (list/detail)
4. Onboarding (Gov ID): NIC → Phone OTP → Email → Names → Password → NIC Photos → Face → Finalize

### Routing

- `(auth)`
  - `/sign-in`, `/sign-up`
  - `/onboarding/*`: SSR + Server Actions, step‑gated
    - `/onboarding/nic` (NIC formats: 9+V/X | 12‑digit)
    - `/onboarding/phone` (mock OTP)
    - `/onboarding/email` (capture email; no verification)
    - `/onboarding/names`, `/onboarding/password`
    - `/onboarding/nic-photos` (front/back uploads)
    - `/onboarding/face` (face capture upload)
    - `/onboarding/finalize` (issue Gov ID, create user, profile)
- `(protected)/app`
  - `/app` (departments)
  - `/app/departments/[id]` (services)
  - `/app/services/[id]` (slots + booking)
  - `/app/appointments`, `/app/appointments/[id]`

### Auth & Guards

- SSR client via `@supabase/ssr` cookie adapter; Server Actions use SSR client
- Protected layout: requires authenticated citizen with `profile.gov_id` present; otherwise redirects to onboarding
- Admin/officer portals are separate apps (not included here)

### Database (selected)

- `profiles(id, role, full_name, email, nic, gov_id, verified_status, phone)`
- `departments`, `services`, `service_slots`
- `appointments` (includes `citizen_gov_id`, slot linkage, reference code)
- `documents` + `appointment_documents`
- Onboarding tables:
  - `identity_verifications(user_temp_id, nic, nic_front_path, nic_back_path, face_capture_path, status, …)`
  - `phone_verifications(user_temp_id, phone, otp_hash, expires_at, verified_at)`
  - `phone_verification_events(user_temp_id, phone, created_at)` (rate‑limit logs)

#### Key Migrations

- 001 core schema; 003 RLS policies; 006 service_slots
- 008 profiles trigger (ensure profile on auth.users insert)
- 009 booking RPC; 012 citizen read on service_slots
- 013 profiles.gov_id + `generate_gov_id(nic)` (canonical form)
- 014 onboarding tables; 015 storage (nic‑media policies)
- 016 gov_id columns on appointments/documents
- 017 phone send events (rate‑limit); 018 RLS hardening notes
- 019 booking RPC extended with `p_citizen_gov_id`
- 020/021 unique constraints for phone/idv upserts

### RLS Overview

- Enabled for all PII tables; officers/admin use role‑based policies
- `appointments`: self‑access for citizens; officer read/update scoped to assigned departments; admin full
- `documents` + `appointment_documents`: owner + admin; officers see documents only when linked to an appointment they can access
- Onboarding:
  - `identity_verifications`: owner read/write; admin full; officers none
  - `phone_verifications`: owner select/insert/update; admin read
- Storage (Supabase Storage):
  - Bucket `nic-media` (front/back/captures) — private; admin policies in SQL; owner access via short‑lived signed GET URLs generated server‑side
  - Bucket `citizen-documents` (nic/appointments/uploads) — private; surfaced via app rules

### Onboarding (Gov ID)

Step‑gated SSR flow using a temp cookie `onboarding_temp_id` and Server Actions only.

1. NIC

   - Zod validation (old: 9+V/X; new: 12 digits)
   - Server checks `profiles.nic` uniqueness
   - Creates/updates `identity_verifications` row (by `user_temp_id`)

2. Phone OTP (mock)

   - Code: `000000` (sha256 stored as `otp_hash`)
   - Expiry: 5 min; rate‑limits: 1/min and 5/hour (logged in `phone_verification_events`)
   - Verify sets `verified_at` and `identity_verifications.status='phone_verified'` (status optional)

3. Email

   - Capture email (no verification); stored in httpOnly cookie `onboarding_email`

4. Names & 5) Password

   - Stored transiently in httpOnly cookies (`onboarding_names`, `onboarding_password`)

5. NIC Photos

   - Upload via server action to Storage `nic-media/front|back`
   - Persists `nic_front_path`, `nic_back_path` in `identity_verifications`

6. Face Capture (mock)

   - Upload to `nic-media/captures`; persists `face_capture_path`
   - Face captures are never exposed to officers

7. Finalize
   - Validates phone verified + NIC photos + face present
   - `gov_id := generate_gov_id(nic)` (current: canonical NIC)
   - Creates auth user (admin API) with provided email + password; `profiles` updated with `role='citizen'`, `gov_id`, `nic`, `full_name`, `verified_status='verified'`
   - Creates a NIC document record in `citizen-documents/nic/*` (metadata entry)
   - Clears onboarding cookies and redirects to sign‑in

### Booking

- Preferred path: DB function `book_appointment_slot(p_slot_id, p_citizen_id, p_notes, p_citizen_gov_id)`
  - Ensures capacity/active/temporal rules atomically; returns `{appointment_id, reference_code}`
- Fallback path: SSR checks active/capacity then inserts with RLS guard
- On success: `revalidatePath('/app/appointments')` and redirect to detail
- Best‑effort linkage: first booking links NIC document to the appointment (`appointment_documents`)

### Storage Strategy

- `nic-media` bucket (PII):
  - Writes via server (no browser service‑role); owner access via short‑lived signed GET URLs
  - Folders: `front/`, `back/`, `captures/`
- `citizen-documents` bucket (private): `nic/`, `appointments/`, `uploads/{gov_id}/`

### UI

- shadcn‑like components (Button, Input, Label); `sonner` Toaster for feedback
- Accessible forms; pending/disabled states; ProgressHeader for onboarding steps

### Env & Setup

- `.env.local` (citizen app):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server only; for trusted Server Actions)
- Install & run:
  - `npm i && npm run dev`

### Tests (initial)

- Vitest test files scaffolded for NIC parsing, OTP, uploads, finalize, and gov_id writes; expand to full cases

### Operational Notes

- Avoid logging sensitive values; never echo OTPs or secrets to client
- Prefer PostgREST `or=...ilike` for search; avoid chaining `ilike`
- Use literal paths in `revalidatePath`; do not pass the type arg for literal URLs

### Future Improvements

- Harden and extend tests (rate‑limit branches, RLS denial cases, finalize sad paths)
- Replace temporary summary page with admin review flow if needed
- Consider signed PUT URLs for uploads where supported; otherwise continue server‑side upload
- UX polish (Figma‑driven pass) once functionally complete
