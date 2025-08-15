"use server";

import { revalidatePath } from "next/cache";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { z } from "zod";
import { mapPostgresError } from "@/lib/db/errors";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; message?: string };

const IdSchema = z.object({ id: z.string().uuid(), deptId: z.string().uuid() });
const NoShowSchema = z.object({
  id: z.string().uuid(),
  deptId: z.string().uuid(),
  value: z.boolean(),
});

async function ensureOfficerDept(deptId: string) {
  const profile = await getProfile();
  if (!profile || profile.role !== "officer")
    return { ok: false as const, error: "forbidden" };
  const supabase = await getServerClient();
  const { data: assignment } = await supabase
    .from("officer_assignments")
    .select("id")
    .eq("officer_id", profile.id)
    .eq("department_id", deptId)
    .eq("active", true)
    .maybeSingle();
  if (!assignment) return { ok: false as const, error: "forbidden" };
  return { ok: true as const, profile };
}

export async function markCheckedIn(input: {
  id: string;
  deptId: string;
}): Promise<ActionResult<{ id: string }>> {
  const parsed = IdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guard = await ensureOfficerDept(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("appointments")
    .update({ checked_in_at: new Date().toISOString(), status: "booked" })
    .eq("id", parsed.data.id)
    .limit(1);
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(`/officer/departments/${parsed.data.deptId}`);
  return { ok: true, data: { id: parsed.data.id } };
}

export async function markStarted(input: {
  id: string;
  deptId: string;
}): Promise<ActionResult<{ id: string }>> {
  const parsed = IdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guard = await ensureOfficerDept(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("appointments")
    .update({ started_at: new Date().toISOString(), status: "booked" })
    .eq("id", parsed.data.id)
    .limit(1);
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(`/officer/departments/${parsed.data.deptId}`);
  return { ok: true, data: { id: parsed.data.id } };
}

export async function markCompleted(input: {
  id: string;
  deptId: string;
}): Promise<ActionResult<{ id: string }>> {
  const parsed = IdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guard = await ensureOfficerDept(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("appointments")
    .update({ completed_at: new Date().toISOString(), status: "completed" })
    .eq("id", parsed.data.id)
    .limit(1);
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(`/officer/departments/${parsed.data.deptId}`);
  return { ok: true, data: { id: parsed.data.id } };
}

export async function markCancelled(input: {
  id: string;
  deptId: string;
}): Promise<ActionResult<{ id: string }>> {
  const parsed = IdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guard = await ensureOfficerDept(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("appointments")
    .update({ cancelled_at: new Date().toISOString(), status: "cancelled" })
    .eq("id", parsed.data.id)
    .limit(1);
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(`/officer/departments/${parsed.data.deptId}`);
  return { ok: true, data: { id: parsed.data.id } };
}

export async function markNoShow(input: {
  id: string;
  deptId: string;
  value: boolean;
}): Promise<ActionResult<{ id: string }>> {
  const parsed = NoShowSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guard = await ensureOfficerDept(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("appointments")
    .update({ no_show: parsed.data.value })
    .eq("id", parsed.data.id)
    .limit(1);
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(`/officer/departments/${parsed.data.deptId}`);
  return { ok: true, data: { id: parsed.data.id } };
}
