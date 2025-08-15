import { NextRequest, NextResponse } from "next/server";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { BranchCreateSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deptId: string }> }
) {
  try {
    const { deptId } = await params;
    const body = await request.json();

    const profile = await getProfile();
    if (!profile || profile.role !== "officer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate the input
    const validation = BranchCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: `Validation failed: ${validation.error.message}` },
        { status: 400 }
      );
    }

    const supabase = await getServerClient();

    // Verify officer has access to this department
    const { data: assignment } = await supabase
      .from("officer_assignments")
      .select("id")
      .eq("officer_id", profile.id)
      .eq("department_id", deptId)
      .eq("active", true)
      .maybeSingle();

    if (!assignment) {
      return NextResponse.json(
        { error: "Access denied to this department" },
        { status: 403 }
      );
    }

    // Check if branch code already exists
    const { data: existingBranch } = await supabase
      .from("branches")
      .select("id")
      .eq("department_id", deptId)
      .eq("code", validation.data.code)
      .maybeSingle();

    if (existingBranch) {
      return NextResponse.json(
        { error: "Branch code already exists in this department" },
        { status: 409 }
      );
    }

    // Create the branch
    const { data: branch, error: createError } = await supabase
      .from("branches")
      .insert([validation.data])
      .select()
      .single();

    if (createError) {
      console.error("Branch creation error:", createError);
      return NextResponse.json(
        { error: `Failed to create branch: ${createError.message}` },
        { status: 500 }
      );
    }

    // Get all services for this department and create default settings
    const { data: services } = await supabase
      .from("services")
      .select("id")
      .eq("department_id", deptId);

    if (services && services.length > 0) {
      // Create default service_branch_settings (all enabled)
      const settings = services.map(service => ({
        service_id: service.id,
        branch_id: branch.id,
        enabled: true,
      }));

      const { error: settingsError } = await supabase
        .from("service_branch_settings")
        .insert(settings);

      if (settingsError) {
        console.error("Service settings creation error:", settingsError);
        // Don't fail the request, just log the error
      }
    }

    // Revalidate paths
    revalidatePath(`/officer/departments/${deptId}/branches`);
    revalidatePath(`/officer/departments/${deptId}`);

    return NextResponse.json({ success: true, branch });
  } catch (error) {
    console.error("Branch creation API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create branch" },
      { status: 500 }
    );
  }
}

