import Link from "next/link";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { parsePagination, nextPageHref, prevPageHref } from "@/lib/pagination";
import { citizenAppointments } from "@/lib/strings/citizen-appointments";

export default async function MyAppointmentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; pageSize?: string; status?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const { page, pageSize, offset } = parsePagination(sp);
  const status = (sp.status === "upcoming" || sp.status === "past") ? sp.status : undefined;
  const profile = await getProfile();
  const supabase = await getServerClient();

  let query = supabase
    .from("appointments")
    .select("id, reference_code, service_id, appointment_at, status")
    .eq("citizen_id", profile?.id)
    .order("appointment_at", { ascending: false });

  if (status === "upcoming") {
    query = query.gte("appointment_at", new Date().toISOString());
  } else if (status === "past") {
    query = query.lt("appointment_at", new Date().toISOString());
  }

  const { data: rows } = await query.range(offset, offset + pageSize - 1);

  const base = "/app/appointments";
  function withParams(next: { page?: number }) {
    const spx = new URLSearchParams();
    spx.set("page", String(next.page ?? page));
    spx.set("pageSize", String(pageSize));
    if (status) spx.set("status", status);
    return `${base}?${spx.toString()}`;
  }
  const prevHref = withParams({ page: Math.max(1, page - 1) });
  const nextHref = withParams({ page: page + 1 });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">{citizenAppointments.title}</h1>
      <div className="flex items-center gap-2 text-sm">
        <a className={`underline ${!status ? "font-semibold" : ""}`} href={`${base}?page=1&pageSize=${pageSize}`}>{citizenAppointments.filters.all}</a>
        <span>·</span>
        <a className={`underline ${status === "upcoming" ? "font-semibold" : ""}`} href={`${base}?status=upcoming&page=1&pageSize=${pageSize}`}>{citizenAppointments.filters.upcoming}</a>
        <span>·</span>
        <a className={`underline ${status === "past" ? "font-semibold" : ""}`} href={`${base}?status=past&page=1&pageSize=${pageSize}`}>{citizenAppointments.filters.past}</a>
      </div>
      <ul className="divide-y">
        {(rows ?? []).map((a) => (
          <li key={a.id} className="py-2">
            <Link href={`/app/appointments/${a.id}`} className="underline">
              {new Date(a.appointment_at).toLocaleString()} — {a.status} — Ref {a.reference_code}
            </Link>
          </li>
        ))}
      </ul>
      {(!rows || rows.length === 0) && (
        <div className="text-sm text-gray-500">
          {!status && citizenAppointments.empty.all}
          {status === "upcoming" && citizenAppointments.empty.upcoming}
          {status === "past" && citizenAppointments.empty.past}
        </div>
      )}
      <div className="flex justify-between">
        <a className="underline" href={prevHref}>Previous</a>
        <a className="underline" href={nextHref}>Next</a>
      </div>
    </div>
  );
}


