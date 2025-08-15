## Gov ID–centric citizen onboarding: plan, stubs, and diffs

Scope: apps `civigo-citizen`, `civigo-gov`, and `supabase` (DB + Storage). SSR-first; no service-role in browser. RLS enforced end-to-end.

Monorepo impact (per 60-monorepo-scope)

- Affected:
  - apps/civigo-citizen: new `/(auth)/onboarding` flow (NIC → phone → OTP → names → password → NIC photos → face scan → finalize)
  - apps/civigo-gov: new Admin review screens for identity verifications
  - supabase: new columns, tables, policies, RPC update, storage bucket
- Risks: RLS correctness for new tables; storage privacy; legacy users without `gov_id` (backfill/derive); booking/doc queries dual-keying (user id + gov_id) during migration
- Rollout: additive DB changes; backfill; code reads prefer `gov_id` when present; feature flag for manual review

---

### Step 1 — Current state (read-only inventory)

DB schema (from `supabase/supabase/migrations`)

- tables
  - `public.profiles`
    - columns: `id uuid PK → auth.users(id)`, `role text check in ('citizen','officer','admin') default 'citizen'`, `full_name text`, `email text unique`, `nic text unique`, `verified_status text default 'unverified'`, `phone text`, `created_at timestamptz default now()`
    - trigger: `handle_new_auth_user()` inserts a profile on auth user creation (008)
  - `public.appointments`
    - columns: `id uuid PK default gen_random_uuid()`, `citizen_id uuid not null → profiles(id)`, `service_id uuid → services(id)`, `assigned_officer_id uuid → profiles(id) null`, `appointment_at timestamptz not null`, `status text check in ('booked','cancelled','completed') default 'booked'`, lifecycle timestamps, `no_show boolean default false`, `created_at timestamptz default now()`, `reference_code text generated always (substr(md5(id::text),1,10)) unique`, `slot_id uuid → service_slots(id)` (006)
  - `public.documents`
    - columns: `id uuid PK default gen_random_uuid()`, `owner_user_id uuid not null → profiles(id)`, `title text not null`, `storage_path text not null unique`, `mime_type text`, `size_bytes bigint`, `expires_at timestamptz`, `created_at timestamptz default now()`
  - `public.appointment_documents`: join (id PK, appointment_id → appointments, document_id → documents, unique(appointment_id, document_id))
  - `public.notifications`: id PK, `user_id → profiles(id)`, `appointment_id → appointments(id)`, `channel`,`type`,`status`,`sent_at`,`payload`,`created_at`
  - No existing verification tables
- indexes
  - `profiles`: unique(email), unique(nic)
  - `appointments`: on citizen_id, service_id, assigned_officer_id, appointment_at, (service_id, appointment_at), status
  - `documents`: on owner_user_id
  - `service_slots`: indices as per (006)
- RLS policies (003)
  - `profiles`: self-select or admin; admin-update; (self-insert policy defined in 008). Officers have no special read.
  - `appointments`: citizen self select/insert/update (citizen_id = auth.uid()); officer scoped read/update by department assignment; admin all
  - `documents`: owner select/insert/update (owner_user_id = auth.uid()); admin all; officer read via `appointment_documents` scope
  - `appointment_documents`, `appointment_feedback`, `notifications`: self/admin patterns; officer read scoped where applicable

Citizen app routes and server actions

- `/(auth)/sign-in` and `/(auth)/sign-up` client pages; sign-up uses Supabase password auth; no custom profile writes in-app (profile row created by DB trigger 008)
- `/(protected)/layout.tsx` enforces SSR auth + role guard (`citizen`)
- Booking server action: `/(protected)/app/services/[id]/_actions.ts` → `createAppointmentFromSlot` uses RPC `book_appointment_slot` (009) or fallback guarded insert; inserts `appointments.citizen_id = profile.id`
- No identity verification/onboarding flow present

---

### Step 2 — Proposed DB changes (migrations) with RLS

New columns and functions

```sql
-- 013_gov_id_core.sql
BEGIN;

-- 1) Function stub to generate Gov ID from NIC (implementation can evolve; stub returns NIC)
create or replace function public.generate_gov_id(p_nic text)
returns text
language plpgsql
as $$
begin
  -- TODO: implement format, checksum, or namespace encoding; for now, passthrough
  return nullif(trim(p_nic), '');
end;
$$;

-- 2) profiles.gov_id
do $$ begin
  alter table public.profiles add column if not exists gov_id text;
exception when duplicate_column then null; end $$;

create unique index if not exists idx_profiles_gov_id_unique on public.profiles(gov_id) where gov_id is not null;

COMMIT;
```

