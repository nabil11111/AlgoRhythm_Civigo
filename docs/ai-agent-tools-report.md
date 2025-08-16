## Repo Map

- apps:
  - `apps/civigo-citizen` (Next.js App Router, SSR-first; Supabase SSR for auth; shadcn-like UI)
  - `apps/civigo-gov` (Next.js App Router; officer/admin portal)
- backend/db:
  - `supabase/supabase/migrations` (Postgres schema, RLS, RPCs, storage policies)
  - `supabase/supabase/config.toml` (local Supabase ports and services)
- shared packages: none present in `packages/` used by the citizen flows

- Citizen app stack

  - Framework: Next.js App Router (React Server Components by default)
  - Routing: `/src/app` route groups (e.g., `(protected)/app/services/[id]`)
  - State/data: Supabase SSR client on server components and actions; Supabase browser client in client components
  - UI: shadcn-like components; `sonner` for toasts; bespoke components (e.g., `BookingForm`, `SlotPicker`)

- Backend/API powering Citizen app
  - Direct PostgREST access via Supabase clients
  - Database RPC: `public.book_appointment_slot(...)` for atomic booking
  - Storage buckets for PDFs and media with RLS/policies

## Runtime & Supabase

- Local Supabase services and ports (`supabase/supabase/config.toml`):
  - API: 54321; DB: 54322; Studio: 54323; Inbucket: 54324; Realtime enabled
  - Auth: cookie-based sessions; `site_url` `http://127.0.0.1:3000`; signup enabled; JWT expiry 3600s
  - Storage: enabled; default file size limit 50MiB
- Environment variables (citizen app):
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (browser + server)
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only; used by privileged Server Actions)
  - Implementations: `apps/civigo-citizen/src/utils/supabase/server.ts`, `.../client.ts`
- Docker: no `docker-compose` found in repo; local dev uses Supabase CLI config above
- Local auth & sessions: Supabase SSR with cookie adapter; `getServerClient()` reads/writes cookies; identity enforced via RLS and checks in Server Actions

## Tool 1: getServiceIstructions

Purpose: return service instructions/requirements and related branch info

- Source of truth

  - Table: `public.services`
    - Columns: `instructions_richtext jsonb`, `instructions_pdf_path text` (added in `20250815120000_023_branches_sbs_and_columns.sql`)
  - Storage: `departments` bucket; PDFs served via public URL (policies in `20250815135022_fix_storage_bucket_public.sql`)
  - Branches: `public.branches` with FK to `departments`; per-branch enablement via `public.service_branch_settings`

- Real usage in Citizen app

  - Fetch service (SSR): `apps/civigo-citizen/src/app/(protected)/app/services/[id]/page.tsx` selects `id, code, name, department_id, instructions_richtext, instructions_pdf_path`
  - Render rich text or PDF link with `PDFDownload` (uses `supabase.storage.from('departments').getPublicUrl(pdfPath)`)
  - Fetch branches by `department_id`: same page selects from `branches` ordered by code

- HTTP/DB surface

  - Method: PostgREST `GET /rest/v1/services?id=eq.{serviceId}` (via supabase client)
  - Response fields: `{ id, code, name, department_id, instructions_richtext, instructions_pdf_path }`
  - Auth: services table is public-select (policy `services_public_select`), so anon/auth can read
  - Input validation: none in code (SSR performs typed selection only)
  - Business rules: none specific besides data presence; PDF path is optional

- Target coverage vs tool: "Needs thin wrapper"
  - Suggested wrapper (server action) to match tool name and contract:
    - File: `apps/civigo-citizen/src/app/(protected)/app/services/[id]/_actions.ts` or a shared `app/(protected)/_actions.ts`
    - Signature: `async function getServiceInstructions(serviceId: string): Promise<{ instructions_richtext?: any, instructions_pdf_url?: string, branches: Array<{id:string,code:string,name:string,address?:string}> }>`
    - Behavior: select from `services`, resolve `instructions_pdf_path` to public URL, and fetch enabled branches (join `service_branch_settings.enabled=true`)

Ambiguities: none material; code and migrations align on instructions fields and storage bucket being public

## Tool 2: searchSlots

Purpose: return available slots for a service over a date range, optionally filtered by branch

- Source of truth

  - Table: `public.service_slots(id, service_id, branch_id, slot_at timestamptz, duration_minutes, capacity, active)`
    - Unique: `(service_id, branch_id, slot_at)`; indexes for service, branch, and composites
    - RLS (citizen read): `active = true AND slot_at >= now()` and branch must be enabled in `service_branch_settings`
  - Capacity is enforced at booking time; for discovery, UI also filters out slots whose booked count >= capacity

