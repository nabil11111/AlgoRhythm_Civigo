import { getServerClient } from "@/utils/supabase/server";
import { createDepartment, updateDepartment, deleteDepartment } from "./_actions";

export default async function DepartmentsPage({ searchParams }: { searchParams: { page?: string; pageSize?: string } }) {
  const page = Math.max(1, Number(searchParams?.page ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams?.pageSize ?? 20)));
  const offset = (page - 1) * pageSize;

  const supabase = getServerClient();
  const { data: rows } = await supabase
    .from("departments")
    .select("id, code, name")
    .order("code", { ascending: true })
    .range(offset, offset + pageSize - 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Departments</h1>
        <form action={async (formData: FormData) => {
          "use server";
          const code = String(formData.get("code") || "");
          const name = String(formData.get("name") || "");
          await createDepartment({ code, name });
        }} className="flex gap-2">
          <input name="code" placeholder="Code" className="border rounded p-2" required />
          <input name="name" placeholder="Name" className="border rounded p-2" required />
          <button className="border rounded px-3 py-2">Add</button>
        </form>
      </div>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-2 border">Code</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border w-40">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(rows ?? []).map((d) => (
            <tr key={d.id}>
              <td className="p-2 border">{d.code}</td>
              <td className="p-2 border">{d.name}</td>
              <td className="p-2 border">
                <div className="flex gap-2">
                  <form action={async (formData: FormData) => {
                    "use server";
                    const id = d.id as string;
                    const code = String(formData.get("code") || d.code);
                    const name = String(formData.get("name") || d.name);
                    await updateDepartment({ id, code, name });
                  }} className="flex gap-2">
                    <input name="code" defaultValue={d.code} className="border rounded p-1 w-28" />
                    <input name="name" defaultValue={d.name} className="border rounded p-1 w-48" />
                    <button className="border rounded px-2 py-1">Save</button>
                  </form>
                  <form action={async () => {
                    "use server";
                    await deleteDepartment({ id: d.id });
                  }}>
                    <button className="border rounded px-2 py-1 text-red-700">Delete</button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


