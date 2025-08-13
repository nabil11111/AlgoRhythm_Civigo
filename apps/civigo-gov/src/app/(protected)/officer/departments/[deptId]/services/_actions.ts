"use server";

import { revalidatePath } from "next/cache";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import {
  ServiceCreateSchema,
  ServiceDeleteSchema,
  ServiceUpdateSchema,
  type ServiceCreateInput,
  type ServiceDeleteInput,
  type ServiceUpdateInput,
} from "@/lib/validation";
import { mapPostgresError } from "@/lib/db/errors";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; message?: string };

async function requireOfficerAssignment(deptId: string) {
  const profile = await getProfile();
  if (!profile || profile.role !== "officer") {
    return { ok: false as const, error: "forbidden" };
  }
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

export async function createService(input: ServiceCreateInput): Promise<ActionResult<{ id: string }>> {
  const parsed = ServiceCreateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid", message: "Invalid input" };
  const guard = await requireOfficerAssignment(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("services")
    .insert({ department_id: parsed.data.deptId, code: parsed.data.code, name: parsed.data.name })
    .select("id")
    .single();
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(`/officer/departments/${parsed.data.deptId}/services`);
  return { ok: true, data: { id: data.id as string } };
}

export async function updateService(input: ServiceUpdateInput): Promise<ActionResult<{ id: string }>> {
  const parsed = ServiceUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid", message: "Invalid input" };
  const guard = await requireOfficerAssignment(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("services")
    .update({ code: parsed.data.code, name: parsed.data.name })
    .eq("id", parsed.data.id)
    .eq("department_id", parsed.data.deptId);
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(`/officer/departments/${parsed.data.deptId}/services`);
  return { ok: true, data: { id: parsed.data.id } };
}

export async function deleteService(input: ServiceDeleteInput): Promise<ActionResult<{ id: string }>> {
  const parsed = ServiceDeleteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid", message: "Invalid input" };
  const guard = await requireOfficerAssignment(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", parsed.data.id)
    .eq("department_id", parsed.data.deptId);
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(`/officer/departments/${parsed.data.deptId}/services`);
  return { ok: true, data: { id: parsed.data.id } };
}


