import { redirect } from "next/navigation";
import { getServerClient, getProfile } from "@/utils/supabase/server";
import { OfficerDashboard } from "./_components/OfficerDashboard";

export default async function OfficerHome() {
  const profile = await getProfile();
  const supabase = await getServerClient();
  
  const { data: assignments } = await supabase
    .from("officer_assignments")
    .select("department_id, departments:department_id(id, code, name)")
    .eq("officer_id", profile!.id)
    .eq("active", true);

  const departments = (assignments ?? [])
    .map((r: any) => r.departments)
    .filter(Boolean);

  if (departments.length === 1) {
    redirect(`/officer/departments/${departments[0].id}`);
  }

  // Get dashboard stats
  const departmentIds = departments.map((d: any) => d.id);
  
  // Get services that belong to officer's departments
  const { data: officerServices } = await supabase
    .from("services")
    .select("id, name")
    .in("department_id", departmentIds);
  
  const serviceIds = (officerServices ?? []).map(s => s.id);

  const { data: todayAppointments } = await supabase
    .from("appointments")
    .select("id, status, appointment_at, service_id")
    .in("service_id", serviceIds)
    .gte("appointment_at", new Date().toISOString().split("T")[0])
    .lt("appointment_at", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0])
    .order("appointment_at");

  // Enrich with service data
  const enrichedTodayAppointments = (todayAppointments ?? []).map(apt => {
    const service = officerServices?.find(s => s.id === apt.service_id);
    return {
      ...apt,
      services: service ? { name: service.name } : { name: "Unknown Service" }
    };
  });

  const { data: pendingAppointments } = await supabase
    .from("appointments")
    .select("id")
    .in("service_id", serviceIds)
    .eq("status", "booked")
    .gte("appointment_at", new Date().toISOString());

  return (
    <OfficerDashboard
      departments={departments}
      todayAppointments={enrichedTodayAppointments}
      pendingCount={(pendingAppointments ?? []).length}
    />
  );
}
