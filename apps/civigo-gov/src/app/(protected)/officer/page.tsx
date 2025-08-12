import { getServerClient } from "@/utils/supabase/server";
import AppointmentsTable from "./_components/AppointmentsTable";
import { parsePagination, type Pagination } from "@/lib/pagination";

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function OfficerHome({ searchParams }: PageProps) {
  const pagination = parsePagination({
    page: asString(searchParams?.page),
    pageSize: asString(searchParams?.pageSize),
  });

  const supabase = await getServerClient();
  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const fromIso = now.toISOString();
  const toIso = sevenDays.toISOString();

  const { data: appts } = await supabase
    .from("appointments")
    .select("id, reference_code, appointment_at, status, service:services(name)")
    .gte("appointment_at", fromIso)
    .lt("appointment_at", toIso)
    .order("appointment_at", { ascending: true })
    .range(pagination.offset, pagination.offset + pagination.pageSize - 1);

  const rows = (appts ?? []).map((a: any) => ({
    id: a.id as string,
    reference_code: a.reference_code as string,
    citizen_name: null as string | null, // Hidden by RLS; do not query profiles
    service_name: (a.service?.name as string) ?? "—",
    appointment_at: a.appointment_at as string,
    status: a.status as string,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Officer</h1>
      <AppointmentsTable rows={rows} />
    </div>
  );
}

function asString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}


