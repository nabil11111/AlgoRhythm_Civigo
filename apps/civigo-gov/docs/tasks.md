### Implementation Tasks — Branches, Department Media, and Service Instructions

Owner: gov team  • Start: 2025‑08‑15

Conventions:
- Track with checkboxes; update after each commit with short commit refs.
- Conventional Commits; branch: `feat/gov-branches-instructions`.

#### Phase 0 — Groundwork
- [x] Plan document written and approved → `apps/civigo-gov/docs/plan-branch-instructions.md` (init)
- [x] Create task tracker (this file)

#### Phase 1 — Database schema and RLS
- [ ] Add `branches` table with strict RLS (public/auth read; admin all; officer write by department)
- [ ] Add `service_branch_settings` with per-branch toggles and RLS (auth read; admin all; officer write)
- [ ] Add `branch_id` to `service_slots`; backfill default branch per department; enforce not null + unique `(service_id, branch_id, slot_at)`; indexes
- [ ] Update officer RLS on `service_slots` to validate branch.department matches
- [ ] Add presentation fields: `departments.logo_path`, `departments.description_richtext`
- [ ] Add instruction fields: `services.instructions_richtext`, `services.instructions_pdf_path`
- [ ] Restrict `departments` and `services` SELECT to authenticated users (drop public read)
- [ ] Update citizen read policy on `service_slots` to require `service_branch_settings.enabled = true`

#### Phase 2 — Storage (bucket: `departments`)
- [ ] Ensure bucket `departments` is private (set `public=false`)
- [ ] RLS: SELECT to authenticated; officers/admins write with path checks
  - logos: `logos/{department_id}/logo.(png|jpg|webp)`
  - files: `files/{department_id}/...` and `files/services/{service_id}/instructions.pdf`

#### Phase 3 — Server Actions (SSR-only writes)
- [x] `uploadDepartmentLogo(deptId, file)` → path + `departments.logo_path`
- [x] `updateDepartmentDescription(deptId, json)`
- [x] Branch CRUD: create/update/delete
- [x] `toggleServiceForBranch(serviceId, branchId, enabled)`
- [x] `upsertServiceInstructions(serviceId, json)`
- [x] `uploadServiceInstructionsPdf(serviceId, file)`
- [x] `createSlotsForBranch(serviceId, branchId, generator)`

#### Phase 4 — UI (shadcn/ui)
- [x] Admin → Departments: tabs (Logo, Description, Branches)
- [x] Officer → Department services: per-branch enable toggles
- [x] Officer → Service detail: Instructions editor (Tiptap) + PDF upload
- [x] Officer → Slots: branch selector + slot management
 - [x] Officer → Slots: Batch Create supports branch selection
 - [x] Officer → Slots: Batch Create uses client timezone to store correct UTC instants

#### Phase 5 — Tests/Docs
- [ ] Unit: slot generator, zod validations, sanitize rich text
- [ ] Integration: RLS-positive/negative Server Action tests
- [ ] Update docs/ERD and README links

#### Phase 6 — Data migration/backfill
- [ ] Create default branch per department; seed `service_branch_settings` enabled=true
- [ ] Verify citizen browsing (auth-only) and booking unaffected

#### Phase 7 — PR/CI
- [ ] Open PR with migrations and storage policies
- [ ] CI green (typecheck, lint, tests)
- [ ] Review and merge plan

Changelog:
- init: add tracker

# Civigo-Gov: Officer/Department Dashboard — Tasks

## Rules for this file

- Cursor keeps this file in sync. After each change + commit, update statuses and add new subtasks if discovered.

## Status legend

- [ ] Todo
- [~] In progress
- [x] Done
- [!] Blocker

## Auth and redirects

- [x] Reuse /(auth)/sign-in for admins and officers; post-login redirect by role (admin → /admin, officer → /officer).
- [x] Keep SSR guards as the source of truth.

## Officer route group (scaffold)

- [x] Create app/(protected)/officer/layout.tsx with SSR guard (role === 'officer'); redirect unauthenticated → /(auth)/sign-in; admin → /admin.
- [x] Create app/(protected)/officer/page.tsx (landing).
- [x] Create app/(protected)/officer/\_actions.ts (placeholder; no mutations yet).
- [x] Create app/(protected)/officer/\_components/DepartmentHeader.tsx (Server).
- [x] Create app/(protected)/officer/\_components/AppointmentsTable.tsx (Server; shadcn Table).
- [x] Create app/(protected)/officer/\_components/ToastBridge.tsx (Client; sonner).

## Data fetching (SSR, RLS-safe; no service-role)

