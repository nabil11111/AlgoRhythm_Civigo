"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { BookAppointmentSchema, type BookAppointmentInput } from "@/lib/validation";
import { mapPostgresError } from "@/lib/db/errors";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; message?: string };

export async function createAppointmentFromSlot(
  raw: BookAppointmentInput
): Promise<ActionResult<{ id: string; reference_code: string }>> {
  try {
    const profile = await getProfile();
    if (!profile) return { ok: false, error: "not_authenticated" } as const;
    if (profile.role !== "citizen")
      return { ok: false, error: "not_allowed" } as const;

    const input = BookAppointmentSchema.parse(raw);
    const supabase = await getServerClient();

    // Preferred: RPC for atomic capacity enforcement (placeholder if not present)
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc("book_appointment_slot", {
        p_slot_id: input.slot_id,
        p_notes: input.notes ?? null,
      })
      .maybeSingle();

    if (!rpcError && rpcResult) {
      const appointmentId = rpcResult.id as string;
      revalidatePath("/app/appointments");
      redirect(`/app/appointments/${appointmentId}`);
    }

    // Fallback: optimistic insert guarded by RLS and unique constraints
    // 1) Fetch slot details (active, service_id, slot_at)
    const { data: slot } = await supabase
      .from("service_slots")
      .select("id, active, service_id, slot_at")
      .eq("id", input.slot_id)
      .maybeSingle();
    if (!slot || slot.active !== true) {
      return { ok: false, error: "slot_inactive" } as const;
    }
    // 2) Count existing appointments in this slot
    const { count } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("service_id", slot.service_id)
      .eq("appointment_at", slot.slot_at);

    const { data: slotCap } = await supabase
      .from("service_slots")
      .select("capacity")
      .eq("id", input.slot_id)
      .maybeSingle();

    if (typeof count === "number" && slotCap?.capacity != null && count >= slotCap.capacity) {
      return { ok: false, error: "slot_full" } as const;
    }

    const { data: appt, error } = await supabase
      .from("appointments")
      .insert({
        citizen_id: profile.id,
        service_id: slot.service_id,
        appointment_at: slot.slot_at,
      })
      .select("id, reference_code")
      .single();

    if (error) {
      const mapped = mapPostgresError(error);
      return { ok: false, error: mapped.code, message: mapped.message } as const;
    }

    revalidatePath("/app/appointments");
    redirect(`/app/appointments/${appt.id}`);
  } catch (e) {
    const mapped = mapPostgresError(e);
    return { ok: false, error: mapped.code, message: mapped.message } as const;
  }
}