Verification tables

```sql
-- 014_identity_verification.sql
BEGIN;

-- status enum
do $$ begin
  create type public.identity_verification_status as enum ('pending','verified','rejected');
exception when duplicate_object then null; end $$;

-- phone verifications
create table if not exists public.phone_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  phone text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- identity verifications
create table if not exists public.identity_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  nic text not null,
  nic_front_path text,
  nic_back_path text,
  face_capture_path text,
  status public.identity_verification_status not null default 'pending',
  score numeric,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- indexes
create index if not exists idx_phone_verifications_user_id on public.phone_verifications(user_id);
create index if not exists idx_identity_verifications_user_id on public.identity_verifications(user_id);
create index if not exists idx_identity_verifications_status on public.identity_verifications(status);

-- RLS
alter table if exists public.phone_verifications enable row level security;
alter table if exists public.identity_verifications enable row level security;

-- owner can read own minimal metadata; cannot read others
drop policy if exists phone_verifications_self_select on public.phone_verifications;
create policy phone_verifications_self_select on public.phone_verifications
for select using (user_id = auth.uid());

drop policy if exists phone_verifications_self_insert on public.phone_verifications;
create policy phone_verifications_self_insert on public.phone_verifications
for insert with check (user_id = auth.uid());

drop policy if exists phone_verifications_self_update on public.phone_verifications;
create policy phone_verifications_self_update on public.phone_verifications
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- identity verifications policies
drop policy if exists idv_self_select on public.identity_verifications;
create policy idv_self_select on public.identity_verifications
for select using (user_id = auth.uid());

drop policy if exists idv_self_insert on public.identity_verifications;
create policy idv_self_insert on public.identity_verifications
for insert with check (user_id = auth.uid());

drop policy if exists idv_self_update on public.identity_verifications;
create policy idv_self_update on public.identity_verifications
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- admin full access
drop policy if exists idv_admin_all on public.identity_verifications;
create policy idv_admin_all on public.identity_verifications
for all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');

COMMIT;
```

Storage bucket and policies

```sql
-- 015_nic_media_storage.sql
BEGIN;

-- bucket
insert into storage.buckets (id, name, public)
values ('nic-media', 'nic-media', false)
on conflict (id) do nothing;

-- Enable RLS on storage.objects (global)
alter table if exists storage.objects enable row level security;

-- Paths: nic-media/user/{auth.uid()}/...
drop policy if exists nic_media_owner_rw on storage.objects;
create policy nic_media_owner_rw on storage.objects
for all
using (
  bucket_id = 'nic-media'
  and (storage.foldername(name))[1] = 'user'
  and (storage.foldername(name))[2]::uuid = auth.uid()
)
with check (
  bucket_id = 'nic-media'
  and (storage.foldername(name))[1] = 'user'
  and (storage.foldername(name))[2]::uuid = auth.uid()
);

-- Admin read
drop policy if exists nic_media_admin_read on storage.objects;
create policy nic_media_admin_read on storage.objects
for select using (bucket_id = 'nic-media' and public.current_app_role() = 'admin');

COMMIT;
```

Appointments/documents dual-keying

```sql
-- 016_gov_id_dual_key.sql
BEGIN;

-- documents.owner_gov_id (indexed)
do $$ begin
  alter table public.documents add column if not exists owner_gov_id text;
exception when duplicate_column then null; end $$;
create index if not exists idx_documents_owner_gov_id on public.documents(owner_gov_id);

-- appointments.citizen_gov_id (indexed)
do $$ begin
  alter table public.appointments add column if not exists citizen_gov_id text;
exception when duplicate_column then null; end $$;
create index if not exists idx_appointments_citizen_gov_id on public.appointments(citizen_gov_id);

COMMIT;
```

Backfill stubs

```sql
-- 017_gov_id_backfill.sql
BEGIN;

-- profiles.gov_id from NIC
update public.profiles p
set gov_id = public.generate_gov_id(p.nic)
where p.gov_id is null and p.nic is not null;

-- appointments.citizen_gov_id by joining profiles
update public.appointments a
set citizen_gov_id = p.gov_id
from public.profiles p
where a.citizen_id = p.id and a.citizen_gov_id is null and p.gov_id is not null;

-- documents.owner_gov_id by joining profiles
update public.documents d
set owner_gov_id = p.gov_id
from public.profiles p
where d.owner_user_id = p.id and d.owner_gov_id is null and p.gov_id is not null;

COMMIT;
```

RLS notes

