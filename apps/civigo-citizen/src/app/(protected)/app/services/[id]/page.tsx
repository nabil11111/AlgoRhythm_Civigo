import { getServerClient } from "@/utils/supabase/server";
import { SlotPicker } from "./_components/SlotPicker";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string; to?: string }>;
};

export default async function ServiceDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const supabase = await getServerClient();

  const { data: service } = await supabase
    .from("services")
    .select("id, code, name")
    .eq("id", id)
    .maybeSingle();

  const start = sp.from ? new Date(sp.from) : new Date();
  const end = sp.to ? new Date(sp.to) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

  const { data: slots } = await supabase
    .from("service_slots")
    .select("id, slot_at, duration_minutes, capacity, active")
    .eq("service_id", id)
    .eq("active", true)
    .gte("slot_at", start.toISOString())
    .lte("slot_at", end.toISOString())
    .order("slot_at", { ascending: true })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">{service?.name}</h1>
        <p className="text-sm text-gray-600">Code: {service?.code}</p>
      </div>

      <SlotPicker serviceId={id} slots={(slots ?? []).map(s => ({ id: s.id, slot_at: s.slot_at, capacity: s.capacity }))} />
    </div>
  );
}


