import { redirect } from "next/navigation";
import { getServerClient, getProfile } from "@/utils/supabase/server";
import { AnalyticsDashboard } from "./_components/AnalyticsDashboard";
import { getAnalyticsData } from "./_actions";

export default async function AnalyticsPage() {
  const profile = await getProfile();
  const supabase = await getServerClient();
  
  // Get officer's department assignments
  const { data: assignments } = await supabase
    .from("officer_assignments")
    .select("department_id, departments:department_id(id, code, name)")
    .eq("officer_id", profile!.id)
    .eq("active", true);

  const departments = (assignments ?? [])
    .map((r: any) => r.departments)
    .filter(Boolean);

  if (departments.length === 0) {
    redirect("/officer");
  }

  const departmentIds = departments.map((d: any) => d.id);
  
  // Fetch analytics data
  const analyticsData = await getAnalyticsData(departmentIds);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Performance insights and key metrics
          </p>
        </div>
      </div>

      <AnalyticsDashboard 
        departments={departments}
        analyticsData={analyticsData}
      />
    </div>
  );
}
