import { getServerClient } from "@/utils/supabase/server";
import { createOfficerProfile, assignOfficerToDepartment, toggleOfficerAssignment } from "./_actions";

type OfficerRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  assignments: { department_id: string; code: string; name: string; active: boolean }[];
};

export default async function OfficersPage() {
  const supabase = getServerClient();

  const { data: officers } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "officer")
    .order("full_name", { ascending: true });

  const { data: assignments } = await supabase
    .from("officer_assignments")
    .select("officer_id, department_id, active, departments:department_id ( code, name )");

  const map: Record<string, OfficerRow> = {};
  for (const o of officers ?? []) {
    map[o.id] = { id: o.id, full_name: o.full_name, email: o.email, assignments: [] };
  }
  for (const a of (assignments as any) ?? []) {
    const row = map[a.officer_id];
    if (!row) continue;
    row.assignments.push({ department_id: a.department_id, code: a.departments.code, name: a.departments.name, active: a.active });
  }

  const { data: departments } = await supabase.from("departments").select("id, code, name").order("code");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Officers</h1>
        <form action={async (formData: FormData) => {
          "use server";
          const full_name = String(formData.get("full_name") || "");
          const email = String(formData.get("email") || "");
          await createOfficerProfile({ full_name, email });
        }} className="flex gap-2">
          <input name="full_name" placeholder="Full name" className="border rounded p-2" required />
          <input name="email" placeholder="Email" className="border rounded p-2" required />
          <button className="border rounded px-3 py-2">Add Officer</button>
        </form>
      </div>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Departments</th>
            <th className="p-2 border w-64">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(map).map((o) => (
            <tr key={o.id}>
              <td className="p-2 border">{o.full_name}</td>
              <td className="p-2 border">{o.email}</td>
              <td className="p-2 border">
                <div className="flex flex-wrap gap-1">
                  {o.assignments.map((a) => (
                    <span key={a.department_id} className={`px-2 py-1 rounded text-xs ${a.active ? 'bg-green-100' : 'bg-gray-100'}`}>{a.code}</span>
                  ))}
                </div>
              </td>
              <td className="p-2 border">
                <div className="flex gap-2 items-center">
                  <form action={async (formData: FormData) => {
                    "use server";
                    const officer_id = o.id;
                    const department_id = String(formData.get("department_id"));
                    await assignOfficerToDepartment({ officer_id, department_id });
                  }} className="flex gap-2">
                    <select name="department_id" className="border rounded p-1">
                      {(departments ?? []).map((d) => (
                        <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
                      ))}
                    </select>
                    <button className="border rounded px-2 py-1">Assign</button>
                  </form>
                </div>
                <div className="flex gap-2 mt-2">
                  {o.assignments.map((a) => (
                    <form key={a.department_id} action={async () => {
                      "use server";
                      await toggleOfficerAssignment({ officer_id: o.id, department_id: a.department_id, active: !a.active });
                    }}>
                      <button className="border rounded px-2 py-1" type="submit">{a.active ? 'Deactivate' : 'Activate'} {a.code}</button>
                    </form>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


