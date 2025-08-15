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
  
  const { data: todayAppointments } = await supabase
    .from("appointments")
    .select("id, status, appointment_at, services:service_id(name)")
    .in("services.department_id", departmentIds)
    .gte("appointment_at", new Date().toISOString().split("T")[0])
    .lt("appointment_at", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0])
    .order("appointment_at");

  const { data: pendingAppointments } = await supabase
    .from("appointments")
    .select("id")
    .in("services.department_id", departmentIds)
    .eq("status", "booked")
    .gte("appointment_at", new Date().toISOString());

  return (
    <OfficerDashboard
      departments={departments}
      todayAppointments={todayAppointments ?? []}
      pendingCount={(pendingAppointments ?? []).length}
    />
  );
}
