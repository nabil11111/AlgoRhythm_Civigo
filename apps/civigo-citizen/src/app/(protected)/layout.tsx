import { redirect } from "next/navigation";
import { getProfile, getServerClient } from "@/utils/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) {
    redirect("/onboarding/welcome");
  }
  if (profile.role !== "citizen") {
    // SSR guard: non-citizen roles cannot access citizen app
    const supabase = await getServerClient();
    await supabase.auth.signOut();
    redirect("/onboarding/welcome");
  }
  // Enforce onboarding completion: require gov_id
  if (!profile.gov_id) {
    redirect("/onboarding/nic");
  }
  const agentEnabled = process.env.AGENT_ENABLED === "true";
  return (
    <div
      className="min-h-screen bg-white text-[#171717]"
      data-agent-enabled={agentEnabled ? "true" : "false"}
    >
      <main className="w-full">{children}</main>
    </div>
  );
}
