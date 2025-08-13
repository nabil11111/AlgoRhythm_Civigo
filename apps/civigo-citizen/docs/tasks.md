# Citizen Onboarding (Gov ID) — Tasks

Status legend: [ ] Todo, [~] In progress, [x] Done, [!] Blocker

## Pre-checks

- [ ] Ensure NIC validation rules support both old (9 digits + V/X) and new (12-digit) formats.
- [ ] Confirm private storage bucket (nic-media) strategy for NIC images and facial captures.
- [ ] Confirm feature flag for RPC fallback remains available.

## Database and RLS

- [x] Migration: profiles.gov_id (text, unique, indexed); add generate_gov_id(nic text) SQL function stub.
- [x] Migration: identity_verifications (user_temp_id, nic, nic_front_path, nic_back_path, face_capture_path, status, score, created_at, reviewed_by, reviewed_at).
- [x] Migration: phone_verifications (user_temp_id, phone, otp_hash, expires_at, verified_at).
- [x] Storage: nic-media bucket (private); RLS/policies: owner and admin read; officers no read (facial captures never exposed to officers).
- [x] Appointments/documents: add citizen_gov_id/owner_gov_id columns; indexes; backfill plan stub.
- [ ] RLS: identity_verifications owner read/write, admin full; officers none. phone_verifications owner-only; admin read.

## Onboarding routes and actions

- [x] Route group: /(auth)/onboarding/\*
- [x] Step 1: Enter NIC (Zod validate both formats; server check uniqueness; store as temp onboarding state)
- [~] Step 2: Phone number → Send OTP (mock) → Verify OTP (mock, server-stored hashed OTP with expiry)
  - [x] Add phone_verification_events for rate limit tracking.
  - [x] Enforce 1/minute and 5/hour rate limiting by onboarding_temp_id+phone.
  - [ ] Wire shadcn/ui and sonner toasts for UX.
- [~] Step 3: Names (first_name, last_name)
  - [x] Transiently store names in httpOnly cookie.
- [~] Step 4: Create password + confirm (defer auth user creation)
  - [x] Transiently store password in httpOnly cookie.
- [~] Step 5: Upload NIC photos (front/back) to nic-media (server-signed URLs)
  - [ ] Server action returning signed upload URLs and persisting paths.
- [~] Step 6: Facial scan (mock) upload; mark identity_verifications.status='pending'
- [~] Step 7: Finalize: server action issues gov_id via generate_gov_id(nic), creates auth user, writes profiles with gov_id, links any prepared artifacts; redirect to /(auth)/sign-in or /app
  - [x] Create auth user via admin; update profile with gov_id, nic, full_name; clear temp cookies.

## Permissions and linking

- [ ] Ensure uploaded NIC photos are not publicly accessible; serve via signed URLs on the server only.
- [ ] Automatically create a citizen “document” for NIC photos linked by owner_gov_id (officers viewable after booking, not facial captures).
- [ ] Ensure gov_id is required for booking; if missing, redirect to onboarding.

## Citizen booking/documents updates

- [ ] When booking, write citizen_gov_id alongside existing citizen_id FK.
- [ ] When uploading documents, store owner_gov_id alongside owner_user_id.

## UI (decent, not pixel-perfect)

- [ ] Use shadcn/ui for forms, inputs, buttons; sonner toasts; disabled/pending states.
- [ ] Keep screens minimal and accessible; clear errors; simple progress header for onboarding steps.

## Tests

- [ ] NIC validation (old/new) and uniqueness checks.
- [ ] OTP flow (mock): send, verify, rate limit, expiry.
- [ ] Upload permissions (signed URL issuance, RLS read/write guard).
- [ ] Finalize flow creates auth user, sets gov_id, and prevents partial accounts.
- [ ] Booking writes citizen_gov_id; documents write owner_gov_id.

## Docs

- [ ] Update apps/civigo-citizen/README.md: onboarding flow, privacy notes, RLS, storage.
- [ ] Document NIC formats, generate_gov_id policy, and access rules (admin vs officer).

## Changelog

- docs(citizen): add onboarding tasks tracker
- feat(db): add gov_id to profiles, verification tables, storage policies, and gov_id columns on appointments/documents
- feat(citizen/onboarding): scaffold routes and server action stubs for NIC → phone → names → password → NIC photos → face → finalize
- feat(citizen/onboarding): OTP rate-limit; transient names/password; finalize creates auth user and sets gov_id
