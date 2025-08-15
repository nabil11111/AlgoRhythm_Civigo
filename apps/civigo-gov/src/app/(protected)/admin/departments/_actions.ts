"use server";

import { revalidatePath } from "next/cache";
import { getServerClient } from "@/utils/supabase/server";
import {
  DepartmentCreateSchema,
  DepartmentUpdateSchema,
  DepartmentDescriptionSchema,
  BranchCreateSchema,
  BranchUpdateSchema,
  BranchDeleteSchema,
  type DepartmentCreateInput,
  type DepartmentUpdateInput,
  type DepartmentDescriptionInput,
  type BranchCreateInput,
  type BranchUpdateInput,
  type BranchDeleteInput,
} from "@/lib/validation";
import { z } from "zod";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; message?: string };

export async function createDepartment(
  input: DepartmentCreateInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = DepartmentCreateSchema.parse(input);
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from("departments")
      .insert({ code: parsed.code, name: parsed.name })
      .select("id")
      .single();
    if (error) return { ok: false, error: "db_error", message: error.message };
    revalidatePath("/admin/departments");
    return { ok: true, data: { id: data.id } };
  } catch (e) {
    const err: unknown = e;
    const message = (err as { message?: string })?.message || "validation_or_unknown";
    return { ok: false, error: "invalid", message };
  }
}

export async function updateDepartment(
  input: DepartmentUpdateInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = DepartmentUpdateSchema.parse(input);
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from("departments")
      .update({ code: parsed.code, name: parsed.name })
      .eq("id", parsed.id)
      .select("id")
      .single();
    if (error) return { ok: false, error: "db_error", message: error.message };
    revalidatePath("/admin/departments");
    return { ok: true, data: { id: data.id } };
  } catch (e) {
    const err: unknown = e;
    const message = (err as { message?: string })?.message || "validation_or_unknown";
    return { ok: false, error: "invalid", message };
  }
}

export async function updateDepartmentDescription(
  input: DepartmentDescriptionInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = DepartmentDescriptionSchema.parse(input);
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from("departments")
      .update({
        description_richtext: parsed.description_richtext,
        description_updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.id)
      .select("id")
      .single();
    if (error) return { ok: false, error: "db_error", message: error.message };
    revalidatePath("/admin/departments");
    return { ok: true, data: { id: data.id } };
  } catch (e) {
    const err: unknown = e;
    const message = (err as { message?: string })?.message || "validation_or_unknown";
    return { ok: false, error: "invalid", message };
  }
}

export async function createBranch(
  input: BranchCreateInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = BranchCreateSchema.parse(input);
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from("branches")
      .insert({
        department_id: parsed.department_id,
        code: parsed.code,
        name: parsed.name,
        address: parsed.address ?? null,
        location_lat: parsed.location_lat ?? null,
        location_lng: parsed.location_lng ?? null,
        meta: parsed.meta ?? null,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: "db_error", message: error.message };
    revalidatePath("/admin/departments");
    return { ok: true, data: { id: data.id } };
  } catch (e) {
    const err: unknown = e;
    const message = (err as { message?: string })?.message || "validation_or_unknown";
    return { ok: false, error: "invalid", message };
  }
}

export async function updateBranch(
  input: BranchUpdateInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = BranchUpdateSchema.parse(input);
    const updates: Record<string, unknown> = {};
    if (parsed.code !== undefined) updates.code = parsed.code;
    if (parsed.name !== undefined) updates.name = parsed.name;
    if (parsed.address !== undefined) updates.address = parsed.address;
    if (parsed.location_lat !== undefined)
      updates.location_lat = parsed.location_lat;
    if (parsed.location_lng !== undefined)
      updates.location_lng = parsed.location_lng;
    if (parsed.meta !== undefined) updates.meta = parsed.meta;
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from("branches")
      .update(updates)
      .eq("id", parsed.id)
      .eq("department_id", parsed.department_id)
      .select("id")
      .single();
    if (error) return { ok: false, error: "db_error", message: error.message };
    revalidatePath("/admin/departments");
    return { ok: true, data: { id: data.id } };
  } catch (e) {
    const err: unknown = e;
    const message = (err as { message?: string })?.message || "validation_or_unknown";
    return { ok: false, error: "invalid", message };
  }
}

