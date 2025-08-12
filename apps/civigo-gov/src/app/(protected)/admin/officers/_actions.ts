"use server";

import { revalidatePath } from "next/cache";
import { getServerClient } from "@/utils/supabase/server";
import { OfficerCreateSchema, OfficerAssignSchema, OfficerToggleSchema, type OfficerCreateInput, type OfficerAssignInput, type OfficerToggleInput } from "@/lib/validation";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; message?: string };

export async function createOfficerProfile(input: OfficerCreateInput): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = OfficerCreateSchema.parse(input);
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .insert({ full_name: parsed.full_name, email: parsed.email, role: "officer" })
      .select("id")
      .single();
    if (error) return { ok: false, error: "db_error", message: error.message };
    revalidatePath("/(protected)/admin/officers");
    return { ok: true, data: { id: data.id } };
  } catch (e) {
    const err = e as { message?: string };
    return { ok: false, error: "invalid", message: err?.message };
  }
}

export async function assignOfficerToDepartment(input: OfficerAssignInput): Promise<ActionResult<{ officer_id: string; department_id: string }>> {
  try {
    const parsed = OfficerAssignSchema.parse(input);
    const supabase = await getServerClient();
    const { error } = await supabase
      .from("officer_assignments")
      .insert({ officer_id: parsed.officer_id, department_id: parsed.department_id, active: true });
    if (error) return { ok: false, error: "db_error", message: error.message };
    revalidatePath("/(protected)/admin/officers");
    return { ok: true, data: { officer_id: parsed.officer_id, department_id: parsed.department_id } };
  } catch (e) {
    const err = e as { message?: string };
    return { ok: false, error: "invalid", message: err?.message };
  }
}

export async function toggleOfficerAssignment(input: OfficerToggleInput): Promise<ActionResult<{ officer_id: string; department_id: string; active: boolean }>> {
  try {
    const parsed = OfficerToggleSchema.parse(input);
    const supabase = await getServerClient();
    const { error } = await supabase
      .from("officer_assignments")
      .update({ active: parsed.active })
      .eq("officer_id", parsed.officer_id)
      .eq("department_id", parsed.department_id);
    if (error) return { ok: false, error: "db_error", message: error.message };
    revalidatePath("/(protected)/admin/officers");
    return { ok: true, data: { officer_id: parsed.officer_id, department_id: parsed.department_id, active: parsed.active } };
  } catch (e) {
    const err = e as { message?: string };
    return { ok: false, error: "invalid", message: err?.message };
  }
}


