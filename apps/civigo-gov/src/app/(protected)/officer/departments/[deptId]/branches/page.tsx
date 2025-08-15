import { redirect } from "next/navigation";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { OfficerDepartmentParam } from "@/lib/validation";
import { BranchesManagement } from "./_components/BranchesManagement";

type PageProps = {
  params: Promise<{ deptId: string }>;
};

export default async function BranchesPage({ params }: PageProps) {
  const p = await params;
  const parsed = OfficerDepartmentParam.safeParse({ deptId: p.deptId });
  if (!parsed.success) redirect("/officer");

  const profile = await getProfile();
  if (!profile || profile.role !== "officer") redirect("/sign-in");

  const supabase = await getServerClient();
  // Verify officer assignment
  const { data: assignment } = await supabase
    .from("officer_assignments")
    .select("id")
    .eq("officer_id", profile.id)
    .eq("department_id", parsed.data.deptId)
    .eq("active", true)
    .maybeSingle();
  if (!assignment) redirect("/officer");

  // Fetch comprehensive data
  const [
    { data: department },
    { data: branches },
    { data: services },
    { data: serviceSettings },
    { data: activeSlots }
  ] = await Promise.all([
    // Department info
    supabase
      .from("departments")
      .select("id, code, name")
      .eq("id", parsed.data.deptId)
      .single(),
    
    // Branches with full details
    supabase
      .from("branches")
      .select("id, code, name, address, location_lat, location_lng, created_at")
      .eq("department_id", parsed.data.deptId)
      .order("name"),
    
    // Services for branch enabling
    supabase
      .from("services")
      .select("id, code, name")
      .eq("department_id", parsed.data.deptId)
      .order("name"),
    
    // Service branch settings
    supabase
      .from("service_branch_settings")
      .select("service_id, branch_id, enabled"),
    
    // Active slots count per branch
    supabase
      .from("service_slots")
      .select("branch_id, active")
      .eq("active", true)
      .gte("slot_at", new Date().toISOString())
  ]);

  if (!department) redirect("/officer");

  return (
    <BranchesManagement
      department={department}
      branches={branches ?? []}
      services={services ?? []}
      serviceSettings={serviceSettings ?? []}
      activeSlots={activeSlots ?? []}
      deptId={parsed.data.deptId}
    />
  );
}