- `profiles`: existing self/admin policies already block officers; we will continue selecting only minimal fields in app queries for citizens
- `identity_verifications` and `phone_verifications`: owner read/write; admin all; officers none by default
- `storage` (`nic-media`): owner RW via path prefix; admin read; officers no access by default; access via signed URLs only from server actions

---

### Step 3 — Citizen onboarding routes and Server Actions (stubs)

Route group: `apps/civigo-citizen/src/app/(auth)/onboarding/*`

- All writes via Server Actions; SSR pages orchestrate steps; client components only for form interactivity/uploads
- Use `sonner` for UX; keep PII out of logs/toasts

Schemas and shared types

```ts
// apps/civigo-citizen/src/app/(auth)/onboarding/_schemas.ts
import { z } from "zod";

export const NicSchema = z.object({ nic: z.string().trim().min(5).max(20) });
export const PhoneSchema = z.object({
  phone: z.string().trim().min(9).max(20),
});
export const OtpSchema = z.object({
  phone: z.string(),
  otp: z.string().length(6),
});
export const NamesSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
});
export const PasswordSchema = z.object({ password: z.string().min(6) });

export type NicInput = z.infer<typeof NicSchema>;
export type PhoneInput = z.infer<typeof PhoneSchema>;
export type OtpInput = z.infer<typeof OtpSchema>;
export type NamesInput = z.infer<typeof NamesSchema>;
export type PasswordInput = z.infer<typeof PasswordSchema>;

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
```

Server Actions (one file or per-step)

```ts
// apps/civigo-citizen/src/app/(auth)/onboarding/_actions.ts
"use server";
import { revalidatePath } from "next/cache";
import {
  NicSchema,
  PhoneSchema,
  OtpSchema,
  NamesSchema,
  PasswordSchema,
  type ActionResult,
} from "./_schemas";
import { getServerClient } from "@/utils/supabase/server";

export async function reserveNic(
  raw: unknown
): Promise<ActionResult<{ nic: string }>> {
  const input = NicSchema.safeParse(raw);
  if (!input.success) return { ok: false, error: "invalid" } as const;
  const supabase = await getServerClient();
  const { data: exists } = await supabase
    .from("profiles")
    .select("id")
    .eq("nic", input.data.nic)
    .maybeSingle();
  if (exists) return { ok: false, error: "nic_already_registered" } as const;
  return { ok: true, data: { nic: input.data.nic } } as const;
}

export async function sendOtp(
  raw: unknown
): Promise<ActionResult<{ sent: boolean }>> {
  const input = PhoneSchema.safeParse(raw);
  if (!input.success) return { ok: false, error: "invalid" } as const;
  const supabase = await getServerClient();
  // Generate OTP server-side, hash it, store in phone_verifications
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const encoder = new TextEncoder();
  const buf = Buffer.from(encoder.encode(otp));
  const otpHash = buf.toString("hex"); // placeholder; replace with secure hash (e.g., sha256)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const { data: auth } = await (await getServerClient()).auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return { ok: false, error: "not_authenticated" } as const;
  await supabase
    .from("phone_verifications")
    .insert({
      user_id: userId,
      phone: input.data.phone,
      otp_hash: otpHash,
      expires_at: expiresAt,
    });
  // Send SMS via provider (stub)
  return { ok: true, data: { sent: true } } as const;
}

export async function verifyOtp(
  raw: unknown
): Promise<ActionResult<{ verified: boolean }>> {
  const input = OtpSchema.safeParse(raw);
  if (!input.success) return { ok: false, error: "invalid" } as const;
  const supabase = await getServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return { ok: false, error: "not_authenticated" } as const;
  const { data: record } = await supabase
    .from("phone_verifications")
    .select("id, otp_hash, expires_at")
    .eq("user_id", userId)
    .eq("phone", input.data.phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!record) return { ok: false, error: "otp_invalid" } as const;
  // Compare hashes (stub)
  const encoder = new TextEncoder();
  const buf = Buffer.from(encoder.encode(input.data.otp));
  const otpHash = buf.toString("hex");
  if (otpHash !== record.otp_hash || new Date(record.expires_at) < new Date()) {
    return { ok: false, error: "otp_invalid" } as const;
  }
  await supabase
    .from("phone_verifications")
    .update({ verified_at: new Date().toISOString() })
    .eq("id", record.id);
  return { ok: true, data: { verified: true } } as const;
}

export async function saveNames(
  raw: unknown
): Promise<ActionResult<{ ok: true }>> {
  const input = NamesSchema.safeParse(raw);
  if (!input.success) return { ok: false, error: "invalid" } as const;
  const supabase = await getServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return { ok: false, error: "not_authenticated" } as const;
  await supabase
    .from("profiles")
    .update({ full_name: `${input.data.first_name} ${input.data.last_name}` })
    .eq("id", userId);
  return { ok: true, data: { ok: true } } as const;
}

export async function setPassword(
  raw: unknown
): Promise<ActionResult<{ ok: true }>> {
  const input = PasswordSchema.safeParse(raw);
  if (!input.success) return { ok: false, error: "invalid" } as const;
  const supabase = await getServerClient();
  // If user exists, update password; else create account flow would have created via sign-up
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "not_authenticated" } as const;
  // Note: use auth.admin service on server-only if needed; otherwise users can update own password via session
  const { error } = await supabase.auth.updateUser({
    password: input.data.password,
  });
  if (error) return { ok: false, error: "failed" } as const;
  return { ok: true, data: { ok: true } } as const;
}

export async function submitIdentityMedia(params: {
  nic: string;
  nic_front_path: string;
  nic_back_path: string;
  face_capture_path: string;
}): Promise<ActionResult<{ idv_id: string }>> {
  const supabase = await getServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return { ok: false, error: "not_authenticated" } as const;
  const { data, error } = await supabase
    .from("identity_verifications")
    .insert({
      user_id: userId,
      nic: params.nic,
      nic_front_path: params.nic_front_path,
      nic_back_path: params.nic_back_path,
      face_capture_path: params.face_capture_path,
      status: "pending",
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: "failed" } as const;
  return { ok: true, data: { idv_id: (data as any).id as string } } as const;
}

export async function finalizeGovId(params: {
  nic: string;
}): Promise<ActionResult<{ gov_id: string }>> {
  const supabase = await getServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return { ok: false, error: "not_authenticated" } as const;
  // Generate gov_id in DB to avoid PII in logs
  const { data: prof } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (!prof) return { ok: false, error: "not_found" } as const;
  // Stub: compute via DB function; result handling simplified for docs
  await supabase.rpc("generate_gov_id", { p_nic: params.nic } as any);
  await supabase
    .from("profiles")
    .update({
      gov_id: params.nic ? params.nic : null,
      verified_status:
        process.env.GOVID_MANUAL_REVIEW === "true" ? "pending" : "verified",
    })
    .eq("id", userId);
  revalidatePath("/app");
  return { ok: true, data: { gov_id: params.nic } } as const;
}
```

