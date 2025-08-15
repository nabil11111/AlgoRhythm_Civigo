import { redirect } from "next/navigation";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { OfficerDepartmentParam } from "@/lib/validation";
import { AppointmentsManagement } from "./_components/AppointmentsManagement";
import { markCheckedIn, markStarted, markCompleted, markCancelled, markNoShow } from "../_actions";

type PageProps = {
  params: Promise<{ deptId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AppointmentsPage({ params, searchParams }: PageProps) {
  const p = await params;
  const sp = await searchParams;
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

  // Get filters from search params
  const statusFilter = (sp?.status as string) || "all";
  const serviceFilter = (sp?.service as string) || "all";
  const dateFilter = (sp?.date as string) || "today";
  const searchTerm = (sp?.search as string) || "";

  // Calculate date range based on filter
  const now = new Date();
  let startDate: string, endDate: string;
  
  switch (dateFilter) {
    case "today":
      startDate = now.toISOString().split('T')[0];
      endDate = startDate;
      break;
    case "tomorrow":
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      startDate = tomorrow.toISOString().split('T')[0];
      endDate = startDate;
      break;
    case "week":
      startDate = now.toISOString().split('T')[0];
      const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      endDate = weekEnd.toISOString().split('T')[0];
      break;
    case "month":
      startDate = now.toISOString().split('T')[0];
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate = monthEnd.toISOString().split('T')[0];
      break;
    default:
      startDate = now.toISOString().split('T')[0];
      endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  }

  // Fetch comprehensive data
  const [
    { data: department },
    { data: appointments },
    { data: services },
    { data: branches },
    { data: stats }
  ] = await Promise.all([
    // Department info
    supabase
      .from("departments")
      .select("id, code, name")
      .eq("id", parsed.data.deptId)
      .single(),
    
    // Appointments with filters
    supabase
      .from("appointments")
      .select(`
        id, reference_code, appointment_at, status, checked_in_at, started_at, completed_at, no_show,
        services:service_id(id, name, code),
        profiles:citizen_id(full_name, phone),
        service_slots:slot_id(branch_id, branches:branch_id(name))
      `)
      .eq("services.department_id", parsed.data.deptId)
      .gte("appointment_at", `${startDate}T00:00:00`)
      .lte("appointment_at", `${endDate}T23:59:59`)
      .order("appointment_at", { ascending: true })
      .then(query => {
        if (statusFilter !== "all") {
          return supabase
            .from("appointments")
            .select(`
              id, reference_code, appointment_at, status, checked_in_at, started_at, completed_at, no_show,
              services:service_id(id, name, code),
              profiles:citizen_id(full_name, phone),
              service_slots:slot_id(branch_id, branches:branch_id(name))
            `)
            .eq("services.department_id", parsed.data.deptId)
            .eq("status", statusFilter)
            .gte("appointment_at", `${startDate}T00:00:00`)
            .lte("appointment_at", `${endDate}T23:59:59`)
            .order("appointment_at", { ascending: true });
        }
        return query;
      }),
    
    // Services for filter dropdown
    supabase
      .from("services")
      .select("id, name, code")
      .eq("department_id", parsed.data.deptId)
      .order("name"),
    
    // Branches for display
    supabase
      .from("branches")
      .select("id, name, code")
      .eq("department_id", parsed.data.deptId)
      .order("name"),
    
    // Statistics for dashboard
    supabase
      .from("appointments")
      .select("status")
      .eq("services.department_id", parsed.data.deptId)
      .gte("appointment_at", `${startDate}T00:00:00`)
      .lte("appointment_at", `${endDate}T23:59:59`)
  ]);

  if (!department) redirect("/officer");

  return (
    <AppointmentsManagement
      department={department}
      appointments={appointments ?? []}
      services={services ?? []}
      branches={branches ?? []}
      stats={stats ?? []}
      deptId={parsed.data.deptId}
      filters={{
        status: statusFilter,
        service: serviceFilter,
        date: dateFilter,
        search: searchTerm
      }}
      markCheckedInAction={markCheckedIn}
      markStartedAction={markStarted}
      markCompletedAction={markCompleted}
      markCancelledAction={markCancelled}
      markNoShowAction={markNoShow}
    />
  );
}
