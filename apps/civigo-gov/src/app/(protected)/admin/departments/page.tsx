import { getServerClient } from "@/utils/supabase/server";
import { parsePagination, prevPageHref, nextPageHref } from "@/lib/pagination";
import { CreateDepartmentDialog } from "./_components/CreateDepartmentDialog";
import { EditDepartmentDialog } from "./_components/EditDepartmentDialog";
import { ConfirmDeleteDialog } from "./_components/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function DepartmentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; pageSize?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const { page, pageSize, offset } = parsePagination(sp);

  const supabase = await getServerClient();
  const { data: rows } = await supabase
    .from("departments")
    .select("id, code, name")
    .order("code", { ascending: true })
    .range(offset, offset + pageSize - 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Departments</h1>
        <CreateDepartmentDialog />
      </div>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2 border">Code</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((d) => (
              <tr key={d.id}>
                <td className="p-2 border">{d.code}</td>
                <td className="p-2 border">{d.name}</td>
                <td className="p-2 border">
                  <div className="flex gap-2">
                    <EditDepartmentDialog
                      id={d.id}
                      code={d.code}
                      name={d.name}
                    />
                    <ConfirmDeleteDialog id={d.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <a
            href={prevPageHref("/admin/departments", {
              page,
              pageSize,
              offset,
            })}
          >
            Previous
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a
            href={nextPageHref("/admin/departments", {
              page,
              pageSize,
              offset,
            })}
          >
            Next
          </a>
        </Button>
      </div>
    </div>
  );
}