Pages structure (SSR-first; client islands where needed for file inputs):

- `enter-nic/page.tsx` → form posts to `reserveNic`
- `phone/page.tsx` → form posts to `sendOtp`
- `verify-otp/page.tsx` → form posts to `verifyOtp`
- `names/page.tsx` → form posts to `saveNames`
- `set-password/page.tsx` → form posts to `setPassword`
- `upload-nic-photos/page.tsx` → client upload to `nic-media/user/{auth.uid()}/...` via signed URLs issued by a Server Action; then call `submitIdentityMedia`
- `face-scan/page.tsx` → similar upload to bucket; metadata saved via `submitIdentityMedia`
- `finalize/page.tsx` → posts to `finalizeGovId`

Note: For uploads, generate signed upload URLs server-side; store only paths in DB; do not expose bucket read; render via server-only signed URLs when needed.

---

### Step 4 — Admin review (gov app)

Admin UI (apps/civigo-gov)

- `/admin/identity-verifications` list pending with columns: user, nic, created_at, score, status
- Actions: Approve → set `status='verified'`, `reviewed_by`, `reviewed_at`; if `profiles.gov_id` not set, compute via `generate_gov_id(nic)` and set `profiles.verified_status='verified'`
- Reject → set `status='rejected'`, store `reviewed_*`; `profiles.verified_status='unverified'`

Server Action stub

```ts
// apps/civigo-gov/src/app/(admin)/identity-verifications/_actions.ts
"use server";
import { getServerClient } from "@/utils/supabase/server";

export async function reviewIdentity(
  idvId: string,
  action: "approve" | "reject"
) {
  const supabase = await getServerClient();
  // Ensure admin via SSR guards
  const { data: idv } = await supabase
    .from("identity_verifications")
    .select("id, user_id, nic")
    .eq("id", idvId)
    .maybeSingle();
  if (!idv) return { ok: false as const, error: "not_found" };
  const status = action === "approve" ? "verified" : "rejected";
  await supabase
    .from("identity_verifications")
    .update({
      status,
      reviewed_by: (await supabase.auth.getUser()).data.user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", idvId);
  if (action === "approve") {
    // set gov_id if missing (simplified for docs)
    await supabase.rpc("generate_gov_id", { p_nic: idv.nic } as any);
    await supabase
      .from("profiles")
      .update({ gov_id: idv.nic, verified_status: "verified" })
      .eq("id", idv.user_id);
  }
  return { ok: true as const };
}
```

