import { redirect } from "next/navigation";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { OfficerDepartmentParam } from "@/lib/validation";
import { parsePagination } from "@/lib/pagination";
import { officerServices } from "@/lib/strings/officer-services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CreateServiceDialog from "./_components/CreateServiceDialog";
import EditServiceDialog from "./_components/EditServiceDialog";
import ConfirmDeleteDialog from "./_components/ConfirmDeleteDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

type PageProps = {
  params: { deptId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function ServicesPage({
  params,
  searchParams,
}: PageProps) {
  const parsed = OfficerDepartmentParam.safeParse({ deptId: params.deptId });
  if (!parsed.success) redirect("/officer");
  const deptId = parsed.data.deptId;

  const profile = await getProfile();
  if (!profile || profile.role !== "officer") redirect("/sign-in");

  const supabase = await getServerClient();
  const { data: assignment } = await supabase
    .from("officer_assignments")
    .select("id")
    .eq("officer_id", profile.id)
    .eq("department_id", parsed.data.deptId)
    .eq("active", true)
    .maybeSingle();
  if (!assignment) redirect("/officer");

  const pagination = parsePagination({
    page: asString(searchParams?.page),
    pageSize: asString(searchParams?.pageSize),
  });
  const q = asString(searchParams?.q)?.trim();

  let query = supabase
    .from("services")
    .select("id, code, name")
    .eq("department_id", parsed.data.deptId);

  if (q && q.length > 0) {
    const pattern = `%${q}%`;
    // Multi-column OR search using PostgREST or() syntax
    query = query.or(`code.ilike.${pattern},name.ilike.${pattern}`);
  }

  const { data: services } = await query
    .order("code", { ascending: true })
    .range(pagination.offset, pagination.offset + pagination.pageSize - 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{officerServices.title}</h1>
        <CreateServiceDialog deptId={deptId} />
      </div>

      {!services || services.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{officerServices.empty}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="#create-service">{officerServices.newService}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">
                      {s.code}
                    </TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <EditServiceDialog deptId={deptId} service={{ id: s.id, code: s.code, name: s.name }} />
                        <ConfirmDeleteDialog deptId={deptId} service={{ id: s.id, code: s.code }} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function asString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
