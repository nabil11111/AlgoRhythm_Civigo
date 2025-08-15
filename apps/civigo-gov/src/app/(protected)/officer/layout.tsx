import { redirect } from "next/navigation";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { OfficerSidebar } from "./_components/OfficerSidebar";
import { OfficerTopbar } from "./_components/OfficerTopbar";
import { signOut } from "./_actions";

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
  // Get user's assigned departments with full details
  const { data: assignments } = await supabase
    .from("officer_assignments")
    .select(`
      department_id,
      departments:department_id(id, code, name, logo_path)
    `)
    .eq("officer_id", profile.id)
    .eq("active", true);

  const departments = (assignments ?? [])
    .map((a: any) => a.departments)
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <OfficerSidebar departments={departments} profile={profile} signOutAction={signOut} />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <OfficerTopbar profile={profile} departments={departments} />
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
