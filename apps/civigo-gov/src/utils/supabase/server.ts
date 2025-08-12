"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

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

export function getServerClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", expires: new Date(0), ...options });
      },
    },
  });
}

export async function getUser() {
  const supabase = getServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = getServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, nic, verified_status, phone, created_at")
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


