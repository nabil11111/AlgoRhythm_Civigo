# Civigo-Gov Admin Module

## Admin Guard and Shell

- Guard lives at `src/app/(protected)/admin/layout.tsx`.
- Uses Supabase SSR (`@supabase/ssr`) to read session via cookies.
- Loads `public.profiles` for the current user and requires `role === 'admin'`.
- Redirects unauthenticated users to `/(auth)/sign-in` and officers to `/officer`.

## Required Environment Variables

Set in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=<your-local-or-remote-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Server-only (optional, never exposed to browser):

```
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

## Creating the First Admin

1. In Supabase Studio, create an auth user (email/password or magic link).
2. Insert a row into `public.profiles` with the same `auth.users.id` and `role = 'admin'`.
3. (Recommended for RLS) Add `{ "role": "admin" }` to the user's `app_metadata` so the JWT includes the `role` claim used by policies.

## Admin Routes

- `/(protected)/admin` – dashboard placeholder
- `/(protected)/admin/departments` – CRUD for departments
- `/(protected)/admin/officers` – list officers and manage department assignments

## Officer Dashboard

- Guard lives at `src/app/(protected)/officer/layout.tsx`.
- Uses Supabase SSR (`@supabase/ssr`) via `getProfile()` to require `role === 'officer'`.
- Redirects unauthenticated users to `/(auth)/sign-in` and admins to `/admin`.
- Landing route: `/(protected)/officer` (server component) shows a paginated 7‑day window of appointments (RLS-scoped).
- Topbar shows the officer's active department (based on `public.officer_assignments`).
- Client interactivity uses shadcn/ui and sonner; Toaster is mounted in root layout.

### Redirect behavior (shared sign-in)

- Shared sign-in at `/(auth)/sign-in` fetches `public.profiles.role` after session:
  - `admin` → `/admin`
  - `officer` → `/officer`
  - other → toast error and stay on page

## Server Actions

- Implemented in route-level `_actions.ts` files using Zod validation and Supabase SSR client.
- Actions return `{ ok: true, data }` or `{ ok: false, error, message? }`.

## UI

- Desktop-first layout with Tailwind.
- shadcn/ui components used for Dialog/Form/Table/etc.

### UI components (shadcn/ui)

- Generated components under `src/components/ui`:
  `button, input, label, select, dialog, table, form, badge, switch, toast, toaster, dropdown-menu, card`.
- Toaster is mounted in `src/app/layout.tsx`.

## Pagination

- Defaults: `page=1`, `pageSize=20`, max page size `50`.
- Helpers in `src/lib/pagination.ts` and pager controls on `/admin/departments` and `/admin/officers`.

## Tests

- Example tests under `apps/civigo-gov/tests/*` using Vitest with simple module mocks.
- Suggested dev deps: `vitest @testing-library/react @testing-library/jest-dom jsdom whatwg-fetch`.
- Run with: `npx vitest`.

## Admin-side password management (Officers)

- When creating an officer, admins can set an optional temporary password in the "Add Officer Profile" dialog.
- If the email does not exist in Supabase Auth, the user is created with `email_confirm: true` and the temporary password.
- If the auth user already exists, admins can reset the password from the Officers list via the "Reset password" action.
- Security: Temporary passwords are not logged or echoed. Share securely and rotate promptly.
