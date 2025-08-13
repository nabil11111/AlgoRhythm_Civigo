import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "../admin/_actions";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import DepartmentHeader from "./_components/DepartmentHeader";

export default async function OfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) {
    redirect("/sign-in");
  }
  if (profile.role !== "officer") {
    if (profile.role === "admin") {
      redirect("/admin");
    }
    redirect("/sign-in");
  }

  const supabase = await getServerClient();
  const { data: assignments } = await supabase
    .from("officer_assignments")
    .select("department_id")
    .eq("officer_id", profile.id)
    .eq("active", true);
  const departmentIds = (assignments ?? []).map(
    (a: { department_id: string }) => a.department_id
  );
  let departmentName: string | null = null;
  if (departmentIds.length === 1) {
    const { data: dept } = await supabase
      .from("departments")
      .select("name")
      .eq("id", departmentIds[0])
      .single();
    departmentName = dept?.name ?? null;
  } else if (departmentIds.length > 1) {
    departmentName = `Multiple (${departmentIds.length})`;
  }

  return (
    <div className="min-h-screen grid grid-rows-[56px_1fr]">
      <header className="border-b px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/officer" className="font-semibold">
            Civigo Officer
          </Link>
          <DepartmentHeader departmentName={departmentName} />
        </div>
        <form action={signOut}>
          <button type="submit" className="border rounded px-3 py-1.5">
            Logout
          </button>
        </form>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