- [x] Helper requireOfficer() in src/utils/supabase/server.ts (or auth-guard util).
- [x] Query officer assignments (active) for current user.
- [x] Query paginated appointments (default: today → +7d), with service and citizen fields needed for table.

## UI/UX (shadcn + sonner)

- [x] Topbar with active department badge and logout.
- [x] Table with columns: reference_code, citizen (masked), service, appointment_at, status.
- [x] Empty-state card.

## Routing and guards symmetry

- [x] Visiting /admin as officer redirects to /officer (adjust admin guard).
- [x] Visiting /officer as admin redirects to /admin.

## Officer Department Chooser and Page

### Landing: list departments

- [x] Fetch active assignments + departments (SSR, RLS-safe)
- [x] If exactly one department, redirect to /officer/departments/[id]
- [x] Render DepartmentsList grid with Card, Badge, Button “Open”

### Department page route

- [x] Create app/(protected)/officer/departments/[deptId]/page.tsx
- [x] Validate deptId with Zod; unassigned/invalid → redirect /officer
- [x] Fetch department info (code, name)
- [x] Fetch paginated appointments scoped to department (SSR, RLS-safe)
- [x] Render DepartmentHeader (code/name) and AppointmentsTable
- [ ] Optional: ToastBridge for notices

### Utils and strings

- [x] Add OfficerDepartmentParam in src/lib/validation.ts
- [x] Add src/lib/strings/officer-dashboard.ts (headings, labels, empty states, errors)
- [ ] (Optional) Add utils/auth-guard.ts with requireOfficerForDepartment

### Tests

- [x] tests/officer-department-guard.test.ts (unassigned → /officer; assigned → OK)
- [x] tests/officer-landing.test.ts (one → redirect; many → list)

### Docs

- [x] Update README with department chooser flow, routes, RLS scope

## Officer Services under department

### Route and list (SSR, RLS-safe)

- [x] Create /officer/departments/[deptId]/services page.tsx with SSR guard (officer + active assignment)
- [x] List services for deptId with pagination
- [x] Search (?q=) on code/name (server-side or filter)
- [x] Empty-state Card

### Server Actions (SSR only)

- [x] \_actions.ts with createService, updateService, deleteService
- [x] Zod validation; typed results; map Postgres errors
- [x] revalidatePath(/officer/departments/[deptId]/services) on success

### Components (client islands)

- [x] CreateServiceDialog (shadcn Dialog + Form + Zod + toasts)
- [x] EditServiceDialog
- [x] ConfirmDeleteDialog

### Services page UI wiring

- [x] Wire dialogs into services page (New button, actions column)
- [x] Toolbar search (client or GET form) and pagination controls (Prev/Next, page size)

### Validation and strings

- [x] Add ServiceCreate/ServiceUpdate/ServiceDelete to src/lib/validation.ts
- [x] Add src/lib/strings/officer-services.ts

### Tests

- [ ] tests/officer-services-actions.test.ts (happy path, unique violation, privilege errors)
- [ ] tests/officer-services-guard.test.ts (unauthorized → /officer)
- [ ] tests/officer-services-ui.test.ts (create/edit/delete happy and error toasts)

### Docs

- [ ] Update README: services route, RLS scope, pagination/search, UI usage

## Services RLS hardening

- [x] Migration: enable RLS on public.services
- [x] Policies: officer CRUD where active assignment exists for services.department_id; admin full access
- [ ] Verify officer services CRUD under RLS; failing cases surface insufficient_privilege
- [ ] Update tests to assert RLS behavior (non-assigned mutation blocked)

## Officer appointment lifecycle (SSR-only)

- [x] Actions file: \_actions.ts under /officer/departments/[deptId]/dashboard or per-dept page folder
- [x] markCheckedIn({ id }) with Zod and SSR client; revalidatePath(/officer/departments/${deptId})
- [x] markStarted({ id })
- [x] markCompleted({ id })
- [x] markCancelled({ id })
- [x] markNoShow({ id, value })
- [x] UI: add Actions column with client islands to call actions; disable invalid transitions
- [ ] Tests: officer-appointments-actions.test.ts (happy paths + invalid transition error)
- [ ] Docs: README updates for services RLS and appointment actions

## Officer Appointment Details & Citizen Access

### Plan

