import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile, getServerClient } from "@/utils/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) {
    redirect("/sign-in");
  }
  if (profile.role !== "citizen") {
    // SSR guard: non-citizen roles cannot access citizen app
    const supabase = await getServerClient();
    await supabase.auth.signOut();
    redirect("/sign-in");
  }
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <Link href="/app" className="font-semibold">Civigo</Link>
        <nav className="flex items-center gap-4">
          <Link href="/app/appointments" className="underline">My Appointments</Link>
          <form action={signOutAction}>
            <button className="text-sm underline" type="submit">Sign out</button>
          </form>
        </nav>
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}

async function signOutAction() {
  "use server";
  const supabase = await getServerClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}


