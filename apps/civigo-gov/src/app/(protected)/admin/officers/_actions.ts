"use server";

import { revalidatePath } from "next/cache";
import { getServerClient, getServiceRoleClient } from "@/utils/supabase/server";
import { mapPostgresError } from "@/lib/db/errors";
import {
  OfficerResetPasswordSchema,
  type OfficerResetPasswordInput,
} from "@/lib/validation";
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
    // Resolve the auth user by listing and matching email (Admin API v2 has getUserById, not by email)
    const list = await sr.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (list.error)
      return {
        ok: false,
        error: "auth_admin_error",
        message: list.error.message,
      };
    let target =
      list.data.users.find(
        (u) => u.email?.toLowerCase() === parsed.email.toLowerCase()
      ) ?? null;
    if (!target) {
      // Create auth user on the fly with officer role in user_metadata
      const created = await sr.auth.admin.createUser({
        email: parsed.email,
        email_confirm: true,
        password: parsed.temporaryPassword || undefined,
        user_metadata: { 
          full_name: parsed.full_name,
          role: "officer"
        },
      });
      if (created.error)
        return {
          ok: false,
          error: "auth_create_error",
          message: created.error.message,
        };
      target = created.data.user ?? null;
      if (!target)
        return {
          ok: false,
          error: "auth_create_error",
          message: "User creation returned no user",
        };
      // Optional: set app role metadata for future JWTs
      await sr.auth.admin.updateUserById(target.id, {
        app_metadata: { role: "officer" },
      });
    }
    // If existing and temp password supplied, update it
    if (target && parsed.temporaryPassword) {
      await sr.auth.admin.updateUserById(target.id, {
        password: parsed.temporaryPassword,
      });
    }

    // Use service-role client for DB writes to bypass RLS during creation
    const client = sr;
    // If a profiles row already exists (by email), return it to avoid unique violations
    const existing = await client
      .from("profiles")
      .select("id")
      .eq("email", parsed.email)
      .maybeSingle();
    if (existing.data?.id) {
      revalidatePath("/admin/officers");
      return { ok: true, data: { id: existing.data.id } };
    }
    const { data, error } = await client
      .from("profiles")
      .upsert(
        {
          id: target.id,
          full_name: parsed.full_name,
          email: parsed.email,
          role: "officer",
        },
        { onConflict: "id" }
      )
      .select("id")
      .single();
    if (error) {
      const fe = mapPostgresError(error);
      return { ok: false, error: fe.code, message: fe.message };
    }
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
    const sr = getServiceRoleClient();
    const client = sr ?? (await getServerClient());
    const { error } = await client.from("officer_assignments").insert({
      officer_id: parsed.officer_id,
      department_id: parsed.department_id,
      active: true,
    });
    if (error) {
      const fe = mapPostgresError(error);
      return { ok: false, error: fe.code, message: fe.message };
    }
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
    const sr = getServiceRoleClient();
    const client = sr ?? (await getServerClient());
    const { error } = await client
      .from("officer_assignments")
      .update({ active: parsed.active })
      .eq("officer_id", parsed.officer_id)
      .eq("department_id", parsed.department_id);
    if (error) {
      const fe = mapPostgresError(error);
      return { ok: false, error: fe.code, message: fe.message };
    }
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

export async function resetOfficerPassword(
  input: OfficerResetPasswordInput
): Promise<ActionResult<{ user_id: string }>> {
  try {
    const parsed = OfficerResetPasswordSchema.parse(input);
    const sr = getServiceRoleClient();
    if (!sr)
      return {
        ok: false,
        error: "service_role_missing",
        message: "Configure SUPABASE_SERVICE_ROLE_KEY",
      };
    const { error } = await sr.auth.admin.updateUserById(parsed.user_id, {
      password: parsed.newPassword,
    });
    if (error)
      return { ok: false, error: "auth_update_error", message: error.message };
    revalidatePath("/admin/officers");
    return { ok: true, data: { user_id: parsed.user_id } };
  } catch (e) {
    const err = e as { message?: string };
    return { ok: false, error: "invalid", message: err?.message };
  }
}
