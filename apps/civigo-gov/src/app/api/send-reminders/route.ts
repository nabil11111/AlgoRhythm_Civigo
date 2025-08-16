import { NextRequest, NextResponse } from 'next/server';
import { processAppointmentReminders } from '@/lib/reminders';

// Optional: Add basic authentication for security
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  console.log('🔔 Appointment reminder cron job triggered');
  
  try {
    // Optional: Verify the request is from authorized source
    const authHeader = request.headers.get('authorization');
    const secretFromHeader = authHeader?.replace('Bearer ', '');
    
    // For now, we'll allow unauthenticated requests for testing
    // In production, you should enable this check:
    // if (secretFromHeader !== CRON_SECRET) {
    //   console.log('❌ Unauthorized cron request');
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log('🚀 Starting reminder processing...');
    const startTime = Date.now();
    
    // Process all appointment reminders
    const results = await processAppointmentReminders();
    
    const duration = Date.now() - startTime;
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      results: {
        appointmentsProcessed: results.processed,
        remindersSent: results.successful,
        failures: results.failed,
        errors: results.errors,
      },
      message: `Processed ${results.processed} appointments, sent ${results.successful} reminders`,
    };

    console.log('✅ Reminder cron job completed:', response);
    
    return NextResponse.json(response);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error in reminder cron job:', errorMessage);
    
    const errorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      error: errorMessage,
      message: 'Reminder processing failed',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Also support POST requests for some cron services
  return GET(request);
}
