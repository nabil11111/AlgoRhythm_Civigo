import { NextRequest, NextResponse } from 'next/server';
import { findAppointmentsNeedingReminders } from '@/lib/reminders';

export async function GET(request: NextRequest) {
  console.log('🔍 Testing reminder detection logic...');
  
  try {
    // Test the core reminder detection logic
    const appointments = await findAppointmentsNeedingReminders();
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      debug: {
        timeWindowStart: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
        timeWindowEnd: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        currentTime: new Date().toISOString(),
      },
      results: {
        appointmentsFound: appointments.length,
        appointments: appointments.map(apt => ({
          id: apt.id,
          citizen_name: apt.citizen_name,
          citizen_email: apt.citizen_email,
          appointment_at: apt.appointment_at,
          service_name: apt.service_name,
          department_name: apt.department_name,
          branch_name: apt.branch_name,
        }))
      }
    };

    console.log('Test detection results:', response);
    return NextResponse.json(response);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error testing reminder detection:', errorMessage);
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
