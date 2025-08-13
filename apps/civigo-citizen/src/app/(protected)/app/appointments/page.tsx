import Link from "next/link";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { parsePagination, nextPageHref, prevPageHref } from "@/lib/pagination";

export default async function MyAppointmentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; pageSize?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const { page, pageSize, offset } = parsePagination(sp);
  const profile = await getProfile();
  const supabase = await getServerClient();

  const { data: rows } = await supabase
    .from("appointments")
    .select("id, reference_code, service_id, appointment_at, status")
    .eq("citizen_id", profile?.id)
    .order("appointment_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  const base = "/app/appointments";
  const prevHref = prevPageHref(base, { page, pageSize, offset });
  const nextHref = nextPageHref(base, { page, pageSize, offset });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">My Appointments</h1>
      <ul className="divide-y">
        {(rows ?? []).map((a) => (
          <li key={a.id} className="py-2">
            <Link href={`/app/appointments/${a.id}`} className="underline">
              {new Date(a.appointment_at).toLocaleString()} — {a.status} — Ref {a.reference_code}
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex justify-between">
        <a className="underline" href={prevHref}>Previous</a>
        <a className="underline" href={nextHref}>Next</a>
      </div>
    </div>
  );
}


