"use server";

import { revalidatePath } from "next/cache";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { z } from "zod";
import { mapPostgresError } from "@/lib/db/errors";
import { sendAppointmentConfirmationEmail, logNotification } from "@/lib/email";
import { format } from "date-fns";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; message?: string };

const IdSchema = z.object({ id: z.string().uuid(), deptId: z.string().uuid() });
const NoShowSchema = z.object({
  id: z.string().uuid(),
  deptId: z.string().uuid(),
  value: z.boolean(),
});

async function ensureOfficerDept(deptId: string) {
  const profile = await getProfile();
  if (!profile || profile.role !== "officer")
    return { ok: false as const, error: "forbidden" };
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

export async function markCheckedIn(input: {
  id: string;
  deptId: string;
}): Promise<ActionResult<{ id: string }>> {
  const parsed = IdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guard = await ensureOfficerDept(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("appointments")
    .update({ checked_in_at: new Date().toISOString(), status: "booked" })
    .eq("id", parsed.data.id)
    .limit(1);
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(`/officer/departments/${parsed.data.deptId}`);
  return { ok: true, data: { id: parsed.data.id } };
}

export async function markStarted(input: {
  id: string;
  deptId: string;
}): Promise<ActionResult<{ id: string }>> {
  const parsed = IdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guard = await ensureOfficerDept(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("appointments")
    .update({ started_at: new Date().toISOString(), status: "booked" })
    .eq("id", parsed.data.id)
    .limit(1);
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(`/officer/departments/${parsed.data.deptId}`);
  return { ok: true, data: { id: parsed.data.id } };
}

export async function markCompleted(input: {
  id: string;
  deptId: string;
}): Promise<ActionResult<{ id: string }>> {
  const parsed = IdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guard = await ensureOfficerDept(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("appointments")
    .update({ completed_at: new Date().toISOString(), status: "completed" })
    .eq("id", parsed.data.id)
    .limit(1);
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(`/officer/departments/${parsed.data.deptId}`);
  return { ok: true, data: { id: parsed.data.id } };
}

export async function markCancelled(input: {
  id: string;
  deptId: string;
}): Promise<ActionResult<{ id: string }>> {
  const parsed = IdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guard = await ensureOfficerDept(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("appointments")
    .update({ cancelled_at: new Date().toISOString(), status: "cancelled" })
    .eq("id", parsed.data.id)
    .limit(1);
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(`/officer/departments/${parsed.data.deptId}`);
  return { ok: true, data: { id: parsed.data.id } };
}

export async function markNoShow(input: {
  id: string;
  deptId: string;
  value: boolean;
}): Promise<ActionResult<{ id: string }>> {
  const parsed = NoShowSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guard = await ensureOfficerDept(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("appointments")
    .update({ no_show: parsed.data.value })
    .eq("id", parsed.data.id)
    .limit(1);
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }
  revalidatePath(`/officer/departments/${parsed.data.deptId}`);
  return { ok: true, data: { id: parsed.data.id } };
}

export async function markConfirmed(input: {
  id: string;
  deptId: string;
}): Promise<ActionResult<{ id: string }>> {
  const parsed = IdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guard = await ensureOfficerDept(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  const supabase = await getServerClient();
  
  // Update appointment status first
  const { error } = await supabase
    .from("appointments")
    .update({ 
      confirmed_at: new Date().toISOString(),
      status: "confirmed"
    })
    .eq("id", parsed.data.id)
    .limit(1);
    
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }

  // Get appointment details for email - use simpler queries
  try {
    console.log('Fetching appointment details for email notification...');
    
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("id, appointment_at, citizen_id, service_id, slot_id")
      .eq("id", parsed.data.id)
      .single();

    if (appointmentError || !appointment) {
      console.error('Failed to fetch appointment:', appointmentError);
      // Don't fail the confirmation, just skip email
      revalidatePath(`/officer/departments/${parsed.data.deptId}`);
      return { ok: true, data: { id: parsed.data.id } };
    }

    // Get citizen details
    const { data: citizen } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", appointment.citizen_id)
      .single();

    if (!citizen?.email || !citizen?.full_name) {
      console.log('Citizen has no email or name, skipping email notification');
      revalidatePath(`/officer/departments/${parsed.data.deptId}`);
      return { ok: true, data: { id: parsed.data.id } };
    }

    // Get service and department details
    const { data: service } = await supabase
      .from("services")
      .select("name, departments:department_id(name)")
      .eq("id", appointment.service_id)
      .single();

    // Get branch details if slot_id exists
    let branch = null;
    if (appointment.slot_id) {
      const { data: slot } = await supabase
        .from("service_slots")
        .select("branches:branch_id(name)")
        .eq("id", appointment.slot_id)
        .single();
      branch = slot?.branches;
    }

    console.log('Preparing email data...');
    const appointmentDate = new Date(appointment.appointment_at);
    const emailData = {
      citizenName: citizen.full_name,
      citizenEmail: citizen.email,
      appointmentDate: format(appointmentDate, 'EEEE, MMMM d, yyyy'),
      appointmentTime: format(appointmentDate, 'h:mm a'),
      serviceName: service?.name || 'Government Service',
      departmentName: service?.departments?.name || 'Government Department',
      referenceCode: parsed.data.id.substring(0, 10).toUpperCase(),
      branchName: branch?.name,
    };

    console.log('Sending confirmation email to:', citizen.email);
    console.log('Citizen ID for notification logging:', appointment.citizen_id);
    const emailResult = await sendAppointmentConfirmationEmail(emailData);
    
    console.log('Email result:', emailResult.success ? 'SUCCESS' : 'FAILED', emailResult.error || '');
    
    // Log notification attempt
    const logResult = await logNotification(
      appointment.citizen_id,
      parsed.data.id,
      'email',
      'status_update',
      emailResult.success ? 'sent' : 'failed',
      {
        subject: 'Appointment Confirmed',
        to: citizen.email,
        error: emailResult.success ? null : emailResult.error,
      }
    );

    console.log('Notification log result:', logResult.success ? 'SUCCESS' : 'FAILED', logResult.error || '');
    
    if (!logResult.success) {
      console.log('Note: Notification logging failed due to RLS policy - this is expected until migration is applied');
    }

    if (!emailResult.success) {
      console.error('Failed to send confirmation email:', emailResult.error);
    } else {
      console.log('✅ Confirmation email sent successfully!');
    }
  } catch (emailError) {
    console.error('Error processing confirmation email:', emailError);
    // Don't fail the confirmation if email processing fails
  }

  revalidatePath(`/officer/departments/${parsed.data.deptId}`);
  return { ok: true, data: { id: parsed.data.id } };
}
