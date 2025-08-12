# Civigo-Gov Admin Module

## Admin Guard and Shell

- Guard lives at `src/app/(protected)/admin/layout.tsx`.
- Uses Supabase SSR (`@supabase/ssr`) to read session via cookies.
- Loads `public.profiles` for the current user and requires `role === 'admin'`.
- Redirects unauthenticated users to `/(auth)/sign-in` and non-admins to `/`.

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

## Server Actions

- Implemented in route-level `_actions.ts` files using Zod validation and Supabase SSR client.
- Actions return `{ ok: true, data }` or `{ ok: false, error, message? }`.

## UI

- Desktop-first layout with Tailwind.
- shadcn/ui components recommended (Dialog/Form/Table/etc.). For MVP, basic inputs/buttons are used; can be upgraded easily.

## Tests

- `tests/admin-guard.test.ts` – ensures guard helper is present; expand to full integration with Next test runner later.
