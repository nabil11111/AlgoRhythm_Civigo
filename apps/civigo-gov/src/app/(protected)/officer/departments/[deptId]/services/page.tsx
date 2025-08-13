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
  params: Promise<{ deptId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ServicesPage({ params, searchParams }: PageProps) {
  const p = await params;
  const sp = await searchParams;
  const parsed = OfficerDepartmentParam.safeParse({ deptId: p.deptId });
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
    page: asString(sp?.page),
    pageSize: asString(sp?.pageSize),
  });
  const q = asString(sp?.q)?.trim();

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

      <form className="flex items-center gap-2" action="" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search code or name"
          className="border rounded px-3 py-2 text-sm"
        />
        <select
          name="pageSize"
          defaultValue={String(pagination.pageSize)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
        <Button type="submit" variant="outline" className="text-sm">
          Apply
        </Button>
        {q ? (
          <a
            href={`?page=1&pageSize=${pagination.pageSize}`}
            className="text-sm underline ml-2"
          >
            Clear
          </a>
        ) : null}
      </form>

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
                        <EditServiceDialog
                          deptId={deptId}
                          service={{ id: s.id, code: s.code, name: s.name }}
                        />
                        <ConfirmDeleteDialog
                          deptId={deptId}
                          service={{ id: s.id, code: s.code }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4">
              {(() => {
                const prevQS = new URLSearchParams({
                  page: String(Math.max(1, pagination.page - 1)),
                  pageSize: String(pagination.pageSize),
                });
                if (q) prevQS.set("q", q);
                const nextQS = new URLSearchParams({
                  page: String(pagination.page + 1),
                  pageSize: String(pagination.pageSize),
                });
                if (q) nextQS.set("q", q);
                return (
                  <>
                    <Link href={`?${prevQS.toString()}`} className="text-sm underline">
                      Previous
                    </Link>
                    <span className="text-xs text-muted-foreground">Page {pagination.page}</span>
                    <Link href={`?${nextQS.toString()}`} className="text-sm underline">
                      Next
                    </Link>
                  </>
                );
              })()}
            </div>
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
