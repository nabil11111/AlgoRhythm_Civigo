import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerClient, getProfile } from "@/utils/supabase/server";
import { OfficerDepartmentParam } from "@/lib/validation";
import DepartmentHeader from "../../_components/DepartmentHeader";
import { Button } from "@/components/ui/button";
import {
  markCheckedIn,
  markStarted,
  markCompleted,
  markCancelled,
  markNoShow,
} from "./_actions";
import AppointmentsTable from "../../_components/AppointmentsTable";
import { parsePagination } from "@/lib/pagination";

type PageProps = {
  params: Promise<{ deptId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function DepartmentPage({ params, searchParams }: PageProps) {
  const p = await params;
  const sp = await searchParams;
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
    page: asString(sp?.page),
    pageSize: asString(sp?.pageSize),
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
        <div className="ml-auto">
          <Link
            href={`/officer/departments/${parsed.data.deptId}/services`}
            className="underline text-sm"
          >
            Services
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="py-2">Reference</th>
              <th className="py-2">Service</th>
              <th className="py-2">When</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2 font-mono text-xs">{r.reference_code}</td>
                <td className="py-2">{r.service_name}</td>
                <td className="py-2">
                  {new Date(r.appointment_at).toLocaleString()}
                </td>
                <td className="py-2">{r.status}</td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <form
                      action={async () => {
                        "use server";
                        await markCheckedIn({
                          id: r.id,
                          deptId: parsed.data.deptId,
                        });
                      }}
                    >
                      <Button size="sm" variant="outline">
                        Check-in
                      </Button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await markStarted({
                          id: r.id,
                          deptId: parsed.data.deptId,
                        });
                      }}
                    >
                      <Button size="sm" variant="outline">
                        Start
                      </Button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await markCompleted({
                          id: r.id,
                          deptId: parsed.data.deptId,
                        });
                      }}
                    >
                      <Button size="sm" variant="outline">
                        Complete
                      </Button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await markCancelled({
                          id: r.id,
                          deptId: parsed.data.deptId,
                        });
                      }}
                    >
                      <Button size="sm" variant="destructive">
                        Cancel
                      </Button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await markNoShow({
                          id: r.id,
                          deptId: parsed.data.deptId,
                          value: true,
                        });
                      }}
                    >
                      <Button size="sm" variant="outline">
                        No-show
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function asString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