- Create officer-readable profile policy: allow officers to SELECT limited citizen profile rows when the citizen has an appointment in a service within the officer's active department assignment.
- Add route: `/officer/departments/[deptId]/appointments/[appointmentId]` (SSR) with guard checks and dept ownership validation.
- Fetch appointment details: status/timestamps, service, citizen minimal profile, and linked documents (titles, mime, size).
- Wire appointment actions (check-in, start, complete, cancel, no-show) on the details page using existing Server Actions; disable invalid actions by state.
- Add Details link from `/officer/departments/[deptId]` table to the details page.
- Tests: guard (wrong dept → /officer), actions happy path, RLS read of citizen profile succeeds only when scoped.

### Database (RLS)

- [x] Policy: `profiles_officer_read_appointments` — officer SELECT where an accessible appointment exists via department assignment.

### Routes and UI

- [x] Add `/officer/departments/[deptId]/appointments/[appointmentId]` details page
- [x] Render Appointment, Citizen, Documents, and Actions sections
- [x] Add Details button in department appointments table

### Validation

- [x] Add `OfficerAppointmentParam` for params validation

### Tests

- [ ] officer-appointment-details-guard.test.ts
- [ ] officer-appointment-actions-on-detail.test.ts

### Docs

- [ ] Update README with details route and RLS scope

## Changelog

- feat(gov-officer): add appointment details page with actions and citizen/documents sections; add RLS policy for officer profile read (scoped)

## Officer Slots (per-service) — New

### Database

- [x] Migration: create public.service_slots table with (id, service_id, slot_at, duration_minutes, capacity, active, created_by, created_at) and unique(service_id, slot_at)
- [x] Indexes: (service_id), (slot_at desc), (service_id, slot_at)
- [x] appointments.slot_id uuid referencing public.service_slots(id) on delete set null
- [x] Enable RLS on service_slots
- [x] Policies: admin full; officer CRUD where active assignment exists for the slot’s service.department_id

### Routes and UI (SSR)

- [x] /officer/departments/[deptId]/services/[serviceId]/slots page.tsx with SSR guards (dept + service belongs to dept)
- [x] Toolbar: date range (default today → +14d), pagination; optional q (future)
- [x] Table: slot_at, duration, capacity, booked_count, active; actions: Edit, Activate/Deactivate, Delete
- [x] Empty-state Card

### Server Actions (SSR-only)

- [x] \_actions.ts with createSlot, updateSlot, toggleSlotActive, deleteSlot
- [x] Zod validation; map Postgres errors; revalidatePath(/officer/departments/${deptId}/services/${serviceId}/slots)

### Components (client islands)

- [x] CreateSlotDialog (slot_at, duration_minutes, capacity)
- [x] EditSlotDialog
- [x] ConfirmToggleActiveDialog
- [x] ConfirmDeleteDialog

### Tests

- [ ] RLS: non-assigned officer mutations return insufficient_privilege
- [ ] Actions: happy-path typed results; unique(service_id, slot_at) → unique_violation
- [ ] Guards: unauthorized/wrong-role/wrong-dept redirect
- [ ] UI: dialogs happy/error paths

### Docs

- [ ] README: slots routes, RLS scope, booked_count logic, revalidation behavior

## Important operating rule

After each change and commit in this task, update apps/civigo-gov/docs/tasks.md: check items done, add discovered subtasks, and append a Changelog bullet with the commit subject.

## Changelog

- docs(gov-officer): add living task board for Officer/Department Dashboard
- feat(gov-officer): sign-in redirects by role (admin→/admin, officer→/officer) with toasts on error/unauthorized
- feat(gov-officer): add requireOfficer() SSR guard helper
- feat(gov-officer): scaffold officer route group (layout, page, actions, components) with SSR guard shell
- fix(gov-guards): redirect officers hitting /admin to /officer; unauthenticated to /sign-in
- feat(gov-officer): show active department in officer topbar; fetch assignments SSR (RLS)
- feat(gov-officer): SSR-load paginated appointments (7d window) for officer landing; render shadcn table
- test(gov-officer): add officer guard and sign-in module tests; docs: add Officer Dashboard section and redirects
- feat(gov-officer): department chooser and per-department dashboard route
- feat(gov-officer/services): add services SSR list, actions, guard, strings, validation, nav link
- feat(gov-officer/services): client dialogs and integration on services page
- chore(gov-officer/services): add Services RLS + appointment lifecycle tasks
- feat(gov-officer/services): add toolbar search & pagination controls on services page
- feat(gov-officer/slots): add service_slots migration + SSR slots page, actions, and create dialog
- feat(gov-officer/slots): add date range filter and wire edit/toggle/delete dialogs
 - fix(gov-officer/slots): batch create converts local date/time to UTC using client offset to avoid timezone drift
 - feat(gov-officer/slots): batch create dialog includes branch dropdown and required validation
