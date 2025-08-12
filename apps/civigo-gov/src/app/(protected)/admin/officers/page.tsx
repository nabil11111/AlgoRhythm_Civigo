import { getServerClient, getServiceRoleClient } from "@/utils/supabase/server";
import { parsePagination, prevPageHref, nextPageHref } from "@/lib/pagination";
import { AddOfficerDialog } from "./_components/AddOfficerDialog";
import { AssignDepartmentDialog } from "./_components/AssignDepartmentDialog";
import { ActiveSwitch } from "./_components/ActiveSwitch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type OfficerRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  assignments: {
    department_id: string;
    code: string;
    name: string;
    active: boolean;
  }[];
};

export default async function OfficersPage({ searchParams }:{ searchParams?: Promise<{ page?: string; pageSize?: string }> }) {
  const sp = (await searchParams) ?? {};
  const p = parsePagination(sp);
  const supabase = getServiceRoleClient() ?? (await getServerClient());

  const { data: officers } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "officer")
    .order("full_name", { ascending: true })
    .range(p.offset, p.offset + p.pageSize - 1);

  const { data: assignments } = await supabase
    .from("officer_assignments")
    .select(
      "officer_id, department_id, active, departments:department_id ( code, name )"
    );

  const map: Record<string, OfficerRow> = {};
  for (const o of officers ?? []) {
    map[o.id] = {
      id: o.id,
      full_name: o.full_name,
      email: o.email,
      assignments: [],
    };
  }
  type AssignmentRow = {
    officer_id: string;
    department_id: string;
    active: boolean;
    departments: { code: string; name: string } | null;
  };
  const assignmentsTyped = (assignments ?? []) as unknown as AssignmentRow[];
  for (const a of assignmentsTyped) {
    const row = map[a.officer_id];
    if (!row) continue;
    row.assignments.push({
      department_id: a.department_id,
      code: a.departments?.code ?? "",
      name: a.departments?.name ?? "",
      active: a.active,
    });
  }

  const { data: departments } = await supabase
    .from("departments")
    .select("id, code, name")
    .order("code");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Officers</h1>
        <AddOfficerDialog />
      </div>
      <Card className="p-0 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Departments</th>
            <th className="p-2 border w-64">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(map).map((o) => (
            <tr key={o.id}>
              <td className="p-2 border">{o.full_name}</td>
              <td className="p-2 border">{o.email}</td>
              <td className="p-2 border">
                <div className="flex flex-wrap gap-1">
                  {o.assignments.map((a) => (
                    <Badge key={a.department_id} variant={a.active ? "default" : "secondary"}>{a.code}</Badge>
                  ))}
                </div>
              </td>
              <td className="p-2 border">
                <div className="flex gap-2 items-center">
                  <AssignDepartmentDialog officerId={o.id} departments={departments ?? []} />
                </div>
                <div className="flex gap-2 mt-2">
                  {o.assignments.map((a) => (
                    <div key={a.department_id} className="flex items-center gap-2">
                      <span className="text-xs">{a.code}</span>
                      <ActiveSwitch officerId={o.id} departmentId={a.department_id} active={a.active} />
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </Card>
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild><a href={prevPageHref("/admin/officers", p)}>Previous</a></Button>
        <Button variant="outline" asChild><a href={nextPageHref("/admin/officers", p)}>Next</a></Button>
      </div>
    </div>
  );
}
