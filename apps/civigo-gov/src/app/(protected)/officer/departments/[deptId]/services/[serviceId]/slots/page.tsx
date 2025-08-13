import { redirect } from "next/navigation";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { OfficerDepartmentParam } from "@/lib/validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreateSlotDialog from "./_components/CreateSlotDialog";
import CreateSlotsBatchDialog from "./_components/CreateSlotsBatchDialog";
import EditSlotDialog from "./_components/EditSlotDialog";
import ConfirmToggleActiveDialog from "./_components/ConfirmToggleActiveDialog";
import ConfirmDeleteDialog from "./_components/ConfirmDeleteDialog";
import { parsePagination } from "@/lib/pagination";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

  // Verify service belongs to dept
  const { data: service } = await supabase
    .from("services")
    .select("id, name")
    .eq("id", p.serviceId)
    .eq("department_id", parsed.data.deptId)
    .maybeSingle();
  if (!service) redirect(`/officer/departments/${parsed.data.deptId}/services`);

  const pagination = parsePagination({
    page: asString(sp?.page),
    pageSize: asString(sp?.pageSize),
  });
  const fromParam = asString(sp?.from);
  const toParam = asString(sp?.to);
  const now = new Date();
  const defaultFrom = now.toISOString();
  const defaultTo = new Date(
    now.getTime() + 14 * 24 * 60 * 60 * 1000
  ).toISOString();
  const fromIso = fromParam && fromParam.length > 0 ? fromParam : defaultFrom;
  const toIso = toParam && toParam.length > 0 ? toParam : defaultTo;

  // Fetch slots with booked count
  const { data: slots } = await supabase
    .from("service_slots")
    .select("id, slot_at, duration_minutes, capacity, active")
    .eq("service_id", p.serviceId)
    .gte("slot_at", fromIso)
    .lt("slot_at", toIso)
    .order("slot_at", { ascending: true })
    .range(pagination.offset, pagination.offset + pagination.pageSize - 1);

  // booked_count per slot via separate counts (simple approach; can be optimized later)
  let bookedMap = new Map<string, number>();
  if (slots && slots.length) {
    const ids = slots.map((s: any) => s.id);
    const { data: counts } = await supabase
      .from("appointments")
      .select("slot_id, status")
      .in("slot_id", ids as string[]);
    if (counts) {
      for (const c of counts) {
        if (!c.slot_id) continue;
        if (c.status === "booked" || c.status === "completed") {
          bookedMap.set(c.slot_id, (bookedMap.get(c.slot_id) ?? 0) + 1);
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Slots for {service?.name}</h1>
        <div className="flex gap-2">
          <CreateSlotsBatchDialog serviceId={p.serviceId} />
          <CreateSlotDialog serviceId={p.serviceId} />
        </div>
      </div>
      <form className="flex items-center gap-2" action="" method="get">
        <input
          type="text"
          name="from"
          defaultValue={fromParam ?? ""}
          placeholder="From ISO (optional)"
          className="border rounded px-3 py-2 text-sm"
        />
        <input
          type="text"
          name="to"
          defaultValue={toParam ?? ""}
          placeholder="To ISO (optional)"
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
      </form>
      {!slots || slots.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No slots yet</CardTitle>
          </CardHeader>
          <CardContent>
            Define bookable time slots for this service.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>List</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="py-2">When</th>
                  <th className="py-2">Duration</th>
                  <th className="py-2">Capacity</th>
                  <th className="py-2">Booked</th>
                  <th className="py-2">Active</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((s: any) => (
                  <tr key={s.id} className="border-t">
                    <td className="py-2">
                      {new Date(s.slot_at).toLocaleString()}
                    </td>
                    <td className="py-2">{s.duration_minutes} min</td>
                    <td className="py-2">{s.capacity}</td>
                    <td className="py-2">{bookedMap.get(s.id) ?? 0}</td>
                    <td className="py-2">{s.active ? "Yes" : "No"}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <EditSlotDialog
                          serviceId={p.serviceId}
                          slot={{
                            id: s.id,
                            slot_at: s.slot_at,
                            duration_minutes: s.duration_minutes,
                            capacity: s.capacity,
                          }}
                        />
                        <ConfirmToggleActiveDialog
                          serviceId={p.serviceId}
                          slot={{ id: s.id, active: s.active }}
                        />
                        <ConfirmDeleteDialog
                          serviceId={p.serviceId}
                          slot={{ id: s.id }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between mt-4">
              {(() => {
                const prevQS = new URLSearchParams({
                  page: String(Math.max(1, pagination.page - 1)),
                  pageSize: String(pagination.pageSize),
                });
                if (fromParam) prevQS.set("from", fromParam);
                if (toParam) prevQS.set("to", toParam);
                const nextQS = new URLSearchParams({
                  page: String(pagination.page + 1),
                  pageSize: String(pagination.pageSize),
                });
                if (fromParam) nextQS.set("from", fromParam);
                if (toParam) nextQS.set("to", toParam);
                return (
                  <>
                    <Link
                      href={`?${prevQS.toString()}`}
                      className="text-sm underline"
                    >
                      Previous
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      Page {pagination.page}
                    </span>
                    <Link
                      href={`?${nextQS.toString()}`}
                      className="text-sm underline"
                    >
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
