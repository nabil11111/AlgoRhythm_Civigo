import { redirect } from "next/navigation";
import { getServerClient, getProfile } from "@/utils/supabase/server";
import { OfficerDepartmentParam } from "@/lib/validation";
import DepartmentHeader from "../../_components/DepartmentHeader";
import AppointmentsTable from "../../_components/AppointmentsTable";
import { parsePagination } from "@/lib/pagination";

type PageProps = {
  params: { deptId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function DepartmentPage({ params, searchParams }: PageProps) {
  const parsed = OfficerDepartmentParam.safeParse({ deptId: params.deptId });
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

  // Fetch department info
  const { data: dept } = await supabase
    .from("departments")
    .select("id, code, name")
    .eq("id", parsed.data.deptId)
    .single();
  if (!dept) {
    redirect("/officer");
  }

  const pagination = parsePagination({
    page: asString(searchParams?.page),
    pageSize: asString(searchParams?.pageSize),
  });

  // Fetch appointments scoped to this department via embedded service.department_id
  const { data: appts } = await supabase
    .from("appointments")
    .select(
      "id, reference_code, appointment_at, status, service:services(id, name, department_id)"
    )
    .eq("service.department_id", parsed.data.deptId)
    .order("appointment_at", { ascending: false })
    .range(pagination.offset, pagination.offset + pagination.pageSize - 1);

  const rows = (appts ?? []).map((a: any) => ({
    id: a.id as string,
    reference_code: a.reference_code as string,
    citizen_name: null as string | null,
    service_name: (a.service?.name as string) ?? "—",
    appointment_at: a.appointment_at as string,
    status: a.status as string,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <DepartmentHeader departmentName={`${dept.name} (${dept.code})`} />
      </div>
      <AppointmentsTable rows={rows} />
    </div>
  );
}

function asString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}


