"use server";

import { revalidatePath } from "next/cache";
import { getProfile, getServerClient, getServiceRoleClient } from "@/utils/supabase/server";
import { z } from "zod";
import { mapPostgresError } from "@/lib/db/errors";
import { sendAppointmentConfirmationEmail, sendAppointmentChangeRequestEmail, sendAppointmentCancellationEmail, logNotification } from "@/lib/email";
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
  reason: string;
}): Promise<ActionResult<{ id: string }>> {
  const parsed = z.object({
    id: z.string().uuid(),
    deptId: z.string().uuid(),
    reason: z.string().min(1, "Cancellation reason is required").max(500, "Reason too long"),
  }).safeParse(input);
  
  if (!parsed.success) {
    return { ok: false, error: "invalid", message: parsed.error.issues[0]?.message };
  }
  
  const guard = await ensureOfficerDept(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };
  
  const supabase = await getServerClient();

  // Get appointment with citizen and service details before cancelling
  const { data: appt } = await supabase
    .from("appointments")
    .select(`
      id, appointment_at, citizen_id,
      service:services(id, name, department_id, departments:department_id(name)),
      slot:service_slots(branches:branch_id(name))
    `)
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (!appt || (appt.service as unknown as { department_id: string } | null)?.department_id !== parsed.data.deptId) {
    return { ok: false, error: "forbidden" };
  }

  // Get citizen details
  const { data: citizen } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", appt.citizen_id)
    .single();

  // Update appointment status
  const { error } = await supabase
    .from("appointments")
    .update({ cancelled_at: new Date().toISOString(), status: "cancelled" })
    .eq("id", parsed.data.id)
    .limit(1);
    
  if (error) {
    const fe = mapPostgresError(error);
    return { ok: false, error: fe.code, message: fe.message };
  }

  // Send cancellation email if citizen has email
  if (citizen?.email && citizen?.full_name) {
    try {
      const appointmentDate = new Date(appt.appointment_at);
      const service = appt.service as unknown as { name: string; departments: { name: string } } | null;
      const slot = appt.slot as unknown as { branches: { name: string } } | null;
      
      const emailData = {
        citizenName: citizen.full_name,
        citizenEmail: citizen.email,
        appointmentDate: format(appointmentDate, 'EEEE, MMMM d, yyyy'),
        appointmentTime: format(appointmentDate, 'h:mm a'),
        serviceName: service?.name || 'Government Service',
        departmentName: service?.departments?.name || 'Government Department',
        referenceCode: parsed.data.id.substring(0, 10).toUpperCase(),
        branchName: slot?.branches?.name,
        cancellationReason: parsed.data.reason,
        officerName: guard.profile.full_name || 'Government Officer',
      };

      console.log('Sending cancellation email to:', citizen.email);
      const emailResult = await sendAppointmentCancellationEmail(emailData);
      
      console.log('Email result:', emailResult.success ? 'SUCCESS' : 'FAILED', emailResult.error || '');
      
      // Log notification attempt
      const logResult = await logNotification(
        appt.citizen_id,
        parsed.data.id,
        'email',
        'status_update',
        emailResult.success ? 'sent' : 'failed',
        {
          subject: 'Appointment Cancelled',
          to: citizen.email,
          reason: parsed.data.reason,
          officer: guard.profile.full_name,
          error: emailResult.success ? null : emailResult.error,
        }
      );

      console.log('Notification log result:', logResult.success ? 'SUCCESS' : 'FAILED', logResult.error || '');
      
      if (!emailResult.success) {
        console.error('Failed to send cancellation email:', emailResult.error);
      } else {
        console.log('✅ Cancellation email sent successfully!');
      }
    } catch (emailError) {
      console.error('Error processing cancellation email:', emailError);
      // Don't fail the cancellation if email processing fails
    }
  } else {
    console.log('Citizen has no email or name, skipping email notification');
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
    let branch: { name: string } | null = null;
    if (appointment.slot_id) {
      const { data: slot } = await supabase
        .from("service_slots")
        .select("branches:branch_id(name)")
        .eq("id", appointment.slot_id)
        .single();
      branch = slot?.branches as unknown as { name: string } | null;
    }

    console.log('Preparing email data...');
    const appointmentDate = new Date(appointment.appointment_at);
    const emailData = {
      citizenName: citizen.full_name,
      citizenEmail: citizen.email,
      appointmentDate: format(appointmentDate, 'EEEE, MMMM d, yyyy'),
      appointmentTime: format(appointmentDate, 'h:mm a'),
      serviceName: service?.name || 'Government Service',
      departmentName: (service?.departments as unknown as { name: string } | null)?.name || 'Government Department',
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

export async function getAppointmentDocumentUrls(input: {
  appointmentId: string;
  deptId: string;
}): Promise<ActionResult<{ documentPreviews: Array<{ documentId: string; title: string; images: string[] }> }>> {
  const parsed = z.object({
    appointmentId: z.string().uuid(),
    deptId: z.string().uuid(),
  }).safeParse(input);
  
  if (!parsed.success) return { ok: false, error: "invalid" };
  
  const guard = await ensureOfficerDept(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };

  const supabase = await getServerClient();
  const serviceSupabase = getServiceRoleClient();

  if (!serviceSupabase) {
    return { ok: false, error: "server_misconfigured" };
  }

  // Verify appointment belongs to the department
  const { data: appt } = await supabase
    .from("appointments")
    .select("service:services(department_id)")
    .eq("id", parsed.data.appointmentId)
    .maybeSingle();

  if (!appt || (appt.service as unknown as { department_id: string } | null)?.department_id !== parsed.data.deptId) {
    return { ok: false, error: "forbidden" };
  }

  // Get appointment documents
  const { data: docLinks } = await supabase
    .from("appointment_documents")
    .select("documents:document_id(id, title, storage_path)")
    .eq("appointment_id", parsed.data.appointmentId);

  if (!docLinks || docLinks.length === 0) {
    return { ok: true, data: { documentPreviews: [] } };
  }

  const documentPreviews: Array<{ documentId: string; title: string; images: string[] }> = [];

  for (const docLink of docLinks) {
    const doc = docLink.documents as unknown as { id: string; title: string; storage_path: string } | null;
    if (!doc) continue;

    // Handle comma-separated storage paths for multi-image documents
    const imagePaths = doc.storage_path
      .split(",")
      .map((path: string) => path.trim())
      .filter(Boolean);

    const signedUrls: string[] = [];

    for (const path of imagePaths) {
      try {
        const { data: signed, error } = await serviceSupabase.storage
          .from("nic-media")
          .createSignedUrl(path, 3600); // 1 hour expiry

        if (!error && signed?.signedUrl) {
          signedUrls.push(signed.signedUrl);
        } else {
          console.error(`Failed to create signed URL for ${path}:`, error);
        }
      } catch (error) {
        console.error(`Error creating signed URL for ${path}:`, error);
      }
    }

    if (signedUrls.length > 0) {
      documentPreviews.push({
        documentId: doc.id,
        title: doc.title,
        images: signedUrls,
      });
    }
  }

  return { ok: true, data: { documentPreviews } };
}

export async function sendChangeRequest(input: {
  appointmentId: string;
  deptId: string;
  message: string;
}): Promise<ActionResult<{ sent: boolean }>> {
  const parsed = z.object({
    appointmentId: z.string().uuid(),
    deptId: z.string().uuid(),
    message: z.string().min(1, "Message is required").max(500, "Message too long"),
  }).safeParse(input);
  
  if (!parsed.success) {
    return { ok: false, error: "invalid", message: parsed.error.issues[0]?.message };
  }
  
  const guard = await ensureOfficerDept(parsed.data.deptId);
  if (!guard.ok) return { ok: false, error: "forbidden" };

  const supabase = await getServerClient();

  // Get appointment with citizen and service details
  const { data: appt } = await supabase
    .from("appointments")
    .select(`
      id, appointment_at, citizen_id,
      service:services(id, name, department_id, departments:department_id(name)),
      slot:service_slots(branches:branch_id(name))
    `)
    .eq("id", parsed.data.appointmentId)
    .maybeSingle();

  if (!appt || (appt.service as unknown as { department_id: string } | null)?.department_id !== parsed.data.deptId) {
    return { ok: false, error: "forbidden" };
  }

  // Get citizen details
  const { data: citizen } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", appt.citizen_id)
    .single();

  if (!citizen?.email || !citizen?.full_name) {
    return { ok: false, error: "citizen_no_email", message: "Citizen has no email address" };
  }

  try {
    const appointmentDate = new Date(appt.appointment_at);
    const service = appt.service as unknown as { name: string; departments: { name: string } } | null;
    const slot = appt.slot as unknown as { branches: { name: string } } | null;
    
    const emailData = {
      citizenName: citizen.full_name,
      citizenEmail: citizen.email,
      appointmentDate: format(appointmentDate, 'EEEE, MMMM d, yyyy'),
      appointmentTime: format(appointmentDate, 'h:mm a'),
      serviceName: service?.name || 'Government Service',
      departmentName: service?.departments?.name || 'Government Department',
      referenceCode: parsed.data.appointmentId.substring(0, 10).toUpperCase(),
      branchName: slot?.branches?.name,
      changeMessage: parsed.data.message,
      officerName: guard.profile.full_name || 'Government Officer',
    };

    console.log('Sending change request email to:', citizen.email);
    const emailResult = await sendAppointmentChangeRequestEmail(emailData);
    
    console.log('Email result:', emailResult.success ? 'SUCCESS' : 'FAILED', emailResult.error || '');
    
    // Log notification attempt
    const logResult = await logNotification(
      appt.citizen_id,
      parsed.data.appointmentId,
      'email',
      'status_update',
      emailResult.success ? 'sent' : 'failed',
      {
        subject: 'Change Request',
        to: citizen.email,
        message: parsed.data.message,
        officer: guard.profile.full_name,
        error: emailResult.success ? null : emailResult.error,
      }
    );

    console.log('Notification log result:', logResult.success ? 'SUCCESS' : 'FAILED', logResult.error || '');
    
    if (!emailResult.success) {
      console.error('Failed to send change request email:', emailResult.error);
      return { ok: false, error: "email_failed", message: emailResult.error };
    } else {
      console.log('✅ Change request email sent successfully!');
    }
  } catch (emailError) {
    console.error('Error processing change request email:', emailError);
    return { ok: false, error: "email_error", message: "Failed to send email" };
  }

  return { ok: true, data: { sent: true } };
}