- Real usage in Citizen app (client component)

  - Dates discovery: `BookingForm.fetchAvailableDates()` queries `service_slots(slot_at)` for `service_id`, `branch_id`, `active=true` and `slot_at` within [now, +3 months]. It derives local calendar dates from UTC `slot_at` (local timezone extraction)
  - Slot discovery per date: `BookingForm.fetchAvailableSlots()` fetches all slots for service/branch (active) and appointments (status 'booked') for the service; filters to the selected local date and `bookedCount < capacity`
  - File: `apps/civigo-citizen/src/app/(protected)/app/services/[id]/_components/BookingForm.tsx`

- HTTP/DB surface

  - Methods: PostgREST `GET /rest/v1/service_slots` and `GET /rest/v1/appointments`
  - Auth: `service_slots` requires authenticated user via RLS; only future, active, and branch-enabled rows are visible
  - Input validation: none centralized; client code constructs date range and filters in JS
  - Business rules: branch selection required in this UX; weekday/weekend filtering in UI; timezone handling done client-side via local date extraction

- Target coverage vs tool: "Needs thin wrapper"
  - Suggested wrapper (server action) to query server-side and return normalized payload:
    - Signature: `async function searchSlots(serviceId: string, dateFrom: string, dateTo: string, branchId?: string): Promise<Array<{id:string, slot_at:string, capacity:number, branch_id:string}>>`
    - Behavior: select from `service_slots` within `[from 00:00:00, to 23:59:59]`, filter `branch_id` if provided; optionally include booked counts for capacity UI (join or separate count)

Notes on timezone: `BookingForm` derives dates from `slot_at` using local time; a server-side wrapper should standardize inputs/outputs in ISO UTC and leave UI-localization to the caller

## Tool 3: bookSlot

Purpose: create an appointment for a slot with transactional integrity and capacity enforcement

- Primary implementation

  - DB RPC: `public.book_appointment_slot(p_slot_id uuid, p_citizen_id uuid, p_notes text default null, p_citizen_gov_id text default null) returns jsonb`
    - Files: `20250814123000_009_book_appointment_slot.sql`, `20250814133000_019_rpc_gov_id_param.sql`
    - Behavior: locks slot row, checks `active`, `slot_at >= now()`, compares booked count to `capacity`, inserts `appointments(citizen_id, service_id, slot_id, appointment_at, status='booked', citizen_gov_id)`; returns `{ok, appointment_id, reference_code}`
    - Security: `security definer`; caller identity enforced via `p_citizen_id = auth.uid()`; execution granted to `authenticated`

- App server action fallback

  - `createAppointmentFromSlot(input)` in `apps/civigo-citizen/src/app/(protected)/app/services/[id]/_actions.ts`
    - Validates with `BookAppointmentSchema` (slot_id UUID)
    - Tries RPC; on `rpc_not_available` and `CITIZEN_BOOKING_FALLBACK_ENABLED=true`, performs guarded insert: checks slot `active`, counts `appointments` for that `service_id + slot_at`, compares to `capacity`, then inserts appointment with `citizen_gov_id`
    - On success: `revalidatePath('/app/appointments')` and redirect to detail

- Client confirm flow

  - `ConfirmButton` calls `supabase.rpc('book_appointment_slot', {...})` then links any selected `appointment_documents`, then navigates to success page
  - QR generation is purely client-rendered on success page using reference code (`QRCodeComponent`)

- HTTP/DB surface

  - RPC via PostgREST: `POST /rest/v1/rpc/book_appointment_slot` with JSON body `{ p_slot_id, p_citizen_id, p_notes?, p_citizen_gov_id? }`
  - Auth: authenticated user; RLS is bypassed within definer function but identity is checked in-function
  - Business rules: branch is implied by `slot_id`; capacity is enforced atomically; past slots rejected; service derived from `service_slots`
  - Error mapping: server action maps RPC errors to friendly codes: `slot_inactive`, `slot_full`, `slot_past`, `rpc_not_available`, `unknown`

- Target coverage vs tool: "Ready" (via RPC or the server action wrapper)

## Tool 4: getUserdocuments

Purpose: list a user’s documents (NIC and other uploads)

