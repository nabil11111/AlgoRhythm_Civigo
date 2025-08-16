import { redirect } from "next/navigation";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { OfficerDepartmentParam } from "@/lib/validation";
import { ServicesManagement } from "./_components/ServicesManagement";

type PageProps = {
  params: Promise<{ deptId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ServicesPage({ params }: PageProps) {
  const p = await params;
  const parsed = OfficerDepartmentParam.safeParse({ deptId: p.deptId });
  if (!parsed.success) redirect("/officer");

  const profile = await getProfile();
  if (!profile || profile.role !== "officer") redirect("/sign-in");

  const supabase = await getServerClient();
  const { data: assignment } = await supabase
    .from("officer_assignments")
    .select("id")
    .eq("officer_id", profile.id)
    .eq("department_id", parsed.data.deptId)
    .eq("active", true)
    .maybeSingle();
  if (!assignment) redirect("/officer");

  // Get services for this specific department first
  const { data: deptServices } = await supabase
    .from("services")
    .select("id, code, name, instructions_richtext, instructions_pdf_path")
    .eq("department_id", parsed.data.deptId)
    .order("name");
  
  const serviceIds = (deptServices ?? []).map(s => s.id);

  // Fetch remaining data in parallel
  const [
    { data: department },
    { data: branches },
    { data: serviceSettings },
    { data: slots }
  ] = await Promise.all([
    supabase
      .from("departments")
      .select("id, code, name")
      .eq("id", parsed.data.deptId)
      .single(),
    
    supabase
      .from("branches")
      .select("id, code, name, address")
      .eq("department_id", parsed.data.deptId)
      .order("name"),
    
    supabase
      .from("service_branch_settings")
      .select("service_id, branch_id, enabled"),
    
    supabase
      .from("service_slots")
      .select("service_id, branch_id, active")
      .in("service_id", serviceIds)
      .eq("active", true)
      .gte("slot_at", new Date().toISOString())
  ]);

  if (!department) redirect("/officer");

  return (
    <ServicesManagement
      department={department}
      services={deptServices ?? []}
      branches={branches ?? []}
      serviceSettings={serviceSettings ?? []}
      activeSlots={slots ?? []}
      deptId={parsed.data.deptId}
    />
  );
}
