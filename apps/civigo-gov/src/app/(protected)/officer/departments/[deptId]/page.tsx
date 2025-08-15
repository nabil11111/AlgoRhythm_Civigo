import { redirect } from "next/navigation";
import { getServerClient, getProfile } from "@/utils/supabase/server";
import { OfficerDepartmentParam } from "@/lib/validation";
import { DepartmentOverview } from "./_components/DepartmentOverview";
import { 
  markCheckedIn,
  markStarted,
  markCompleted,
  markNoShow,
  markCancelled
} from "./_actions";

type PageProps = {
  params: Promise<{ deptId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function DepartmentPage({ params }: PageProps) {
  const p = await params;
  const parsed = OfficerDepartmentParam.safeParse({ deptId: p.deptId });
  if (!parsed.success) {
    redirect("/officer");
  }

  const profile = await getProfile();
  if (!profile || profile.role !== "officer") {
    redirect("/sign-in");
  }

  const supabase = await getServerClient();
  // Ensure officer has active assignment for this department
  const { data: assignment } = await supabase
    .from("officer_assignments")
    .select("id")
    .eq("officer_id", profile.id)
    .eq("department_id", parsed.data.deptId)
    .eq("active", true)
    .maybeSingle();
  if (!assignment) {
    redirect("/officer");
  }

  // Fetch comprehensive department data
  const [
    { data: dept },
    { data: appointments },
    { data: services },
    { data: branches },
    { data: todayStats }
  ] = await Promise.all([
    // Department info
    supabase
      .from("departments")
      .select("id, code, name, description_richtext, logo_path")
      .eq("id", parsed.data.deptId)
      .single(),
    
    // Recent appointments
    supabase
      .from("appointments")
      .select(`
        id, reference_code, appointment_at, status, checked_in_at, started_at, completed_at,
        services:service_id(id, name),
        profiles:citizen_id(full_name)
      `)
      .eq("services.department_id", parsed.data.deptId)
      .gte("appointment_at", new Date().toISOString().split("T")[0])
      .order("appointment_at")
      .limit(10),
    
    // Services count
    supabase
      .from("services")
      .select("id")
      .eq("department_id", parsed.data.deptId),
    
    // Branches count  
    supabase
      .from("branches")
      .select("id")
      .eq("department_id", parsed.data.deptId),
    
    // Today's stats
    supabase
      .from("appointments")
      .select("status")
      .eq("services.department_id", parsed.data.deptId)
      .gte("appointment_at", new Date().toISOString().split("T")[0])
      .lt("appointment_at", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0])
  ]);

  if (!dept) {
    redirect("/officer");
  }

  // Generate signed URL for logo if it exists
  let logoSignedUrl: string | null = null;
  if (dept.logo_path) {
    try {
      const { data: signedData } = await supabase.storage
        .from("departments")
        .createSignedUrl(dept.logo_path, 60 * 60 * 24); // 24 hours expiry
      logoSignedUrl = signedData?.signedUrl || null;
    } catch (error) {
      console.error("Failed to generate signed URL for logo:", error);
    }
  }

  return (
    <DepartmentOverview
      department={dept}
      appointments={appointments ?? []}
      servicesCount={(services ?? []).length}
      branchesCount={(branches ?? []).length}
      todayStats={todayStats ?? []}
      deptId={parsed.data.deptId}
      logoSignedUrl={logoSignedUrl}
      markCheckedInAction={markCheckedIn}
      markStartedAction={markStarted}
      markCompletedAction={markCompleted}
      markNoShowAction={markNoShow}
      markCancelledAction={markCancelled}
    />
  );
}
