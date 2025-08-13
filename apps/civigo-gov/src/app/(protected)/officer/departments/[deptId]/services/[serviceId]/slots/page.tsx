import { redirect } from "next/navigation";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { OfficerDepartmentParam } from "@/lib/validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreateSlotDialog from "./_components/CreateSlotDialog";
import { parsePagination } from "@/lib/pagination";

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

  // Fetch slots with booked count
  const { data: slots } = await supabase
    .from("service_slots")
    .select("id, slot_at, duration_minutes, capacity, active")
    .eq("service_id", p.serviceId)
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
        <CreateSlotDialog serviceId={p.serviceId} />
      </div>
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
                    <td className="py-2">{new Date(s.slot_at).toLocaleString()}</td>
                    <td className="py-2">{s.duration_minutes} min</td>
                    <td className="py-2">{s.capacity}</td>
                    <td className="py-2">{bookedMap.get(s.id) ?? 0}</td>
                    <td className="py-2">{s.active ? "Yes" : "No"}</td>
                    <td className="py-2">(dialogs here)</td>
                  </tr>
                ))}
              </tbody>
            </table>
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


