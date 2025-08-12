import { redirect } from "next/navigation";
import { getServerClient } from "@/utils/supabase/server";
import DepartmentsList, { type DepartmentItem } from "./_components/DepartmentsList";
import { officerStrings } from "@/lib/strings/officer-dashboard";

export default async function OfficerHome() {
  const supabase = await getServerClient();
  const { data: rows } = await supabase
    .from("officer_assignments")
    .select("department_id, departments:department_id(id, code, name)")
    .eq("active", true);

  const departments: DepartmentItem[] = (rows ?? [])
    .map((r: any) => r.departments)
    .filter(Boolean)
    .map((d: any) => ({ id: d.id as string, code: d.code as string, name: d.name as string }));

  if (departments.length === 1) {
    redirect(`/officer/departments/${departments[0].id}`);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{officerStrings.landingTitle}</h1>
      <DepartmentsList departments={departments} />
    </div>
  );
}
