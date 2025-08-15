import { redirect } from "next/navigation";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { OfficerDepartmentParam } from "@/lib/validation";
import { SlotsManagement } from "./_components/SlotsManagement";

type PageProps = {
  params: Promise<{ deptId: string; serviceId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SlotsPage({ params, searchParams }: PageProps) {
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

  // Verify service belongs to dept and get service details
  const { data: service } = await supabase
    .from("services")
    .select("id, code, name")
    .eq("id", p.serviceId)
    .eq("department_id", parsed.data.deptId)
    .maybeSingle();
  if (!service) redirect(`/officer/departments/${parsed.data.deptId}/services`);

  // Get current filters from search params
  const selectedBranchId = (sp?.branchId as string) || undefined;
  const dateFrom = (sp?.from as string) || new Date().toISOString().split('T')[0];
  const dateTo = (sp?.to as string) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Fetch comprehensive data
  const [
    { data: branches },
    { data: slots },
    { data: appointments }
  ] = await Promise.all([
    // Branches
    supabase
      .from("branches")
      .select("id, code, name")
      .eq("department_id", parsed.data.deptId)
      .order("name"),
    
    // Slots with conditional branch filtering
    supabase
      .from("service_slots")
      .select("id, slot_at, duration_minutes, capacity, active, branch_id")
      .eq("service_id", p.serviceId)
      .gte("slot_at", `${dateFrom}T00:00:00`)
      .lte("slot_at", `${dateTo}T23:59:59`)
      .order("slot_at")
      .then(query => selectedBranchId ? 
        supabase.from("service_slots")
          .select("id, slot_at, duration_minutes, capacity, active, branch_id")
          .eq("service_id", p.serviceId)
          .eq("branch_id", selectedBranchId)
          .gte("slot_at", `${dateFrom}T00:00:00`)
          .lte("slot_at", `${dateTo}T23:59:59`)
          .order("slot_at") : 
        query
      ),
    
    // Appointments for booking counts
    supabase
      .from("appointments")
      .select("slot_id, status")
      .eq("service_id", p.serviceId)
      .in("status", ["booked", "checked_in", "started", "completed"])
  ]);

  return (
    <SlotsManagement
      service={service}
      branches={branches ?? []}
      slots={slots ?? []}
      appointments={appointments ?? []}
      deptId={parsed.data.deptId}
      selectedBranchId={selectedBranchId}
      dateFrom={dateFrom}
      dateTo={dateTo}
    />
  );
}
