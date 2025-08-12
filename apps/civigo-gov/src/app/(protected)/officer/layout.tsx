import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "../admin/_actions";
import { getProfile } from "@/utils/supabase/server";

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

  return (
    <div className="min-h-screen grid grid-rows-[56px_1fr]">
      <header className="border-b px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/officer" className="font-semibold">
            Civigo Officer
          </Link>
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


