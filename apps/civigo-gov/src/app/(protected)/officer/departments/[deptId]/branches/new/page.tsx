import { redirect } from "next/navigation";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { OfficerDepartmentParam } from "@/lib/validation";
import { AddBranchForm } from "./_components/AddBranchForm";

type PageProps = {
  params: Promise<{ deptId: string }>;
};

export default async function AddBranchPage({ params }: PageProps) {
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

  // Get department details
  const { data: department } = await supabase
    .from("departments")
    .select("id, code, name")
    .eq("id", parsed.data.deptId)
    .single();

  if (!department) redirect("/officer");

  // Get existing branches to avoid code conflicts
  const { data: existingBranches } = await supabase
    .from("branches")
    .select("code")
    .eq("department_id", parsed.data.deptId);

  return (
    <AddBranchForm
      department={department}
      existingBranchCodes={(existingBranches ?? []).map(b => b.code)}
      deptId={parsed.data.deptId}
    />
  );
}