RLS: enforced by table policies; UI access additionally SSR-guarded by admin role.

---

### Step 5 — Update bookings/documents to use gov_id

DB: extend RPC and fallback insert to persist `citizen_gov_id`

```sql
-- 018_book_appointment_gov_id.sql
BEGIN;

create or replace function public.book_appointment_slot(
  p_slot_id uuid,
  p_citizen_id uuid,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_service_id uuid;
  v_slot_at timestamptz;
  v_capacity int;
  v_active boolean;
  v_booked_count int;
  v_appt_id uuid;
  v_ref text;
  v_gov_id text;
begin
  if p_citizen_id is null or p_citizen_id <> auth.uid() then
    return jsonb_build_object('ok', false, 'error', 'unknown');
  end if;
  select gov_id into v_gov_id from public.profiles where id = p_citizen_id;
  -- (existing slot checks elided)
  insert into public.appointments (
    citizen_id, citizen_gov_id, service_id, slot_id, appointment_at, status
  ) values (
    p_citizen_id, v_gov_id, v_service_id, p_slot_id, v_slot_at, 'booked'
  ) returning id, reference_code into v_appt_id, v_ref;
  return jsonb_build_object('ok', true, 'appointment_id', v_appt_id, 'reference_code', v_ref);
exception when others then
  return jsonb_build_object('ok', false, 'error', 'unknown');
end;
$$;

grant execute on function public.book_appointment_slot(uuid, uuid, text) to authenticated;
COMMIT;
```

Citizen app fallback insert (proposed edit to also set `citizen_gov_id`)

```diff
// apps/civigo-citizen/src/app/(protected)/app/services/[id]/_actions.ts
@@
-    const { data: appt, error } = await supabase
-      .from("appointments")
-      .insert({
-        citizen_id: profile.id,
-        service_id: slot.service_id,
-        appointment_at: slot.slot_at,
-      })
+    const { data: me } = await supabase
+      .from("profiles")
+      .select("gov_id")
+      .eq("id", profile.id)
+      .maybeSingle();
+    const { data: appt, error } = await supabase
+      .from("appointments")
+      .insert({
+        citizen_id: profile.id,
+        citizen_gov_id: me?.gov_id ?? null,
+        service_id: slot.service_id,
+        appointment_at: slot.slot_at,
+      })
      .select("id, reference_code")
      .single();
```

Documents (when created elsewhere): also populate `owner_gov_id` from profile at creation time; reads may join by `owner_gov_id` where needed.

Compatibility

- If `gov_id` is null, inserts proceed with null `citizen_gov_id`/`owner_gov_id`; queries should prefer `gov_id` when present, else fallback to joins on `user_id`

---

### Step 6 — Tests and docs

Tests (unit for pure logic; integration for Server Actions/Routes; mock external APIs)

- Onboarding validations: NIC, phone, OTP, names, password
- OTP flow: rate limits, hash verify, expiry
- Media upload: signed URL issuance; storage RLS denies cross-user access
- RLS on `identity_verifications` and `phone_verifications`: self-only access; admin access
- Booking: insert stores `citizen_gov_id` (RPC + fallback)
- Documents: insert stores `owner_gov_id`

Docs

- Update `apps/civigo-citizen/README.md` with Gov ID onboarding overview, privacy notes, and RLS invariants
- Add `apps/civigo-gov` admin review docs

Env flags

- `GOVID_MANUAL_REVIEW=true|false` (default true in staging; false only if auto-approval)
- `CITIZEN_BOOKING_FALLBACK_ENABLED=true|false` (existing)

---

Execution checklist (do not run yet)

- Create migrations 013–018 with SQL above; run locally; verify RLS with smoke tests
- Implement onboarding pages/actions using the provided stubs; wire uploads with signed URLs to `nic-media`
- Implement gov app admin list/review with server guards
- Backfill `gov_id`, `citizen_gov_id`, `owner_gov_id`
- Update booking fallback insert and redeploy RPC
- Add tests and CI gates

Notes

- No service-role key in browser; uploads use signed URLs issued by Server Actions
- Keep PII out of logs/toasts; use friendly error messages; mask NIC where displayed
- Maintain existing flows; legacy users derive `gov_id` during onboarding or first login

