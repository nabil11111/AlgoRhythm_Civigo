import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/utils/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  if (!profile) {
    redirect("/(auth)/sign-in");
  }
  if (profile.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r p-4 space-y-4">
        <div className="text-lg font-semibold">Civigo Admin</div>
        <nav className="grid gap-2 text-sm">
          <Link href="/\(protected\)/admin" className="hover:underline">Dashboard</Link>
          <Link href="/\(protected\)/admin/departments" className="hover:underline">Departments</Link>
          <Link href="/\(protected\)/admin/officers" className="hover:underline">Officers</Link>
        </nav>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  );
}


