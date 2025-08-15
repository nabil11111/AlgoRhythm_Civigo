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

    // Preferred: RPC for atomic capacity enforcement
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc("book_appointment_slot", {
        p_slot_id: input.slot_id,
        p_citizen_id: profile.id,
        p_notes: input.notes ?? null,
        p_citizen_gov_id: profile.gov_id ?? null,
      })
      .maybeSingle();

    const FALLBACK_ENABLED = process.env.CITIZEN_BOOKING_FALLBACK_ENABLED === "true";

    if (!rpcError && rpcResult) {
      const appointmentId = (rpcResult as any).appointment_id as string ?? (rpcResult as any).id as string;
      // Link NIC document on first booking (best effort; non-blocking)
      try {
        const { data: doc } = await supabase
          .from('documents')
          .select('id')
          .eq('owner_user_id', profile.id)
          .eq('owner_gov_id', profile.gov_id)
          .like('title', 'Identity: NIC%')
          .maybeSingle();
        if (doc?.id) {
          const { data: exists } = await supabase
            .from('appointment_documents')
            .select('id')
            .eq('appointment_id', appointmentId)
            .eq('document_id', doc.id)
            .maybeSingle();
          if (!exists) {
            await supabase.from('appointment_documents').insert({ appointment_id: appointmentId, document_id: doc.id });
          }
        }
      } catch {}
      revalidatePath("/app/appointments");
      redirect(`/app/appointments/${appointmentId}`);
    }
    if (rpcError) {
      const friendly = mapRpcBookingError(rpcError);
      // If RPC is missing and fallback is not enabled, surface friendly unavailability
      if (friendly === "rpc_not_available" && !FALLBACK_ENABLED) {
        return { ok: false, error: "booking_unavailable" } as const;
      }
      if (friendly !== "rpc_not_available") {
        return { ok: false, error: friendly } as const;
      }
      // else: rpc not available and fallback enabled → proceed to fallback
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
        citizen_gov_id: profile.gov_id ?? null,
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

// Exported for tests
export async function mapRpcBookingError(err: { code?: string; message?: string; details?: string } | null | undefined): Promise<
  | "slot_inactive"
  | "slot_full"
  | "slot_past"
  | "rpc_not_available"
  | "unknown"
> {
  if (!err) return "unknown";
  const c = (err.code || "").toUpperCase();
  const m = (err.message || "").toLowerCase();
  const d = (err.details || "").toLowerCase();
  // PostgREST function missing codes/messages vary
  if (c === "PGRST204" || m.includes("does not exist") || m.includes("unknown function") || (d.includes("function") && d.includes("does not exist"))) {
    return "rpc_not_available";
  }
  if (m.includes("slot inactive") || d.includes("slot inactive")) return "slot_inactive";
  if (m.includes("slot full") || d.includes("slot full") || (m.includes("capacity") && m.includes("exceeded"))) return "slot_full";
  if (m.includes("slot past") || d.includes("in the past") || m.includes("in the past")) return "slot_past";
  return "unknown";
}

export type BookSlotState = { ok?: boolean; error?: string };

export async function bookSlotAction(
  _prev: BookSlotState,
  formData: FormData
): Promise<BookSlotState> {
  "use server";
  const slot_id = String(formData.get("slot_id") || "");
  if (!slot_id) return { error: "unknown" };
  const result = await createAppointmentFromSlot({ slot_id });
  if (!result.ok) {
    return { error: result.error };
  }
  // On success we redirect inside createAppointmentFromSlot
  return { ok: true };
}


