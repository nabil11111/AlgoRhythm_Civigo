import Link from "next/link";
import { getServerClient } from "@/utils/supabase/server";
import { parsePagination, nextPageHref, prevPageHref } from "@/lib/pagination";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ page?: string; pageSize?: string; q?: string }>;
};

export default async function DepartmentServicesPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const { page, pageSize, offset } = parsePagination(sp);
  const q = sp.q?.trim();

  const supabase = await getServerClient();
  const { data: dept } = await supabase
    .from("departments")
    .select("id, code, name")
    .eq("id", id)
    .maybeSingle();

  let query = supabase
    .from("services")
    .select("id, code, name")
    .eq("department_id", id)
    .order("code", { ascending: true })
    .range(offset, offset + pageSize - 1);

  if (q) {
    query = query.or(`code.ilike.%${q}%,name.ilike.%${q}%`);
  }

  const { data: rows } = await query;

  const base = `/app/departments/${id}`;
  function withParams(next: { page?: number }) {
    const spx = new URLSearchParams();
    spx.set("page", String(next.page ?? page));
    spx.set("pageSize", String(pageSize));
    if (q) spx.set("q", q);
    return `${base}?${spx.toString()}`;
  }
  const prevHref = withParams({ page: Math.max(1, page - 1) });
  const nextHref = withParams({ page: page + 1 });

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        <Link href="/app" className="underline">Departments</Link> / {dept?.name}
      </div>

      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search services..."
          className="border rounded px-3 py-2 flex-1"
        />
        <button className="border rounded px-3 py-2" type="submit">
          Search
        </button>
      </form>

      <ul className="divide-y">
        {(rows ?? []).map((s) => (
          <li key={s.id} className="py-2">
            <Link href={`/app/services/${s.id}`} className="underline">
              {s.code} — {s.name}
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex justify-between">
        <a className="underline" href={prevHref}>
          Previous
        </a>
        <a className="underline" href={nextHref}>
          Next
        </a>
      </div>
    </div>
  );
}


