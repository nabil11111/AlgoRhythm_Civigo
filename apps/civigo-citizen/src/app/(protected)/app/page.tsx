import Link from "next/link";
import { getServerClient } from "@/utils/supabase/server";
import { parsePagination, nextPageHref, prevPageHref } from "@/lib/pagination";

export default async function AppHome({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; pageSize?: string; q?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const { page, pageSize, offset } = parsePagination(sp);
  const q = sp.q?.trim();

  const supabase = await getServerClient();
  let query = supabase
    .from("departments")
    .select("id, code, name")
    .order("code", { ascending: true })
    .range(offset, offset + pageSize - 1);

  if (q) {
    // Basic multi-column search using OR + ilike
    query = query.or(`code.ilike.%${q}%,name.ilike.%${q}%`);
  }

  const { data: rows } = await query;

  const base = "/app";
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
      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search departments..."
          className="border rounded px-3 py-2 flex-1"
        />
        <button className="border rounded px-3 py-2" type="submit">
          Search
        </button>
      </form>

      <ul className="divide-y">
        {(rows ?? []).map((d) => (
          <li key={d.id} className="py-2">
            <Link href={`/app/departments/${d.id}`} className="underline">
              {d.code} — {d.name}
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


