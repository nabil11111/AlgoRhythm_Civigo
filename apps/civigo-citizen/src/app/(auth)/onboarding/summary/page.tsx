import { cookies } from "next/headers";
import { getServiceRoleClient } from "@/utils/supabase/server";
import { ProgressHeader } from "../_components/ProgressHeader";

export default async function OnboardingSummaryPage() {
  const cookieStore = await cookies();
  const tempId = cookieStore.get("onboarding_temp_id")?.value ?? null;
  const names = cookieStore.get("onboarding_names")?.value ?? null;
  const supabase = getServiceRoleClient();
  const idv =
    tempId && supabase
      ? (
          await supabase
            .from("identity_verifications")
            .select(
              "nic, nic_front_path, nic_back_path, face_capture_path, status"
            )
            .eq("user_temp_id", tempId)
            .maybeSingle()
        ).data
      : null;
  const pv =
    tempId && supabase
      ? (
          await supabase
            .from("phone_verifications")
            .select("phone, verified_at")
            .eq("user_temp_id", tempId)
            .order("expires_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        ).data
      : null;

  return (
    <div className="mx-auto max-w-md p-4 space-y-4">
      <ProgressHeader current="finalize" />
      <h2 className="text-lg font-semibold">Onboarding Summary (temporary)</h2>
      <pre className="font-mono text-xs bg-gray-900 text-gray-100 p-3 rounded-md overflow-auto">
        {JSON.stringify(
          { tempId, names: names && JSON.parse(names), idv, phone: pv },
          null,
          2
        )}
      </pre>
      <p className="text-xs text-muted-foreground">
        Note: This page is temporary for debugging and will be removed. Cookies
        are not yet cleared to allow inspection.
      </p>
    </div>
  );
}
