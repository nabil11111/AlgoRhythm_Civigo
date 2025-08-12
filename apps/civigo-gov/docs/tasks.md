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
