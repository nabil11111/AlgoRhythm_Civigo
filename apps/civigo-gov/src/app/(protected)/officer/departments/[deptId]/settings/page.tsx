import { redirect } from "next/navigation";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { OfficerDepartmentParam } from "@/lib/validation";
import { DepartmentSettings } from "./_components/DepartmentSettings";

type PageProps = {
  params: Promise<{ deptId: string }>;
};

export default async function DepartmentSettingsPage({ params }: PageProps) {
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

  // Fetch department with full details
  const { data: department } = await supabase
    .from("departments")
    .select("id, code, name, logo_path, description_richtext")
    .eq("id", parsed.data.deptId)
    .single();

  if (!department) redirect("/officer");

  // Generate signed URL for logo if it exists
  let logoSignedUrl: string | null = null;
  if (department.logo_path) {
    try {
      const { data: signedData } = await supabase.storage
        .from("departments")
        .createSignedUrl(department.logo_path, 60 * 60 * 24); // 24 hours expiry
      logoSignedUrl = signedData?.signedUrl || null;
    } catch (error) {
      console.error("Failed to generate signed URL for logo:", error);
    }
  }

  return (
    <DepartmentSettings
      department={department}
      deptId={parsed.data.deptId}
      logoSignedUrl={logoSignedUrl}
    />
  );
}
