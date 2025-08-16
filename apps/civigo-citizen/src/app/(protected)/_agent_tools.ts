"use server";

import { z } from "zod";
import { getProfile, getServerClient } from "@/utils/supabase/server";

// Schemas
const ServiceIdSchema = z.string().min(1);
const SlotIdSchema = z.string().uuid();
const IsoDateSchema = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid ISO date");

// Shared helpers
function toIsoUtc(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return new Date(d.getTime()).toISOString();
}

function mapRpcBookingError(
  err: { code?: string; message?: string; details?: string } | null | undefined
):
  | "slot_inactive"
  | "slot_full"
  | "slot_past"
  | "rpc_not_available"
  | "unknown" {
  if (!err) return "unknown";
  const c = (err.code || "").toUpperCase();
  const m = (err.message || "").toLowerCase();
  const d = (err.details || "").toLowerCase();
  if (
    c === "PGRST204" ||
    m.includes("does not exist") ||
    m.includes("unknown function") ||
    (d.includes("function") && d.includes("does not exist"))
  ) {
    return "rpc_not_available";
  }
  if (m.includes("slot inactive") || d.includes("slot inactive"))
    return "slot_inactive";
  if (
    m.includes("slot full") ||
    d.includes("slot full") ||
    (m.includes("capacity") && m.includes("exceeded"))
  )
    return "slot_full";
  if (
    m.includes("slot past") ||
    d.includes("in the past") ||
    m.includes("in the past")
  )
    return "slot_past";
  return "unknown";
}

// Types
export type ServiceInstructionsResult = {
  serviceName: string;
  instructions_richtext?: unknown;
  instructions_pdf_url?: string;
  branches: Array<{ id: string; code: string; name: string; address?: string }>;
};

export type SlotResult = {
  id: string;
  slot_at: string; // ISO UTC
  capacity: number;
  branch_id: string;
};

export type BookSlotResult = { appointmentId: string; reference_code: string };

export type UserDocument = {
  id: string;
  name: string;
  type: string;
  status?: string;
  created_at: string; // ISO UTC
};

export type UserAppointment = {
  id: string;
  appointment_at: string; // ISO UTC
  status: string;
  reference_code: string;
  service_id: string;
  slot_id?: string | null;
};

// 1) getServiceInstructions
export async function getServiceInstructions(
  serviceIdRaw: string
): Promise<ServiceInstructionsResult> {
  const serviceId = ServiceIdSchema.parse(serviceIdRaw);
  const supabase = await getServerClient();

  // Service core
  const { data: svc } = await supabase
    .from("services")
    .select(
      "id, name, instructions_richtext, instructions_pdf_path, department_id"
    )
    .eq("id", serviceId)
    .maybeSingle();

  if (!svc) {
    return { serviceName: "", branches: [] };
  }

  // Resolve PDF to public URL (departments bucket)
  let instructions_pdf_url: string | undefined;
  if ((svc as any).instructions_pdf_path) {
    const { data } = supabase.storage
      .from("departments")
      .getPublicUrl((svc as any).instructions_pdf_path as string);
    instructions_pdf_url = data.publicUrl || undefined;
  }

  // Branches enabled for this service via service_branch_settings
  const { data: enabledSbs } = await supabase
    .from("service_branch_settings")
    .select("branch_id")
    .eq("service_id", serviceId)
    .eq("enabled", true);

  let branches: any[] = [];
  if (enabledSbs && enabledSbs.length > 0) {
    const branchIds = enabledSbs.map((r: any) => r.branch_id);
    const { data: branchRows } = await supabase
      .from("branches")
      .select("id, code, name, address")
      .eq("department_id", (svc as any).department_id)
      .in("id", branchIds);
    branches = branchRows ?? [];
  }

  return {
    serviceName: (svc as any).name as string,
    instructions_richtext: (svc as any).instructions_richtext ?? undefined,
    instructions_pdf_url,
    branches: (branches ?? []).map((b: any) => ({
      id: b.id as string,
      code: b.code as string,
      name: b.name as string,
      address: b.address ?? undefined,
    })),
  };
}

// 2) searchSlots
export async function searchSlots(
  serviceIdRaw: string,
  dateFromISORaw: string,
  dateToISORaw: string,
  branchIdRaw?: string
): Promise<SlotResult[]> {
  const serviceId = ServiceIdSchema.parse(serviceIdRaw);
  const dateFromISO = IsoDateSchema.parse(dateFromISORaw);
  const dateToISO = IsoDateSchema.parse(dateToISORaw);
  const branchId = branchIdRaw ? ServiceIdSchema.parse(branchIdRaw) : undefined;

  const supabase = await getServerClient();
  let query = supabase
    .from("service_slots")
    .select("id, slot_at, capacity, branch_id")
    .eq("service_id", serviceId)
    .gte("slot_at", dateFromISO)
    .lte("slot_at", dateToISO)
    .order("slot_at", { ascending: true });

  if (branchId) query = query.eq("branch_id", branchId);

  const { data: rows } = await query;
  return (rows ?? []).map((r: any) => ({
    id: r.id as string,
    slot_at: toIsoUtc(r.slot_at as string),
    capacity: r.capacity as number,
    branch_id: r.branch_id as string,
  }));
}

// 3) bookSlot
export async function bookSlot(input: {
  slotId: string;
  notes?: string;
}): Promise<BookSlotResult> {
  const profile = await getProfile();
  if (!profile) throw new Error("not_authenticated");

  const slotId = SlotIdSchema.parse(input.slotId);
  const notes = input.notes?.toString() ?? null;

  const supabase = await getServerClient();

  const { data, error } = await supabase
    .rpc("book_appointment_slot", {
      p_slot_id: slotId,
      p_citizen_id: profile.id,
      p_notes: notes,
      p_citizen_gov_id: profile.gov_id ?? null,
    })
    .maybeSingle();

  if (error) {
    const code = mapRpcBookingError(error);
    throw new Error(code);
  }

  const appointmentId = (data as any)?.appointment_id ?? (data as any)?.id;
  const reference_code = (data as any)?.reference_code ?? "";
  if (!appointmentId) throw new Error("unknown");
  return { appointmentId, reference_code };
}

// 4) getUserDocuments
export async function getUserDocuments(): Promise<UserDocument[]> {
  const { getUserDocuments: getDocs } = await import("./_actions");
  const result = await getDocs();
  if (!result.ok) throw new Error(result.error ?? "unknown");
  return (result.documents ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    status: d.status,
    created_at: toIsoUtc(d.created_at),
  }));
}

// 5) getUserAppointments
export async function getUserAppointments(): Promise<UserAppointment[]> {
  const profile = await getProfile();
  if (!profile) throw new Error("not_authenticated");

  const supabase = await getServerClient();
  const { data: rows } = await supabase
    .from("appointments")
    .select("id, appointment_at, status, reference_code, service_id, slot_id")
    .eq("citizen_id", profile.id)
    .order("appointment_at", { ascending: false });

  return (rows ?? []).map((r: any) => ({
    id: r.id as string,
    appointment_at: toIsoUtc(r.appointment_at as string),
    status: r.status as string,
    reference_code: r.reference_code as string,
    service_id: r.service_id as string,
    slot_id: r.slot_id as string | null,
  }));
}
