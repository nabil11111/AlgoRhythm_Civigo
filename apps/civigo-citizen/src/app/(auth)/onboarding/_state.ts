import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServiceRoleClient } from "@/utils/supabase/server";

export type OnboardingState = {
  tempId: string | null;
  phoneVerified: boolean;
  hasNames: boolean;
  hasPassword: boolean;
  nicFrontPath?: string | null;
  nicBackPath?: string | null;
  facePath?: string | null;
};

export async function getOnboardingState(): Promise<OnboardingState> {
  const cookieStore = await cookies();
  const tempId = cookieStore.get("onboarding_temp_id")?.value ?? null;
  const names = cookieStore.get("onboarding_names")?.value ?? null;
  const password = cookieStore.get("onboarding_password")?.value ?? null;

  let phoneVerified = false;
  let nicFrontPath: string | null = null;
  let nicBackPath: string | null = null;
  let facePath: string | null = null;

  if (tempId) {
    const supabase = getServiceRoleClient();
    if (supabase) {
      const { data: pv } = await supabase
        .from("phone_verifications")
        .select("verified_at")
        .eq("user_temp_id", tempId)
        .maybeSingle();
      phoneVerified = !!pv?.verified_at;

      const { data: idv } = await supabase
        .from("identity_verifications")
        .select("nic_front_path, nic_back_path, face_capture_path")
        .eq("user_temp_id", tempId)
        .maybeSingle();
      nicFrontPath = idv?.nic_front_path ?? null;
      nicBackPath = idv?.nic_back_path ?? null;
      facePath = idv?.face_capture_path ?? null;
    }
  }

  return {
    tempId,
    phoneVerified,
    hasNames: !!names,
    hasPassword: !!password,
    nicFrontPath,
    nicBackPath,
    facePath,
  };
}

export type StepKey = "nic" | "phone" | "names" | "password" | "nic-photos" | "face" | "finalize";

export async function requireStepAllowed(step: StepKey) {
  const s = await getOnboardingState();
  // base: must have tempId except first step
  if (!s.tempId && step !== "nic" && step !== "phone") {
    redirect("/onboarding/nic");
  }
  if (step === "names" && !s.phoneVerified) redirect("/onboarding/phone");
  if (step === "password" && !s.hasNames) redirect("/onboarding/names");
  if (step === "nic-photos" && !s.hasPassword) redirect("/onboarding/password");
  if (step === "face" && (!s.nicFrontPath || !s.nicBackPath)) redirect("/onboarding/nic-photos");
  if (step === "finalize") {
    if (!s.phoneVerified) redirect("/onboarding/phone");
    if (!s.nicFrontPath || !s.nicBackPath) redirect("/onboarding/nic-photos");
    if (!s.facePath) redirect("/onboarding/face");
  }
}


