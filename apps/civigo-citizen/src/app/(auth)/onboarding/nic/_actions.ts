"use server";

// NOTE: Server action files must only export async functions
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getServiceRoleClient } from "@/utils/supabase/server";
import crypto from "node:crypto";
import { nicSchema } from "./schema";

// schema moved to ./schema to satisfy Next.js server action export rules

export async function submitNic(
  prevState: { ok: boolean; error?: string } | null,
  formData: FormData
) {
  const cookieStore = await cookies();
  // If NIC exists in profiles, mark a login-intent cookie and proceed to password step
  const nicInput = String(formData.get("nic") || "").trim();
  const parseCheck = nicSchema.safeParse({ nic: nicInput });
  if (parseCheck.success) {
    const supabaseCheck = getServiceRoleClient();
    if (supabaseCheck) {
      const { data: existing } = await supabaseCheck
        .from("profiles")
        .select("id, gov_id")
        .eq("nic", nicInput)
        .maybeSingle();
      if (existing?.id) {
        // Use placeholder email derived from gov_id if present; otherwise NIC
        const loginEmail = `${
          (existing as any).gov_id ?? nicInput
        }@placeholder.local`;
        cookieStore.set("login_email", loginEmail, {
          httpOnly: false,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 10 * 60,
        });
        return { ok: true, next: "/onboarding/login/password" } as const;
      }
    }
  }
  let tempId = cookieStore.get("onboarding_temp_id")?.value;
  if (!tempId) {
    tempId = crypto.randomUUID();
    cookieStore.set("onboarding_temp_id", tempId, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
  }

  const supabase = getServiceRoleClient();
  if (!supabase) return { ok: false, error: "server_misconfigured" } as const;

  const parse = nicSchema.safeParse({ nic: formData.get("nic") });
  if (!parse.success) return { ok: false, error: "invalid_nic" } as const;
  const nic = parse.data.nic;

  // Ensure NIC uniqueness against profiles
  const { data: prof } = await supabase
    .from("profiles")
    .select("id")
    .eq("nic", nic)
    .maybeSingle();
  if (prof?.id) return { ok: false, error: "nic_taken" } as const;

  // Ensure a row exists for this temp user
  await supabase
    .from("identity_verifications")
    .delete()
    .eq("user_temp_id", tempId);
  const { error: insErr } = await supabase
    .from("identity_verifications")
    .insert({ user_temp_id: tempId, nic });
  if (insErr) return { ok: false, error: "store_failed" } as const;

  revalidatePath("/onboarding/phone");
  return { ok: true } as const;
}
