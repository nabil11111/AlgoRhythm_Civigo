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
- [x] Create app/(protected)/officer/_actions.ts (placeholder; no mutations yet).
- [x] Create app/(protected)/officer/_components/DepartmentHeader.tsx (Server).
- [x] Create app/(protected)/officer/_components/AppointmentsTable.tsx (Server; shadcn Table).
- [x] Create app/(protected)/officer/_components/ToastBridge.tsx (Client; sonner).

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
- [x] _actions.ts with createService, updateService, deleteService
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

- [x] Actions file: _actions.ts under /officer/departments/[deptId]/dashboard or per-dept page folder
- [x] markCheckedIn({ id }) with Zod and SSR client; revalidatePath(/officer/departments/${deptId})
- [x] markStarted({ id })
- [x] markCompleted({ id })
- [x] markCancelled({ id })
- [x] markNoShow({ id, value })
- [x] UI: add Actions column with client islands to call actions; disable invalid transitions
- [ ] Tests: officer-appointments-actions.test.ts (happy paths + invalid transition error)
- [ ] Docs: README updates for services RLS and appointment actions

## Officer Slots (per-service) — New

### Database
- [x] Migration: create public.service_slots table with (id, service_id, slot_at, duration_minutes, capacity, active, created_by, created_at) and unique(service_id, slot_at)
- [x] Indexes: (service_id), (slot_at desc), (service_id, slot_at)
- [x] appointments.slot_id uuid referencing public.service_slots(id) on delete set null
- [x] Enable RLS on service_slots
- [x] Policies: admin full; officer CRUD where active assignment exists for the slot’s service.department_id

### Routes and UI (SSR)
- [x] /officer/departments/[deptId]/services/[serviceId]/slots page.tsx with SSR guards (dept + service belongs to dept)
- [~] Toolbar: date range (default today → +14d), pagination; optional q (future)
- [x] Table: slot_at, duration, capacity, booked_count, active; actions: Edit, Activate/Deactivate, Delete
- [x] Empty-state Card

### Server Actions (SSR-only)
- [x] _actions.ts with createSlot, updateSlot, toggleSlotActive, deleteSlot
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
