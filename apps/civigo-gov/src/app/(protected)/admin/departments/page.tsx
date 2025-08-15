import { getServerClient } from "@/utils/supabase/server";
import { parsePagination, prevPageHref, nextPageHref } from "@/lib/pagination";
import { CreateDepartmentDialog } from "./_components/CreateDepartmentDialog";
import { EditDepartmentDialog } from "./_components/EditDepartmentDialog";
import { ConfirmDeleteDialog } from "./_components/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-40">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(rows ?? []).map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs">{d.code}</TableCell>
                <TableCell>{d.name}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <EditDepartmentDialog id={d.id} code={d.code} name={d.name} />
                    <ConfirmDeleteDialog id={d.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
