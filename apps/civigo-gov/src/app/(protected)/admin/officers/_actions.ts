"use server";

import { revalidatePath } from "next/cache";
import { getServerClient, getServiceRoleClient } from "@/utils/supabase/server";
import {
  OfficerCreateSchema,
  OfficerAssignSchema,
  OfficerToggleSchema,
  type OfficerCreateInput,
  type OfficerAssignInput,
  type OfficerToggleInput,
} from "@/lib/validation";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; message?: string };

export async function createOfficerProfile(
  input: OfficerCreateInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = OfficerCreateSchema.parse(input);
    // Use service role to resolve auth user by email
    const sr = getServiceRoleClient();
    if (!sr) {
      return {
        ok: false,
        error: "service_role_missing",
        message:
          "Configure SUPABASE_SERVICE_ROLE_KEY on the server to create officer profiles by email.",
      };
    }
    const list = await sr.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (list.error)
      return {
        ok: false,
        error: "auth_admin_error",
        message: list.error.message,
      };
    const target = list.data.users.find(
      (u) => u.email?.toLowerCase() === parsed.email.toLowerCase()
    );
    if (!target) {
      return {
        ok: false,
        error: "auth_user_not_found",
        message:
          "No auth user found for this email. Create the user in Supabase Auth first.",
      };
    }
    // Prefer service-role client for privileged insert to bypass RLS safely on the server
    const client = sr ?? (await getServerClient());
    const { data, error } = await client
      .from("profiles")
      .insert({
        id: target.id,
        full_name: parsed.full_name,
        email: parsed.email,
        role: "officer",
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: "db_error", message: error.message };
    revalidatePath("/admin/officers");
    return { ok: true, data: { id: data.id } };
  } catch (e) {
    const err = e as { message?: string };
    return { ok: false, error: "invalid", message: err?.message };
  }
}

export async function assignOfficerToDepartment(
  input: OfficerAssignInput
): Promise<ActionResult<{ officer_id: string; department_id: string }>> {
  try {
    const parsed = OfficerAssignSchema.parse(input);
    const client = getServiceRoleClient() ?? (await getServerClient());
    const { error } = await client.from("officer_assignments").insert({
      officer_id: parsed.officer_id,
      department_id: parsed.department_id,
      active: true,
    });
    if (error) return { ok: false, error: "db_error", message: error.message };
    revalidatePath("/admin/officers");
    return {
      ok: true,
      data: {
        officer_id: parsed.officer_id,
        department_id: parsed.department_id,
      },
    };
  } catch (e) {
    const err = e as { message?: string };
    return { ok: false, error: "invalid", message: err?.message };
  }
}

export async function toggleOfficerAssignment(
  input: OfficerToggleInput
): Promise<
  ActionResult<{ officer_id: string; department_id: string; active: boolean }>
> {
  try {
    const parsed = OfficerToggleSchema.parse(input);
    const client = getServiceRoleClient() ?? (await getServerClient());
    const { error } = await client
      .from("officer_assignments")
      .update({ active: parsed.active })
      .eq("officer_id", parsed.officer_id)
      .eq("department_id", parsed.department_id);
    if (error) return { ok: false, error: "db_error", message: error.message };
    revalidatePath("/admin/officers");
    return {
      ok: true,
      data: {
        officer_id: parsed.officer_id,
        department_id: parsed.department_id,
        active: parsed.active,
      },
    };
  } catch (e) {
    const err = e as { message?: string };
    return { ok: false, error: "invalid", message: err?.message };
  }
}
