import { getServerClient } from "@/utils/supabase/server";
import { createAppointmentFromSlot } from "./_actions";
import { revalidatePath } from "next/cache";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ start?: string; end?: string; page?: string; pageSize?: string }>;
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

  const start = sp.start ? new Date(sp.start) : new Date();
  const end = sp.end ? new Date(sp.end) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

  const { data: slots } = await supabase
    .from("service_slots")
    .select("id, slot_at, duration_minutes, capacity, active")
    .eq("service_id", id)
    .eq("active", true)
    .gte("slot_at", start.toISOString())
    .lte("slot_at", end.toISOString())
    .order("slot_at", { ascending: true })
    .limit(100);

  async function action(formData: FormData) {
    "use server";
    const slot_id = String(formData.get("slot_id"));
    const result = await createAppointmentFromSlot({ slot_id });
    if (!result.ok) {
      revalidatePath(`/app/services/${id}`);
      return;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">{service?.name}</h1>
        <p className="text-sm text-gray-600">Code: {service?.code}</p>
      </div>

      <form className="space-y-3" action={action}>
        <label className="block text-sm">Available slots</label>
        <select name="slot_id" className="border rounded px-3 py-2 w-full">
          {(slots ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {new Date(s.slot_at).toLocaleString()} (cap {s.capacity})
            </option>
          ))}
        </select>
        <button type="submit" className="bg-black text-white rounded px-3 py-2">
          Confirm booking
        </button>
      </form>
    </div>
  );
}


