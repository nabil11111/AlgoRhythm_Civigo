import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "./_actions";
import { getProfile } from "@/utils/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) {
    redirect("/sign-in");
  }
  if (profile.role !== "admin") {
    if (profile.role === "officer") {
      redirect("/officer");
    }
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r p-4 space-y-4">
        <div className="text-lg font-semibold">Civigo Admin</div>
        <nav className="grid gap-2 text-sm">
          <Link href="/admin" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/admin/departments" className="hover:underline">
            Departments
          </Link>
          <Link href="/admin/officers" className="hover:underline">
            Officers
          </Link>
        </nav>
        <form action={signOut}>
          <button
            type="submit"
            className="mt-4 border rounded px-3 py-2 w-full text-left"
          >
            Logout
          </button>
        </form>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  );
}
