Citizen-facing app for Civigo. SSR-first with Supabase auth and RLS. Booking flow is slot-driven using `service_slots`.

Routes:

- `/(auth)/sign-in`, `/(auth)/sign-up`
- `/(protected)/app` (browse departments)
- `/(protected)/app/departments/[id]` (services in department)
- `/(protected)/app/services/[id]` (slots + booking)
- `/(protected)/app/appointments` (list)
- `/(protected)/app/appointments/[id]` (detail)

Standards:

- SSR auth via `@supabase/ssr` with cookie adapter.
- No service-role in browser; privileged ops in Server Actions.
- Zod validation; shadcn/ui basics; `sonner` Toaster in root layout.
- Use literal URLs in `revalidatePath`.

RLS notes:

- `appointments` self-only policies; `departments/services` readable.
- Slots are read from `service_slots` where `active=true` and `slot_at>=now()`.

Setup:

1) Add env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and optionally `SUPABASE_SERVICE_ROLE_KEY` for server).
2) Install and run: `npm i` then `npm run dev`.