- Implementation

  - Server action: `getUserDocuments()` in `apps/civigo-citizen/src/app/(protected)/_actions.ts`
    - Selects from `public.documents` filtered by `owner_user_id = auth.user.id`, ordered by `created_at desc`
    - Returns a transformed array: `{ id, name, type, status, created_at }`
    - Virtual NIC document: if NIC front/back images exist but no main `Identity: NIC`, adds a synthetic `id: 'nic-virtual'`
  - `DocumentSelector` consumes this and resolves actual NIC image document IDs via browser query when needed

- Storage & validation

  - Storage bucket used for uploads in this app: `nic-media` (private) with owner/admin policies; files uploaded server-side (service role) and signed URLs created when needed
  - Allowed mime/types and size: storage limit 50MiB in config; no explicit mime allowlist in code; UI limits feedback images to 5 and ≤5MB each

- RLS

  - `documents`: owner select/insert/update; admin-all; officer read scoped via `appointment_documents`

- Target coverage vs tool: "Ready" (server action exists; returns reshaped objects)

## Tool 5: getUserAppointments

Purpose: list a user’s appointments, with basic details and status

- Real usage in Citizen app

  - List page: `apps/civigo-citizen/src/app/(protected)/app/appointments/page.tsx` selects `id, reference_code, service_id, appointment_at, status` filtered by `citizen_id = profile.id`, with optional upcoming/past filters
  - Activity page: similar upcoming/past split and a richer past card view including joined service/branch data; detail page joins services, departments, and branches and shows timeline stamps

- DB model

  - `appointments(status check in ('booked','confirmed','cancelled','completed'))`, with timestamps for `confirmed_at`, `checked_in_at`, `started_at`, `completed_at`, `cancelled_at` (varies by migration and officer portal writes)
  - RLS: citizen self-select/insert/update; officer read/update scoped to assigned departments; admin-all

- Target coverage vs tool: "Needs thin wrapper"
  - Suggested wrapper: `async function getUserAppointments(userId: string): Promise<Array<{id, appointment_at, status, reference_code, service_id, slot_id}>>` executing on server (userId verified from session; ignore argument or use for admin contexts)

## Database Schema (ER-style textual summary)

- profiles(id PK → auth.users, role, full_name, email unique, nic unique, gov_id unique, verified_status, phone, created_at)
- departments(id PK, code unique, name, logo_path, description_richtext, description_updated_at)
- services(id PK, department_id → departments, code unique, name, instructions_richtext, instructions_pdf_path, instructions_updated_at)
- branches(id PK, department_id → departments, code, name, address, location_lat/lng, meta; unique(department_id, code))
- service_branch_settings(PK(service_id, branch_id), enabled)
- service_slots(id PK, service_id → services, branch_id → branches, slot_at timestamptz, duration_minutes, capacity, active, created_by → profiles, created_at; unique(service_id, branch_id, slot_at))
- appointments(id PK, citizen_id → profiles, service_id → services, slot_id → service_slots, appointment_at, status, confirmed_at?, checked_in_started_completed_cancelled_at?, no_show, created_at, reference_code (generated), citizen_gov_id)
- appointment_feedback(id PK, appointment_id unique → appointments, rating, comment, media jsonb, created_at)
- documents(id PK, owner_user_id → profiles, title, storage_path unique, mime_type, size_bytes, expires_at, created_at, owner_gov_id)
- appointment_documents(id PK, appointment_id → appointments, document_id → documents, unique(appointment_id, document_id))
- identity_verifications(id PK, user_temp_id, nic, nic_front_path, nic_back_path, face_capture_path, status, score, reviewed_by → profiles, reviewed_at, created_at)
- phone_verifications(id PK, user_temp_id, phone, otp_hash, expires_at, verified_at)

Indexes: numerous on appointments (citizen_id, service_id, status, appointment_at), service_slots (service_id, branch_id, slot_at), documents (owner_user_id, owner_gov_id), gov_id columns

RLS highlights:

- `service_slots` citizen read: active & future & branch enabled; officers write within assigned departments; admin-all
- `appointments` citizen self; officer scoped read/update; admin-all
- `documents` owner self; officer read only when linked via appointment_documents; admin-all
- `services`/`departments` readable to all (public-select)
- Storage `nic-media`: owner read/insert/update; admin-all; `departments` bucket: public read for PDF/logo (migration 20250815135022)

## Citizen App Flows (screens and hooks)

- Service selection
  - `/(protected)/app/page.tsx` lists departments and surfaces services
  - `/(protected)/app/departments/[id]/page.tsx` lists services for a department
