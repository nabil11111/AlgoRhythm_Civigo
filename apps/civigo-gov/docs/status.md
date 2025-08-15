# Civigo‑Gov — Current Status (Functionality and UI)

Last updated: 2025-08-14

## Overview
Civigo‑Gov is a desktop‑first Next.js (App Router) portal for administrators and officers. It uses Supabase Auth with SSR session handling and enforces role/department scoping via RLS and server‑side checks. UI is built with Tailwind and shadcn/ui components; notifications use Sonner.

## Tech stack snapshot
- **Framework**: Next.js 15 (App Router), React 19
- **Auth/DB**: Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **Validation**: Zod
- **UI**: Tailwind CSS v4, shadcn/ui, Radix primitives, Geist fonts, Sonner toasts
- **Testing**: Vitest

## Authentication and guards
- **Sign‑in**: `/(auth)/sign-in` (client component) signs in via Supabase, then reads `public.profiles.role` and redirects:
  - admin → `/admin`
  - officer → `/officer`
  - others → error toast, remain on page
- **Admin guard**: `/(protected)/admin/layout.tsx` requires `role === 'admin'`; redirects officers to `/officer`, unauthenticated to `/sign-in`.
- **Officer guard**: `/(protected)/officer/layout.tsx` requires `role === 'officer'`; redirects admins to `/admin`, unauthenticated to `/sign-in`. Header shows active department context (single dept name or “Multiple (n)”).
- **Server clients**: `getServerClient()` for SSR cookie‑based session; optional `getServiceRoleClient()` for privileged admin operations (never exposed to browser).

## Admin area
- **Shell & nav**: Sidebar layout with links to Dashboard, Departments, Officers; logout via server action.
- **Dashboard**: `/admin` — simple links to management sections.
- **Departments**: `/admin/departments`
  - SSR list with pagination (default 20, max 50)
  - Table columns: code, name, actions (Edit, Delete)
  - Dialogs: create, edit, confirm delete
- **Officers**: `/admin/officers`
  - SSR list with pagination
  - Shows name, email, current assignments (badges), and actions:
    - Add officer profile (optional temp password)
    - Assign department
    - Toggle assignment active/inactive per department
    - Reset password per officer

## Officer area
- **Landing**: `/officer`
  - Fetches active department assignments; auto‑redirects to the single department if exactly one; otherwise lists departments as cards with “Open”.
- **Department dashboard**: `/officer/departments/[deptId]`
  - Validates `deptId` and ensures active assignment for the officer
  - SSR table of appointments (scoped by service.department_id)
  - Columns: reference, service, when, status, actions
  - Actions (server‑side): Check‑in, Start, Complete, Cancel, No‑show; revalidates the page on success
- **Services (per department)**: `/officer/departments/[deptId]/services`
  - Guarded by officer + active assignment
  - SSR list with search `?q=` on code/name and pagination controls
  - Actions: Create, Edit, Delete service (server actions with Zod validation and error mapping)
  - Link to Slots per service
- **Slots (per service)**: `/officer/departments/[deptId]/services/[serviceId]/slots`
  - Verifies service belongs to the department and officer has active assignment
  - Filters: optional `from`/`to` ISO range (defaults to today → +14d), pagination
  - Columns: when, duration, capacity, booked (derived), active, actions
  - Actions: Create, Batch create, Edit, Toggle Active, Delete (all server actions)

## Data, security, and RLS
- All officer routes fetch via SSR using the logged‑in session and are scoped by department assignment.
- Admin routes use SSR; some pages may use a server‑side client configured with the service role key for privileged reads/writes.
- Validation across actions uses Zod; Postgres errors are mapped to typed results and friendly messages.

## UI system
- **Design primitives**: `button`, `badge`, `card`, `dialog`, `dropdown-menu`, `form`, `input`, `label`, `select`, `switch`, `table` under `src/components/ui/`.
- **Notifications**: Sonner `Toaster` mounted in root layout; actions and error states use toasts.
- **Layout**: Desktop‑first; Admin uses left sidebar; Officer uses top bar with department context.
- **Typography**: Geist Sans/Mono via next/font; global Tailwind styles in `globals.css`.

## Tests discovered (Vitest)
- Guards and auth: `admin-guard.test.ts`, `officer-guard.test.ts`, `sign-in-redirect.test.ts`
- Officer flows: `officer-landing.test.ts`, `officer-department-guard.test.ts`
- Services: `officer-services-actions.test.ts`, `officer-services-guard.test.ts`
- Admin actions: `departments-actions.test.ts`, `officers-actions.test.ts`
- Utilities: `server-utils.test.ts`

Note: Test results not executed here; presence indicates coverage, but some tests may still be incomplete.

## Known gaps and TODOs (from docs/tasks.md and code review)
- Services RLS: verification of officer CRUD under RLS and corresponding failing‑case tests.
- Appointments lifecycle: add tests for invalid transitions and error handling.
- Slots: add RLS/guards/UI dialog error‑case tests; README/docs updates for slots and appointment actions.
- Documentation: README updates for services/slots scopes, pagination/search, and action semantics.

## UX observations
- Consistent table + dialog patterns; clear primary/secondary actions.
- Search and pagination are server‑side; URLs are shareable.
- Empty states provided for most lists.
- Basic a11y labels on form fields; further aria improvements could be added around dialog focus management if needed (Radix primitives already help).

## Quick start prerequisites
- `.env.local` requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; optional `SUPABASE_SERVICE_ROLE_KEY` for admin flows.
- First admin can be provisioned via Supabase Studio and a row in `public.profiles` with `role='admin'` (see README).


