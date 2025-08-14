"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServiceRoleClient } from "@/utils/supabase/server";

const schema = z.object({ email: z.string().email() });

export async function submitEmail(formData: FormData) {
  const cookieStore = await cookies();
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, error: "invalid_email" } as const;

  // Prevent using an email already linked to an existing profile
  const supabase = getServiceRoleClient();
  if (supabase) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", parsed.data.email)
      .maybeSingle();
    if (existing?.id) {
      revalidatePath("/onboarding/email");
      redirect("/onboarding/email?error=email_in_use");
    }
  }

  cookieStore.set("onboarding_email", parsed.data.email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 15 * 60,
  });
  revalidatePath("/onboarding/names");
  redirect("/onboarding/names");
}
