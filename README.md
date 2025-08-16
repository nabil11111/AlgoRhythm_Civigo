## Civigo Monorepo

Next.js monorepo with two apps and a self‑hosted Supabase stack:

- `apps/civigo-citizen`: citizen-facing app (mobile-first)
- `apps/civigo-gov`: officer/admin portal (desktop-first)
- `supabase`: local Supabase stack, SQL migrations, RLS
- `docker`: Kong gateway config used by Supabase local

This README gives multiple setup paths so you can pick what works on your machine. If one path fails, try the alternatives below.

## Prerequisites

- Node.js 20.x and npm 10.x (or newer)
- Docker Desktop (only if you want to run the apps via `docker-compose`)
- Supabase CLI (`brew install supabase/tap/supabase` on macOS)
- Bash tools for the helper script: `curl`, `jq`, `awk`, `sed`, `tr`, `grep`, `cut`, `tail`

Useful local ports used:

- Citizen app: `http://localhost:3000`
- Gov app: `http://localhost:3001` (this is important to run in the 3001 port )
- Supabase API: `http://localhost:54321`
- Supabase DB: `localhost:54322`
- Supabase Studio: `http://localhost:54323`
- Inbucket (local email viewer): `http://localhost:54324`

## Environment variables

Both apps need these to connect to Supabase:

- `NEXT_PUBLIC_SUPABASE_URL` (default local: `http://localhost:54321`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon JWT)

Server-side tasks (optional, but recommended for admin features and notification logging):

- `SUPABASE_SERVICE_ROLE_KEY` (service_role JWT)

Email (optional; only for sending real emails from the gov app):

- `RESEND_API_KEY`

You can copy the anon and service role keys from `docker/kong/kong.yml`:

- anon: the value under `consumers: - username: anon -> keyauth_credentials -> key`
- service_role: under `consumers: - username: service_role -> keyauth_credentials -> key`

Tip: create `.env.local` in each app directory:

```bash
# apps/civigo-citizen/.env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste anon key>
SUPABASE_SERVICE_ROLE_KEY=<paste service role key>
```

```bash
# apps/civigo-gov/.env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste anon key>
SUPABASE_SERVICE_ROLE_KEY=<paste service role key>
RESEND_API_KEY=<optional resend api key>
```

If `localhost` gives issues, try `http://127.0.0.1:54321` for `NEXT_PUBLIC_SUPABASE_URL`.

## Option A — Recommended local setup (Supabase CLI + run apps locally)

1. Start Supabase locally (runs DB, API, Studio, Kong, etc.)

```bash
npm run supabase:start
# or manually: cd supabase && supabase start
```

2. Configure env vars (see section above). At minimum set the anon key.

3. Install deps and run the citizen app:

```bash
cd apps/civigo-citizen
npm ci
npm run dev
# opens http://localhost:3000
```

4. Install deps and run the gov app:

```bash
cd apps/civigo-gov
npm ci
npm run dev
# opens http://localhost:3001
```

5. (Optional) Seed test users via Supabase Admin API:

```bash
# In repo root
./scripts/create_users.sh
# Creates admin@civigo.local, officer@civigo.local, citizen@civigo.local
# Default password: 12345678
```

## Option B — Run the apps via Docker (still uses Supabase CLI locally)

This runs only the Next.js apps in containers; Supabase still runs via the CLI.

1. Start Supabase:

```bash
npm run supabase:start
```

2. Export env vars in your shell (so `docker-compose` can pass them):

```bash
export NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
export NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste anon key>
export RESEND_API_KEY=<optional>
```

3. Start the apps:

```bash
docker-compose up -d civigo-citizen civigo-gov
# Citizen: http://localhost:3000, Gov: http://localhost:3001
```

To stop:

```bash
docker-compose down
npm run supabase:stop
```

## Option C — Minimal quickstart (one app at a time)

If you only need the citizen app for now:

```bash
npm run supabase:start
cd apps/civigo-citizen
npm ci
echo "NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon>" >> .env.local
npm run dev
```

## Running tests, lint, and typecheck

- Citizen app:
  - tests: `cd apps/civigo-citizen && npm test`
  - lint: `npm run lint`
  - typecheck: `npm run build`
- Gov app:
  - tests: `cd apps/civigo-gov && npm test` (or `npm run test:watch`)
  - lint: `npm run lint`
  - typecheck: `npm run build`

Optional local reminder scheduler (gov app):

```bash
cd apps/civigo-gov
npm run reminders
# Calls http://localhost:3001/api/send-reminders every minute
```

## Database, migrations, and seeds

- SQL migrations live in `supabase/migrations`. The stack is configured to apply migrations. Seeds are embedded in the migrations (no standalone `seed.sql` checked in).
- To rebuild the local database from scratch (DANGEROUS — wipes data):

```bash
cd supabase
supabase db reset
```

If `supabase db reset` complains about a missing `./seed.sql` (configured in `supabase/config.toml`):

- EITHER create an empty file at `supabase/seed.sql` and rerun,
- OR temporarily set `[db.seed].enabled = false` or remove `sql_paths` in `supabase/config.toml` and rerun,
- OR avoid reset and just run `npm run supabase:start`, then seed users with `./scripts/create_users.sh`.

## Sample users (for local dev)

Run `./scripts/create_users.sh` after Supabase is up. It creates:

- admin: `admin@civigo.local` / `12345678`
- officer: `officer@civigo.local` / `12345678`
- citizen: `citizen@civigo.local` / `12345678` (with NIC `912345678V`)

## Troubleshooting

- CORS/auth issues: ensure `NEXT_PUBLIC_SUPABASE_URL` matches the local Supabase gateway (`http://localhost:54321`). If you still see issues, try `http://127.0.0.1:54321`.
- Cookies not persisting: run apps on their default ports (`3000` and `3001`) and avoid mixing multiple base URLs.
- Ports already in use: stop other Next.js instances or change ports via `PORT` envs when running (`PORT=3005 npm run dev`). If you change ports, update Supabase `auth.site_url` in `supabase/config.toml` or keep the defaults for local.
- Keys missing: copy anon and service role keys from `docker/kong/kong.yml` as described above.
- Emails don’t send: set `RESEND_API_KEY` (gov app). For local testing you can rely on Supabase’s Inbucket (`http://localhost:54324`) for auth emails.

## Useful root scripts

```bash
# Start/stop Supabase local stack
npm run supabase:start
npm run supabase:stop

# Run apps without Docker
npm run web:citizen
npm run web:gov
```

## Project structure

```text
apps/
  civigo-citizen/     # Next.js citizen app
  civigo-gov/         # Next.js gov/officer app
supabase/             # Local Supabase stack, migrations, config
docker/               # Kong config used by Supabase local
scripts/              # Helper scripts (e.g., create_users.sh)
```

## Contribution/process notes

- Create a branch per task and use Conventional Commits (e.g., `feat(citizen-booking): ...`).
- Add/modify SQL only under `supabase/migrations`. Do not place migration SQL elsewhere.
- Before opening a PR: run typecheck, lint, and tests in both apps.
