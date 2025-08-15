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
    <div className="min-h-screen grid grid-cols-[260px_1fr] bg-background">
      <aside className="sticky top-0 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border p-6 space-y-6">
        <div className="text-lg font-semibold tracking-tight">Civigo Admin</div>
        <nav className="grid gap-1.5 text-sm">
          <Link href="/admin" className="rounded-md px-2 py-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            Dashboard
          </Link>
          <Link href="/admin/departments" className="rounded-md px-2 py-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            Departments
          </Link>
          <Link href="/admin/officers" className="rounded-md px-2 py-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            Officers
          </Link>
        </nav>
        <form action={signOut}>
          <button
            type="submit"
            className="mt-2 inline-flex w-full items-center justify-center rounded-md border bg-background px-3 py-2 text-sm hover:bg-accent"
          >
            Logout
          </button>
        </form>
      </aside>
      <main className="p-8">{children}</main>
    </div>
  );
}
