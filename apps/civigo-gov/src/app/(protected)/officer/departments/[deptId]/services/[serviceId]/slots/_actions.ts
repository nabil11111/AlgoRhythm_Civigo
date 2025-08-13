"use server";

import { revalidatePath } from "next/cache";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { mapPostgresError } from "@/lib/db/errors";
import { z } from "zod";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; message?: string };

const CreateSchema = z.object({
  serviceId: z.string().uuid(),
  slot_at: z.string().datetime(),
  duration_minutes: z.number().int().min(5).max(240),
  capacity: z.number().int().min(1).max(100),
});

const UpdateSchema = z.object({
  id: z.string().uuid(),
  serviceId: z.string().uuid(),
  slot_at: z.string().datetime().optional(),
  duration_minutes: z.number().int().min(5).max(240).optional(),
  capacity: z.number().int().min(1).max(100).optional(),
  active: z.boolean().optional(),
});

const ToggleSchema = z.object({ id: z.string().uuid(), serviceId: z.string().uuid(), active: z.boolean() });
const DeleteSchema = z.object({ id: z.string().uuid(), serviceId: z.string().uuid() });

async function ensureOfficerService(serviceId: string) {
  const profile = await getProfile();
  if (!profile || profile.role !== "officer") return { ok: false as const, error: "forbidden" };
  const supabase = await getServerClient();
  const { data } = await supabase
    .from("services")
    .select("department_id")
    .eq("id", serviceId)
    .maybeSingle();
  if (!data) return { ok: false as const, error: "forbidden" };
  const { data: assignment } = await supabase
    .from("officer_assignments")
    .select("id")
    .eq("officer_id", profile.id)
    .eq("department_id", data.department_id)
    .eq("active", true)
    .maybeSingle();
  if (!assignment) return { ok: false as const, error: "forbidden" };
  return { ok: true as const, profile, deptId: data.department_id as string };
}

export async function createSlot(input: z.infer<typeof CreateSchema>): Promise<ActionResult<{ id: string }>> {
  const parsed = CreateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guard = await ensureOfficerService(parsed.data.serviceId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("service_slots")
    .insert({
      service_id: parsed.data.serviceId,
      slot_at: parsed.data.slot_at,
      duration_minutes: parsed.data.duration_minutes,
      capacity: parsed.data.capacity,
      created_by: guard.profile.id,
    })
    .select("id")
    .single();
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(`/officer/departments/${guard.deptId}/services/${parsed.data.serviceId}/slots`);
  return { ok: true, data: { id: data.id as string } };
}

export async function updateSlot(input: z.infer<typeof UpdateSchema>): Promise<ActionResult<{ id: string }>> {
  const parsed = UpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guard = await ensureOfficerService(parsed.data.serviceId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const updates: any = {};
  if (parsed.data.slot_at !== undefined) updates.slot_at = parsed.data.slot_at;
  if (parsed.data.duration_minutes !== undefined) updates.duration_minutes = parsed.data.duration_minutes;
  if (parsed.data.capacity !== undefined) updates.capacity = parsed.data.capacity;
  if (parsed.data.active !== undefined) updates.active = parsed.data.active;
  const { error } = await supabase
    .from("service_slots")
    .update(updates)
    .eq("id", parsed.data.id)
    .eq("service_id", parsed.data.serviceId);
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(`/officer/departments/${guard.deptId}/services/${parsed.data.serviceId}/slots`);
  return { ok: true, data: { id: parsed.data.id } };
}

export async function toggleSlotActive(input: z.infer<typeof ToggleSchema>): Promise<ActionResult<{ id: string; active: boolean }>> {
  const parsed = ToggleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guard = await ensureOfficerService(parsed.data.serviceId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("service_slots")
    .update({ active: parsed.data.active })
    .eq("id", parsed.data.id)
    .eq("service_id", parsed.data.serviceId);
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(`/officer/departments/${guard.deptId}/services/${parsed.data.serviceId}/slots`);
  return { ok: true, data: { id: parsed.data.id, active: parsed.data.active } };
}

export async function deleteSlot(input: z.infer<typeof DeleteSchema>): Promise<ActionResult<{ id: string }>> {
  const parsed = DeleteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guard = await ensureOfficerService(parsed.data.serviceId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("service_slots")
    .delete()
    .eq("id", parsed.data.id)
    .eq("service_id", parsed.data.serviceId);
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(`/officer/departments/${guard.deptId}/services/${parsed.data.serviceId}/slots`);
  return { ok: true, data: { id: parsed.data.id } };
}