export async function deleteBranch(
  input: BranchDeleteInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = BranchDeleteSchema.parse(input);
    const supabase = await getServerClient();
    // Optional: prevent delete if slots exist in branch
    const { count } = await supabase
      .from("service_slots")
      .select("id", { count: "exact", head: true })
      .eq("branch_id", parsed.id);
    if ((count ?? 0) > 0) return { ok: false, error: "branch_has_slots" };
    const { data, error } = await supabase
      .from("branches")
      .delete()
      .eq("id", parsed.id)
      .eq("department_id", parsed.department_id)
      .select("id")
      .single();
    if (error) return { ok: false, error: "db_error", message: error.message };
    revalidatePath("/admin/departments");
    return { ok: true, data: { id: data.id } };
  } catch (e) {
    const err: unknown = e;
    const message = (err as { message?: string })?.message || "validation_or_unknown";
    return { ok: false, error: "invalid", message };
  }
}

export async function deleteDepartment(input: {
  id: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const { id } = input;
    if (!id) return { ok: false, error: "invalid", message: "id required" };
    const supabase = await getServerClient();
    // Guard: check references in services and officer_assignments
    const { count: svcCount } = await supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("department_id", id);
    if ((svcCount ?? 0) > 0)
      return { ok: false, error: "department_has_dependencies" };

    const { count: asgCount } = await supabase
      .from("officer_assignments")
      .select("id", { count: "exact", head: true })
      .eq("department_id", id);
    if ((asgCount ?? 0) > 0)
      return { ok: false, error: "department_has_dependencies" };

    const { data, error } = await supabase
      .from("departments")
      .delete()
      .eq("id", id)
      .select("id")
      .single();
    if (error) return { ok: false, error: "db_error", message: error.message };
    revalidatePath("/admin/departments");
    return { ok: true, data: { id: data.id } };
  } catch (e) {
    const err = e as { message?: string };
    const message = err?.message || "validation_or_unknown";
    return { ok: false, error: "invalid", message };
  }
}

const ImageUploadSchema = z.object({
  id: z.string().uuid(),
  filename: z.string().min(1),
  contentType: z
    .string()
    .regex(/^image\/(png|jpeg|jpg|webp)$/i, {
      message: "Only PNG/JPEG/WEBP allowed",
    }),
  size: z.number().int().positive().max(1_000_000),
});

export async function uploadDepartmentLogo(input: {
  id: string;
  file: {
    name: string;
    type: string;
    size: number;
    arrayBuffer: () => Promise<ArrayBuffer>;
  };
}): Promise<ActionResult<{ path: string }>> {
  try {
    const parsed = ImageUploadSchema.parse({
      id: input.id,
      filename: input.file.name,
      contentType: input.file.type,
      size: input.file.size,
    });
    const supabase = await getServerClient();
    
    // Get department code for filename
    const { data: department } = await supabase
      .from("departments")
      .select("code")
      .eq("id", parsed.id)
      .single();

    if (!department) {
      return { ok: false, error: "department_not_found", message: "Department not found" };
    }

    const ext = parsed.filename.split(".").pop()!.toLowerCase();
    const deptCode = department.code.trim().replace(/\s+/g, '-'); // Replace spaces with hyphens
    const objectPath = `logos/logo-${deptCode}.${ext}`;
    const ab = await input.file.arrayBuffer();
    const { error: upErr } = await supabase.storage
      .from("departments")
      .upload(objectPath, Buffer.from(ab), {
        contentType: parsed.contentType,
        upsert: true,
      } as { contentType: string; upsert: boolean });
    if (upErr) return { ok: false, error: "upload_failed", message: upErr.message };
    // Update department.logo_path
    const { error: updErr } = await supabase
      .from("departments")
      .update({ logo_path: objectPath, description_updated_at: new Date().toISOString() })
      .eq("id", parsed.id);
    if (updErr)
      return { ok: false, error: "db_error", message: updErr.message };
    revalidatePath("/admin/departments");
    return { ok: true, data: { path: objectPath } };
  } catch (e) {
    const err: unknown = e;
    const message = (err as { message?: string })?.message || "validation_or_unknown";
    return { ok: false, error: "invalid", message };
  }
}
