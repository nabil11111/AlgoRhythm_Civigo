"use server";

import { revalidatePath } from "next/cache";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { mapPostgresError } from "@/lib/db/errors";
import { z } from "zod";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; message?: string };

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

const ToggleSchema = z.object({
  id: z.string().uuid(),
  serviceId: z.string().uuid(),
  active: z.boolean(),
});
const DeleteSchema = z.object({
  id: z.string().uuid(),
  serviceId: z.string().uuid(),
});

const BatchCreateSchema = z.object({
  serviceId: z.string().uuid(),
  start_date: z.string().min(1), // YYYY-MM-DD
  end_date: z.string().min(1), // YYYY-MM-DD
  start_time: z.string().regex(/^\d{2}:\d{2}$/), // HH:mm
  end_time: z.string().regex(/^\d{2}:\d{2}$/), // HH:mm
  interval_minutes: z.number().int().min(5).max(240),
  duration_minutes: z.number().int().min(5).max(240),
  capacity: z.number().int().min(1).max(100),
  skip_weekends: z.boolean().optional().default(true),
});

async function ensureOfficerService(serviceId: string) {
  const profile = await getProfile();
  if (!profile || profile.role !== "officer")
    return { ok: false as const, error: "forbidden" };
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

export async function createSlot(
  input: z.infer<typeof CreateSchema>
): Promise<ActionResult<{ id: string }>> {
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
  revalidatePath(
    `/officer/departments/${guard.deptId}/services/${parsed.data.serviceId}/slots`
  );
  return { ok: true, data: { id: data.id as string } };
}

export async function updateSlot(
  input: z.infer<typeof UpdateSchema>
): Promise<ActionResult<{ id: string }>> {
  const parsed = UpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guard = await ensureOfficerService(parsed.data.serviceId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const updates: any = {};
  if (parsed.data.slot_at !== undefined) updates.slot_at = parsed.data.slot_at;
  if (parsed.data.duration_minutes !== undefined)
    updates.duration_minutes = parsed.data.duration_minutes;
  if (parsed.data.capacity !== undefined)
    updates.capacity = parsed.data.capacity;
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
  revalidatePath(
    `/officer/departments/${guard.deptId}/services/${parsed.data.serviceId}/slots`
  );
  return { ok: true, data: { id: parsed.data.id } };
}

export async function toggleSlotActive(
  input: z.infer<typeof ToggleSchema>
): Promise<ActionResult<{ id: string; active: boolean }>> {
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
  revalidatePath(
    `/officer/departments/${guard.deptId}/services/${parsed.data.serviceId}/slots`
  );
  return { ok: true, data: { id: parsed.data.id, active: parsed.data.active } };
}

export async function deleteSlot(
  input: z.infer<typeof DeleteSchema>
): Promise<ActionResult<{ id: string }>> {
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
  revalidatePath(
    `/officer/departments/${guard.deptId}/services/${parsed.data.serviceId}/slots`
  );
  return { ok: true, data: { id: parsed.data.id } };
}

export async function createSlotsBatch(
  input: z.infer<typeof BatchCreateSchema>
): Promise<ActionResult<{ created: number }>> {
  const parsed = BatchCreateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guard = await ensureOfficerService(parsed.data.serviceId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();

  // Validate ranges
  const startDate = new Date(`${parsed.data.start_date}T00:00:00`);
  const endDate = new Date(`${parsed.data.end_date}T00:00:00`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { ok: false, error: "invalid", message: "Invalid date range" };
  }
  if (endDate < startDate) {
    return {
      ok: false,
      error: "invalid",
      message: "End date must be after start date",
    };
  }
  const [sh, sm] = parsed.data.start_time.split(":").map(Number);
  const [eh, em] = parsed.data.end_time.split(":").map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  if (endMinutes <= startMinutes) {
    return {
      ok: false,
      error: "invalid",
      message: "End time must be after start time",
    };
  }

  // Build date range [startDate..endDate]
  const days: Date[] = [];
  for (
    let d = new Date(startDate);
    d <= endDate;
    d = new Date(d.getTime() + 24 * 60 * 60 * 1000)
  ) {
    if (parsed.data.skip_weekends) {
      const wd = d.getDay();
      if (wd === 0 || wd === 6) continue; // skip Sun/Sat
    }
    days.push(new Date(d));
  }

  // Generate candidate slots
  const candidates: {
    slot_at: string;
    duration_minutes: number;
    capacity: number;
  }[] = [];
  for (const day of days) {
    for (
      let m = startMinutes;
      m <= endMinutes - parsed.data.duration_minutes;
      m += parsed.data.interval_minutes
    ) {
      const hours = Math.floor(m / 60);
      const minutes = m % 60;
      const dt = new Date(day);
      dt.setHours(hours, minutes, 0, 0);
      candidates.push({
        slot_at: dt.toISOString(),
        duration_minutes: parsed.data.duration_minutes,
        capacity: parsed.data.capacity,
      });
    }
  }

  // Short-circuit if nothing to create
  if (candidates.length === 0) {
    return { ok: true, data: { created: 0 } };
  }

  // Filter out duplicates based on existing slots in the window
  const windowStartIso = new Date(days[0]).toISOString();
  const windowEndIso = new Date(
    days[days.length - 1].getTime() + 24 * 60 * 60 * 1000
  ).toISOString();
  const { data: existing } = await supabase
    .from("service_slots")
    .select("slot_at")
    .eq("service_id", parsed.data.serviceId)
    .gte("slot_at", windowStartIso)
    .lt("slot_at", windowEndIso);
  const existingSet = new Set(
    (existing ?? []).map((e: any) => new Date(e.slot_at).toISOString())
  );
  const rows = candidates
    .filter((c) => !existingSet.has(c.slot_at))
    .map((c) => ({
      service_id: parsed.data.serviceId,
      slot_at: c.slot_at,
      duration_minutes: c.duration_minutes,
      capacity: c.capacity,
      created_by: guard.profile.id,
    }));

  if (rows.length === 0) {
    revalidatePath(
      `/officer/departments/${guard.deptId}/services/${parsed.data.serviceId}/slots`
    );
    return { ok: true, data: { created: 0 } };
  }

  const { error } = await supabase.from("service_slots").insert(rows);
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(
    `/officer/departments/${guard.deptId}/services/${parsed.data.serviceId}/slots`
  );
  return { ok: true, data: { created: rows.length } };
}
