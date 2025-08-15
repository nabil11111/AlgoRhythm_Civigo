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
import { z } from "zod";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; message?: string };

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

export async function createService(
  input: ServiceCreateInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = ServiceCreateSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "invalid", message: "Invalid input" };
  const guard = await requireOfficerAssignment(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("services")
    .insert({
      department_id: parsed.data.deptId,
      code: parsed.data.code,
      name: parsed.data.name,
    })
    .select("id")
    .single();
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(`/officer/departments/${parsed.data.deptId}/services`);
  return { ok: true, data: { id: data.id as string } };
}

export async function updateService(
  input: ServiceUpdateInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = ServiceUpdateSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "invalid", message: "Invalid input" };
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

export async function deleteService(
  input: ServiceDeleteInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = ServiceDeleteSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "invalid", message: "Invalid input" };
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

// Toggle per-branch service enablement
const ToggleBranchServiceSchema = z.object({
  deptId: z.string().uuid(),
  serviceId: z.string().uuid(),
  branchId: z.string().uuid(),
  enabled: z.boolean(),
});

export async function toggleServiceForBranch(
  input: z.infer<typeof ToggleBranchServiceSchema>
): Promise<ActionResult<{ serviceId: string; branchId: string; enabled: boolean }>> {
  const parsed = ToggleBranchServiceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guard = await requireOfficerAssignment(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("service_branch_settings")
    .upsert(
      {
        service_id: parsed.data.serviceId,
        branch_id: parsed.data.branchId,
        enabled: parsed.data.enabled,
      },
      { onConflict: "service_id,branch_id" } as any
    );
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(`/officer/departments/${parsed.data.deptId}/services`);
  return {
    ok: true,
    data: {
      serviceId: parsed.data.serviceId,
      branchId: parsed.data.branchId,
      enabled: parsed.data.enabled,
    },
  };
}

// Service instructions (rich text + PDF)
const ServiceInstructionsSchema = z.object({
  deptId: z.string().uuid(),
  serviceId: z.string().uuid(),
  instructions_richtext: z.any(),
});

export async function upsertServiceInstructions(
  input: z.infer<typeof ServiceInstructionsSchema>
): Promise<ActionResult<{ id: string }>> {
  const parsed = ServiceInstructionsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guard = await requireOfficerAssignment(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("services")
    .update({
      instructions_richtext: parsed.data.instructions_richtext,
      instructions_updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.serviceId)
    .eq("department_id", parsed.data.deptId);
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(`/officer/departments/${parsed.data.deptId}/services/${parsed.data.serviceId}`);
  return { ok: true, data: { id: parsed.data.serviceId } };
}

const PdfUploadSchema = z.object({
  deptId: z.string().uuid(),
  serviceId: z.string().uuid(),
  filename: z.string().min(1),
  contentType: z.string().regex(/^application\/pdf$/i),
  size: z.number().int().positive().max(10_000_000),
});

export async function uploadServiceInstructionsPdf(input: {
  deptId: string;
  serviceId: string;
  file: { name: string; type: string; size: number; arrayBuffer: () => Promise<ArrayBuffer> };
}): Promise<ActionResult<{ path: string }>> {
  const parsed = PdfUploadSchema.safeParse({
    deptId: input.deptId,
    serviceId: input.serviceId,
    filename: input.file.name,
    contentType: input.file.type,
    size: input.file.size,
  });
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guard = await requireOfficerAssignment(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  
  // Get service name for filename
  const { data: service } = await supabase
    .from("services")
    .select("name")
    .eq("id", parsed.data.serviceId)
    .eq("department_id", parsed.data.deptId)
    .single();

  if (!service) {
    return { ok: false, error: "service_not_found", message: "Service not found" };
  }

  // Generate filename with service name and trim spaces
  const serviceName = service.name.trim().replace(/\s+/g, '-').toLowerCase(); // Replace spaces with hyphens and lowercase
  const objectPath = `files/instructions-${serviceName}.pdf`;
  const ab = await input.file.arrayBuffer();
  const { error: upErr } = await supabase.storage
    .from("departments")
    .upload(objectPath, Buffer.from(ab), { contentType: parsed.data.contentType, upsert: true } as any);
  if (upErr) return { ok: false, error: "upload_failed", message: upErr.message };
  const { error: updErr } = await supabase
    .from("services")
    .update({ instructions_pdf_path: objectPath, instructions_updated_at: new Date().toISOString() })
    .eq("id", parsed.data.serviceId)
    .eq("department_id", parsed.data.deptId);
  if (updErr) return { ok: false, error: "db_error", message: updErr.message };
  revalidatePath(`/officer/departments/${parsed.data.deptId}/services/${parsed.data.serviceId}`);
  return { ok: true, data: { path: objectPath } };
}

export async function deleteServiceInstructionsPdf(input: {
  deptId: string;
  serviceId: string;
}): Promise<ActionResult<{ ok: true }>> {
  const guard = await requireOfficerAssignment(input.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" } as any;
  const supabase = await getServerClient();
  // Read current path
  const { data: svc } = await supabase
    .from("services")
    .select("instructions_pdf_path")
    .eq("id", input.serviceId)
    .eq("department_id", input.deptId)
    .maybeSingle();
  const path = (svc as any)?.instructions_pdf_path as string | null;
  if (path) {
    const { error: delErr } = await supabase.storage.from("departments").remove([path]);
    if (delErr) return { ok: false, error: "delete_failed", message: delErr.message };
  }
  const { error: updErr } = await supabase
    .from("services")
    .update({ instructions_pdf_path: null, instructions_updated_at: new Date().toISOString() })
    .eq("id", input.serviceId)
    .eq("department_id", input.deptId);
  if (updErr) return { ok: false, error: "db_error", message: updErr.message };
  revalidatePath(`/officer/departments/${input.deptId}/services/${input.serviceId}`);
  return { ok: true, data: { ok: true } };
}
