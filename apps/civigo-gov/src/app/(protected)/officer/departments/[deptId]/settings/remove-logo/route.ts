import { NextRequest, NextResponse } from "next/server";
import { removeDepartmentLogo } from "../_actions";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ deptId: string }> }
) {
  try {
    const { deptId } = await params;
    
    const result = await removeDepartmentLogo(deptId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Logo removal API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Removal failed" },
      { status: 500 }
    );
  }
}