- Service details & instructions
  - `/(protected)/app/services/[id]/page.tsx` fetches service instructions and branches; renders `PDFDownload`
- Branch selection & slot calendar
  - `BookingForm.tsx` handles branch select, available dates, and slots; `fetchAvailableDates` and `fetchAvailableSlots`
- Document selection (pre-submit)
  - `DocumentSelector.tsx` uses `getUserDocuments()` and allows selecting documents to attach
- Booking confirmation & QR
  - `/(protected)/app/booking/confirm/page.tsx` shows summary and calls `ConfirmButton` → `book_appointment_slot`; success page renders `QRCodeComponent` with `reference_code`
- Appointments list & detail
  - `/(protected)/app/appointments/page.tsx` list with filters; `/(protected)/app/appointments/[id]/page.tsx` detail joins service/branch; includes `AppointmentDocumentManager` and `AppointmentFeedback`

Existing utilities that map to agent tools:

- Booking: `createAppointmentFromSlot` (server action) and `book_appointment_slot` (RPC)
- Documents: `getUserDocuments`, `getAppointmentDocuments`, `addDocumentToAppointment`, `removeDocumentFromAppointment`
- Slots: Query patterns in `BookingForm` (client), reusable in a thin server wrapper

## Gaps & Feasibility

| Tool                                          | Status             | Notes                                                                                                                             |
| --------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| getServiceIstructions(serviceId)              | Needs thin wrapper | Service instructions exist in `services`; add wrapper to also surface enabled branches and resolve `instructions_pdf_path` to URL |
| searchSlots(serviceId, dateRange[, branchId]) | Needs thin wrapper | Client code already queries; server-side wrapper should normalize range and optionally include booked counts                      |
| bookSlot(request)                             | Ready              | Use DB RPC `book_appointment_slot` or server action `createAppointmentFromSlot`; both set `citizen_gov_id`                        |
| getUserdocuments(userId)                      | Ready              | `getUserDocuments()` returns transformed list; storage via `nic-media` with signed URLs when needed                               |
| getUserAppointments(userId)                   | Needs thin wrapper | List page and activity page query patterns exist; expose as server action returning normalized items                              |

## Security Notes

- Keys/secrets: loaded via env (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, server-only `SUPABASE_SERVICE_ROLE_KEY`)
- User identity: enforced via Supabase SSR cookies and RLS; booking RPC checks `p_citizen_id = auth.uid()`
- Storage access: `nic-media` is private; files accessed via server-signed URLs; `departments` bucket is public for PDFs/logos
- PII handling: NIC images and face captures stored in private bucket; officers do not have access to face captures per policy; no raw documents are sent to models in this codebase (no model calls present)

## Demo-Readiness (3 scripts with endpoints)

a) What documents do I need for [service]?

- Fetch instructions: `GET /rest/v1/services?id=eq.{serviceId}&select=id,code,name,department_id,instructions_richtext,instructions_pdf_path`
- If `instructions_pdf_path`, resolve URL: storage public URL from `departments` bucket
- Fetch user’s docs: `GET /rest/v1/documents?owner_user_id=eq.{auth.uid}` or use server action `getUserDocuments()`

b) Book next week at [branch]

- Search slots: `GET /rest/v1/service_slots?service_id=eq.{serviceId}&branch_id=eq.{branchId}&slot_at=gte.{from}T00:00:00&slot_at=lte.{to}T23:59:59&active=is.true&order=slot_at`
- Optionally compute availability: count `appointments` for the same `service_id + slot_at` and compare to `capacity`
- Book: `POST /rest/v1/rpc/book_appointment_slot` with `{ p_slot_id, p_citizen_id, p_notes: null, p_citizen_gov_id }`
- Success: read appointment `{reference_code}` and render QR (client `QRCodeComponent` encodes `REF:{reference_code}`)

c) What appointments do I have?

- List: `GET /rest/v1/appointments?citizen_id=eq.{auth.uid}&select=id,reference_code,service_id,appointment_at,status&order=appointment_at.desc`
- Filters: upcoming `appointment_at >= now()`, past `appointment_at < now()` (as implemented in `/(protected)/app/appointments/page.tsx`)

Ambiguities/Notes

- `searchSlots` in-app uses local timezone conversion; server wrappers should standardize to ISO UTC for inputs/outputs
- PDFs are served via `departments` bucket public URL; ensure bucket policy migrations are applied in the target env
