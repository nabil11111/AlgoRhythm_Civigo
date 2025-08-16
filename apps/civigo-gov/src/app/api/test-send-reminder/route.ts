import { NextRequest, NextResponse } from 'next/server';
import { sendReminderForAppointment } from '@/lib/reminders';
import { createClient } from '@supabase/supabase-js';

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

export async function POST(request: NextRequest) {
  console.log('🧪 Testing reminder send for specific appointment...');
  
  try {
    const { appointmentId } = await request.json();
    
    if (!appointmentId) {
      return NextResponse.json({
        success: false,
        error: 'appointmentId is required'
      }, { status: 400 });
    }

    // Fetch the appointment details
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_at,
        citizen_id,
        service_id,
        slot_id,
        status,
        profiles:citizen_id!inner(full_name, email),
        services:service_id!inner(
          name,
          departments:department_id!inner(name)
        ),
        service_slots:slot_id(
          branches:branch_id(name)
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (error || !appointment) {
      return NextResponse.json({
        success: false,
        error: 'Appointment not found'
      }, { status: 404 });
    }

    // Convert to the format expected by sendReminderForAppointment
    const appointmentData = {
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
    };

    if (!appointmentData.citizen_email) {
      return NextResponse.json({
        success: false,
        error: 'Citizen has no email address'
      }, { status: 400 });
    }

    console.log('Sending test reminder for appointment:', appointmentId);
    const result = await sendReminderForAppointment(appointmentData);

    const response = {
      success: result.success,
      timestamp: new Date().toISOString(),
      appointmentDetails: {
        id: appointmentData.id,
        citizen_name: appointmentData.citizen_name,
        citizen_email: appointmentData.citizen_email,
        appointment_at: appointmentData.appointment_at,
        service_name: appointmentData.service_name,
        status: appointment.status,
      },
      reminderResult: result,
    };

    console.log('Test reminder result:', response);
    return NextResponse.json(response);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error sending test reminder:', errorMessage);
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
