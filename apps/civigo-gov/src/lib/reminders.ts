import { createClient } from '@supabase/supabase-js';
import { sendAppointmentReminderEmail, logNotification } from './email';
import { format, differenceInHours } from 'date-fns';

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

interface AppointmentReminderData {
  id: string;
  appointment_at: string;
  citizen_id: string;
  service_id: string;
  slot_id: string | null;
  citizen_name: string;
  citizen_email: string;
  service_name: string;
  department_name: string;
  branch_name: string | null;
}

export async function findAppointmentsNeedingReminders(): Promise<AppointmentReminderData[]> {
  console.log('Finding appointments needing 24-hour reminders...');
  
  try {
    // Query for confirmed appointments that are 23-25 hours away
    // and don't already have a reminder notification sent
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_at,
        citizen_id,
        service_id,
        slot_id,
        profiles:citizen_id!inner(full_name, email),
        services:service_id!inner(
          name,
          departments:department_id!inner(name)
        ),
        service_slots:slot_id(
          branches:branch_id(name)
        )
      `)
      .eq('status', 'confirmed')
      .gte('appointment_at', new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString()) // At least 23 hours from now
      .lte('appointment_at', new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString()) // At most 25 hours from now
      .not('profiles.email', 'is', null)
      .not('profiles.full_name', 'is', null);

    if (error) {
      console.error('Error fetching appointments for reminders:', error);
      return [];
    }

    if (!appointments || appointments.length === 0) {
      console.log('No appointments found needing reminders');
      return [];
    }

    console.log(`Found ${appointments.length} potential appointments for reminders`);

    // Filter out appointments that already have reminder notifications
    const appointmentsWithoutReminders: AppointmentReminderData[] = [];

    for (const appointment of appointments) {
      // Check if a reminder notification already exists
      const { data: existingReminder } = await supabase
        .from('notifications')
        .select('id')
        .eq('appointment_id', appointment.id)
        .eq('type', 'reminder')
        .eq('status', 'sent')
        .limit(1);

      if (!existingReminder || existingReminder.length === 0) {
        // No reminder sent yet, add to list
        appointmentsWithoutReminders.push({
          id: appointment.id,
          appointment_at: appointment.appointment_at,
          citizen_id: appointment.citizen_id,
          service_id: appointment.service_id,
          slot_id: appointment.slot_id,
          citizen_name: (appointment.profiles as any)?.full_name || 'Valued Citizen',
          citizen_email: (appointment.profiles as any)?.email,
          service_name: (appointment.services as any)?.name || 'Government Service',
          department_name: (appointment.services as any)?.departments?.name || 'Government Department',
          branch_name: (appointment.service_slots as any)?.branches?.name || null,
        });
      } else {
        console.log(`Skipping appointment ${appointment.id} - reminder already sent`);
      }
    }

    console.log(`${appointmentsWithoutReminders.length} appointments need reminders`);
    return appointmentsWithoutReminders;

  } catch (error) {
    console.error('Error in findAppointmentsNeedingReminders:', error);
    return [];
  }
}

export async function sendReminderForAppointment(appointment: AppointmentReminderData): Promise<{ success: boolean; error?: string }> {
  console.log(`Sending reminder for appointment ${appointment.id} to ${appointment.citizen_email}`);
  
  try {
    const appointmentDate = new Date(appointment.appointment_at);
    const hoursUntilAppointment = differenceInHours(appointmentDate, new Date());
    
    const reminderData = {
      citizenName: appointment.citizen_name,
      citizenEmail: appointment.citizen_email,
      appointmentDate: format(appointmentDate, 'EEEE, MMMM d, yyyy'),
      appointmentTime: format(appointmentDate, 'h:mm a'),
      serviceName: appointment.service_name,
      departmentName: appointment.department_name,
      referenceCode: appointment.id.substring(0, 10).toUpperCase(),
      branchName: appointment.branch_name,
      hoursUntilAppointment,
    };

    // Send the reminder email
    const emailResult = await sendAppointmentReminderEmail(reminderData);
    
    // Log the notification attempt
    const logResult = await logNotification(
      appointment.citizen_id,
      appointment.id,
      'email',
      'reminder',
      emailResult.success ? 'sent' : 'failed',
      {
        subject: 'Appointment Reminder',
        to: appointment.citizen_email,
        hoursUntilAppointment,
        error: emailResult.success ? null : emailResult.error,
      }
    );

    if (!logResult.success) {
      console.error(`Failed to log reminder notification for appointment ${appointment.id}:`, logResult.error);
    }

    if (emailResult.success) {
      console.log(`✅ Reminder sent successfully for appointment ${appointment.id}`);
      return { success: true };
    } else {
      console.error(`❌ Failed to send reminder for appointment ${appointment.id}:`, emailResult.error);
      return { success: false, error: emailResult.error };
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error sending reminder for appointment ${appointment.id}:`, errorMessage);
    
    // Log the failed attempt
    try {
      await logNotification(
        appointment.citizen_id,
        appointment.id,
        'email',
        'reminder',
        'failed',
        {
          subject: 'Appointment Reminder',
          to: appointment.citizen_email,
          error: errorMessage,
        }
      );
    } catch (logError) {
      console.error('Failed to log failed reminder:', logError);
    }

    return { success: false, error: errorMessage };
  }
}

export async function processAppointmentReminders(): Promise<{
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
}> {
  console.log('🔄 Starting appointment reminder processing...');
  
  const startTime = Date.now();
  const results = {
    processed: 0,
    successful: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    // Find all appointments needing reminders
    const appointments = await findAppointmentsNeedingReminders();
    results.processed = appointments.length;

    if (appointments.length === 0) {
      console.log('✅ No reminders to send at this time');
      return results;
    }

    console.log(`📧 Processing ${appointments.length} reminder emails...`);

    // Send reminders for each appointment
    for (const appointment of appointments) {
      const result = await sendReminderForAppointment(appointment);
      
      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
        if (result.error) {
          results.errors.push(`${appointment.id}: ${result.error}`);
        }
      }

      // Small delay to avoid overwhelming email service
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Reminder processing completed in ${duration}ms`);
    console.log(`📊 Results: ${results.successful} successful, ${results.failed} failed`);

    return results;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error in processAppointmentReminders:', errorMessage);
    results.errors.push(errorMessage);
    return results;
  }
}
