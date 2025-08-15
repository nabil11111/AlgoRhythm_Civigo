import { NextRequest, NextResponse } from "next/server";
import { toggleServiceForBranch } from "../_actions";

export async function POST(request: NextRequest, { params }: { params: Promise<{ deptId: string }> }) {
  try {
    const body = await request.json();
    const { serviceId, branchId, enabled } = body as {
      serviceId?: string;
      branchId?: string;
      enabled?: boolean;
    };
    const { deptId } = await params;
    if (!serviceId || !branchId || typeof enabled !== "boolean") {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const result = await toggleServiceForBranch({ deptId, serviceId, branchId, enabled });
    if (!result.ok) {
      return NextResponse.json({ error: result.error, message: result.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}



