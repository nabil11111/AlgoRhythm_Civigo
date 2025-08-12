"use server";

import { revalidatePath } from "next/cache";
import { getServerClient } from "@/utils/supabase/server";
import {
  DepartmentCreateSchema,
  DepartmentUpdateSchema,
  type DepartmentCreateInput,
  type DepartmentUpdateInput,
} from "@/lib/validation";

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
    const err = e as { message?: string };
    const message = err?.message || "validation_or_unknown";
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
    const err = e as { message?: string };
    const message = err?.message || "validation_or_unknown";
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
