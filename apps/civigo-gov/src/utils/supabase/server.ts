/**
 * Server utilities only — no Server Actions here.
 * Do NOT add 'use server' to this file.
 */
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

type Profile = {
  id: string;
  role: "citizen" | "officer" | "admin";
  full_name: string | null;
  email: string | null;
  nic: string | null;
  verified_status: string | null;
  phone: string | null;
  created_at: string;
};

export async function getServerClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore
          .getAll()
          .map((c) => ({ name: c.name, value: c.value }));
      },
      setAll(cookies) {
        // In Server Components, Next.js prohibits mutating cookies.
        // Supabase may attempt to refresh session cookies during RSC render.
        // Swallow the mutation here; real mutations occur in Server Actions/Route Handlers.
        try {
          for (const { name, value, options } of cookies) {
            cookieStore.set({ name, value, ...options });
          }
        } catch {
          // no-op: ignore cookie mutations outside Server Actions
        }
      },
    },
  });
}

export async function getUser() {
  const supabase = await getServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await getServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, role, full_name, email, nic, verified_status, phone, created_at"
    )
    .eq("id", user.id)
    .single();
  if (error) return null;
  return data as Profile;
}

/**
 * Server-only client with service role for privileged operations (never sent to client).
 * Falls back to standard SSR client if no service role key is configured.
 */
export function getServiceRoleClient(): SupabaseClient | null {
  if (typeof window !== "undefined") {
    throw new Error("getServiceRoleClient cannot be called in the browser");
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, detectSessionInUrl: false },
  });
}

export async function requireAdmin() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return { ok: false as const, error: "forbidden" };
  }
  return { ok: true as const, profile };
}

export async function requireOfficer() {
  const profile = await getProfile();
  if (!profile || profile.role !== "officer") {
    return { ok: false as const, error: "forbidden" };
  }
  return { ok: true as const, profile };
}
