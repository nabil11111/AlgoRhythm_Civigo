import { NextRequest, NextResponse } from "next/server";
import { updateDepartmentDescription } from "../_actions";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deptId: string }> }
) {
  try {
    const { deptId } = await params;
    const formData = await request.formData();
    formData.set("deptId", deptId);
    
    const result = await updateDepartmentDescription(formData);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Description update API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: 500 }
    );
  }
}
