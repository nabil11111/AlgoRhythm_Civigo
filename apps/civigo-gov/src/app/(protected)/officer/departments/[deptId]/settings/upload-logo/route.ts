import { NextRequest, NextResponse } from "next/server";
import { uploadDepartmentLogo } from "../_actions";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deptId: string }> }
) {
  try {
    const { deptId } = await params;
    const formData = await request.formData();
    formData.set("deptId", deptId);
    
    const result = await uploadDepartmentLogo(formData);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Logo upload API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
