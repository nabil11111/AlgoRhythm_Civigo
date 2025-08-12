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
- [ ] Keep SSR guards as the source of truth.

## Officer route group (scaffold)

- [x] Create app/(protected)/officer/layout.tsx with SSR guard (role === 'officer'); redirect unauthenticated → /(auth)/sign-in; admin → /admin.
- [x] Create app/(protected)/officer/page.tsx (landing).
- [x] Create app/(protected)/officer/_actions.ts (placeholder; no mutations yet).
- [x] Create app/(protected)/officer/_components/DepartmentHeader.tsx (Server).
- [x] Create app/(protected)/officer/_components/AppointmentsTable.tsx (Server; shadcn Table).
- [x] Create app/(protected)/officer/_components/ToastBridge.tsx (Client; sonner).

## Data fetching (SSR, RLS-safe; no service-role)

- [x] Helper requireOfficer() in src/utils/supabase/server.ts (or auth-guard util).
- [ ] Query officer assignments (active) for current user.
- [ ] Query paginated appointments (default: today → +7d), with service and citizen fields needed for table.

## UI/UX (shadcn + sonner)

- [ ] Topbar with active department badge and logout.
- [ ] Table with columns: reference_code, citizen (masked), service, appointment_at, status.
- [ ] Empty-state card.

## Routing and guards symmetry

- [x] Visiting /admin as officer redirects to /officer (adjust admin guard).
- [x] Visiting /officer as admin redirects to /admin.

## Tests

- [ ] tests/officer-guard.test.ts (unauthenticated → sign-in; admin → /admin; officer → OK).
- [ ] tests/sign-in-redirect.test.ts (role-based redirect).
- [ ] tests/pagination.test.ts (optional).

## Docs

- [ ] Update apps/civigo-gov/README.md with Officer Dashboard section and redirects.

## Important operating rule

After each change and commit in this task, update apps/civigo-gov/docs/tasks.md: check items done, add discovered subtasks, and append a Changelog bullet with the commit subject.

## Changelog

- docs(gov-officer): add living task board for Officer/Department Dashboard
- feat(gov-officer): sign-in redirects by role (admin→/admin, officer→/officer) with toasts on error/unauthorized
- feat(gov-officer): add requireOfficer() SSR guard helper
- feat(gov-officer): scaffold officer route group (layout, page, actions, components) with SSR guard shell
- fix(gov-guards): redirect officers hitting /admin to /officer; unauthenticated to /sign-in
