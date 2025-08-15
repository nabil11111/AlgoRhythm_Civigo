"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServiceRoleClient } from "@/utils/supabase/server";
import { finalizeOnboarding } from "../finalize/_actions";

const schema = z.object({ face_path: z.string().min(1) });

export async function saveFaceCapture(formData: FormData) {
  const cookieStore = await cookies();
  const tempId = cookieStore.get("onboarding_temp_id")?.value;
  if (!tempId) return { ok: false, error: "no_session" } as const;
  const supabase = getServiceRoleClient();
  if (!supabase) return { ok: false, error: "server_misconfigured" } as const;

  const parsed = schema.safeParse({ face_path: formData.get("face_path") });
  if (!parsed.success) return { ok: false, error: "invalid" } as const;

  await supabase
    .from("identity_verifications")
    .update({
      face_capture_path: parsed.data.face_path,
    })
    .eq("user_temp_id", tempId);

  // Call finalizeOnboarding to create auth user and profile
  const finalizeResult = await finalizeOnboarding(null);
  if (!finalizeResult.ok) {
    return { ok: false, error: finalizeResult.error } as const;
  }

  // Set login email cookie for the newly created user
  const email = cookieStore.get("onboarding_email")?.value;

  if (email) {
    cookieStore.set("login_email", email, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60, // 10 minutes
    });
  } else {
    // If no email was provided during onboarding, we need to get the gov_id
    // and construct the placeholder email that was used
    const { data: idv } = await supabase
      .from("identity_verifications")
      .select("nic")
      .eq("user_temp_id", tempId)
      .maybeSingle();

    if (idv?.nic) {
      const { data: gen } = await supabase.rpc("generate_gov_id", {
        p_nic: idv.nic,
      });
      const govId = (gen as unknown as string) ?? null;
      if (govId) {
        const placeholderEmail = `${govId}@placeholder.local`;
        cookieStore.set("login_email", placeholderEmail, {
          httpOnly: false,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 10 * 60, // 10 minutes
        });
      }
    }
  }

  // Redirect to login page after successful onboarding completion
  revalidatePath("/onboarding/login/password");
  redirect("/onboarding/login/password");
}

export async function uploadFaceCapture(
  prev: { ok: boolean; error?: string; path?: string } | null,
  formData: FormData
) {
  const cookieStore = await cookies();
  const tempId = cookieStore.get("onboarding_temp_id")?.value;
  if (!tempId) return { ok: false, error: "no_session" } as const;
  const supabase = getServiceRoleClient();
  if (!supabase) return { ok: false, error: "server_misconfigured" } as const;

  const file = formData.get("file");
  if (!(file instanceof File))
    return { ok: false, error: "invalid_file" } as const;

  const folder = "captures";
  const ext = file.type && file.type.includes("png") ? "png" : "jpg";
  const objectName = `${folder}/${tempId}-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("nic-media")
    .upload(objectName, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (upErr) return { ok: false, error: "upload_failed" } as const;
  return { ok: true, path: objectName } as const;
}
