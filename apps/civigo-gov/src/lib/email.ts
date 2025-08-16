import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface AppointmentConfirmationEmailData {
  citizenName: string;
  citizenEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceName: string;
  departmentName: string;
  referenceCode: string;
  branchName?: string;
}

interface AppointmentReminderEmailData {
  citizenName: string;
  citizenEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceName: string;
  departmentName: string;
  referenceCode: string;
  branchName?: string;
  hoursUntilAppointment: number;
}

export async function sendAppointmentConfirmationEmail(data: AppointmentConfirmationEmailData) {
  console.log('sendAppointmentConfirmationEmail called with data:', {
    citizenName: data.citizenName,
    citizenEmail: data.citizenEmail,
    serviceName: data.serviceName,
    appointmentDate: data.appointmentDate,
    referenceCode: data.referenceCode
  });
  
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set in environment variables');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }
  
  try {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmed - Civigo</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">✅ Appointment Confirmed</h1>
    <p style="color: #e8eaed; margin: 10px 0 0 0; font-size: 16px;">Your appointment has been officially confirmed</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
    <p style="font-size: 18px; margin-bottom: 20px;">Dear ${data.citizenName},</p>
    
    <p style="font-size: 16px; margin-bottom: 25px;">
      Great news! Your appointment has been <strong>confirmed</strong> by our office. 
      We look forward to serving you on your scheduled date.
    </p>
    
    <div style="background: #f8f9fa; border-left: 4px solid #28a745; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 15px 0; color: #28a745; font-size: 18px;">📅 Appointment Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 140px;">Reference:</td>
          <td style="padding: 8px 0; font-family: monospace; background: #e9ecef; padding: 4px 8px; border-radius: 4px; display: inline-block;">${data.referenceCode}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Service:</td>
          <td style="padding: 8px 0;">${data.serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Department:</td>
          <td style="padding: 8px 0;">${data.departmentName}</td>
        </tr>
        ${data.branchName ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Branch:</td>
          <td style="padding: 8px 0;">${data.branchName}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Date:</td>
          <td style="padding: 8px 0;">${data.appointmentDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Time:</td>
          <td style="padding: 8px 0;">${data.appointmentTime}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; margin: 25px 0; border-radius: 8px;">
      <h4 style="margin: 0 0 10px 0; color: #856404;">📝 Important Reminders</h4>
      <ul style="margin: 0; padding-left: 20px; color: #856404;">
        <li>Please arrive 15 minutes before your scheduled time</li>
        <li>Bring all required documents and your reference number</li>
        <li>Contact us if you need to reschedule or cancel</li>
      </ul>
    </div>
    
    <p style="font-size: 16px; margin-top: 25px;">
      If you have any questions or need to make changes to your appointment, 
      please contact our office with your reference number.
    </p>
    
    <p style="font-size: 16px; margin-top: 25px;">
      Thank you for choosing our services.
    </p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666;">
      <p style="margin: 0; font-size: 14px;">
        <strong>Civigo Government Services</strong><br>
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `
APPOINTMENT CONFIRMED - Civigo

Dear ${data.citizenName},

Great news! Your appointment has been confirmed by our office. We look forward to serving you on your scheduled date.

APPOINTMENT DETAILS:
Reference: ${data.referenceCode}
Service: ${data.serviceName}
Department: ${data.departmentName}
${data.branchName ? `Branch: ${data.branchName}\n` : ''}Date: ${data.appointmentDate}
Time: ${data.appointmentTime}

IMPORTANT REMINDERS:
- Please arrive 15 minutes before your scheduled time
- Bring all required documents and your reference number
- Contact us if you need to reschedule or cancel

If you have any questions or need to make changes to your appointment, please contact our office with your reference number.

Thank you for choosing our services.

---
Civigo Government Services
This is an automated message. Please do not reply to this email.
    `;

    console.log('Attempting to send email via Resend...');
    const result = await resend.emails.send({
      from: 'Civigo <onboarding@resend.dev>',
      to: [data.citizenEmail],
      subject: `✅ Appointment Confirmed - ${data.serviceName} (${data.referenceCode})`,
      html: htmlContent,
      text: textContent,
    });

    console.log('Resend API response:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send appointment confirmation email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendAppointmentReminderEmail(data: AppointmentReminderEmailData) {
  console.log('sendAppointmentReminderEmail called with data:', {
    citizenName: data.citizenName,
    citizenEmail: data.citizenEmail,
    serviceName: data.serviceName,
    appointmentDate: data.appointmentDate,
    referenceCode: data.referenceCode,
    hoursUntilAppointment: data.hoursUntilAppointment
  });
  
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set in environment variables');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }
  
  try {
    const timeFrame = 'tomorrow';
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Reminder - Civigo</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Appointment Reminder</h1>
    <p style="color: #ffe8ec; margin: 10px 0 0 0; font-size: 16px;">Your appointment is ${timeFrame}!</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
    <p style="font-size: 18px; margin-bottom: 20px;">Dear ${data.citizenName},</p>
    
    <p style="font-size: 16px; margin-bottom: 25px;">
      This is a friendly reminder that your appointment is scheduled for <strong>${timeFrame}</strong>. 
      Please make sure you're prepared and arrive on time.
    </p>
    
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; margin: 25px 0; border-radius: 8px;">
      <h3 style="margin: 0 0 15px 0; color: #856404; text-align: center;">📅 Appointment Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 140px;">Reference:</td>
          <td style="padding: 8px 0; font-family: monospace; background: #e9ecef; padding: 4px 8px; border-radius: 4px; display: inline-block;">${data.referenceCode}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Service:</td>
          <td style="padding: 8px 0;">${data.serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Department:</td>
          <td style="padding: 8px 0;">${data.departmentName}</td>
        </tr>
        ${data.branchName ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Branch:</td>
          <td style="padding: 8px 0;">${data.branchName}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Date:</td>
          <td style="padding: 8px 0;">${data.appointmentDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Time:</td>
          <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #f5576c;">${data.appointmentTime}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; margin: 25px 0; border-radius: 8px;">
      <h4 style="margin: 0 0 10px 0; color: #0c5460;">📋 Preparation Checklist</h4>
      <ul style="margin: 0; padding-left: 20px; color: #0c5460;">
        <li><strong>Arrive 15 minutes early</strong> for check-in</li>
        <li><strong>Bring your reference number:</strong> ${data.referenceCode}</li>
        <li><strong>Bring all required documents</strong> mentioned in your confirmation</li>
        <li><strong>Valid ID</strong> (NIC, Passport, or Driver's License)</li>
        <li><strong>Contact us</strong> if you need to reschedule</li>
      </ul>
    </div>
    
    <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; margin: 25px 0; border-radius: 8px; text-align: center;">
      <p style="margin: 0; color: #721c24; font-weight: bold;">
        ⚠️ Need to reschedule or cancel? Contact us as soon as possible.
      </p>
    </div>
    
    <p style="font-size: 16px; margin-top: 25px;">
      We look forward to serving you ${timeFrame}. Thank you for choosing our services.
    </p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666;">
      <p style="margin: 0; font-size: 14px;">
        <strong>Civigo Government Services</strong><br>
        This is an automated reminder. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `
APPOINTMENT REMINDER - Civigo

Dear ${data.citizenName},

This is a friendly reminder that your appointment is scheduled for ${timeFrame}. Please make sure you're prepared and arrive on time.

APPOINTMENT DETAILS:
Reference: ${data.referenceCode}
Service: ${data.serviceName}
Department: ${data.departmentName}
${data.branchName ? `Branch: ${data.branchName}\n` : ''}Date: ${data.appointmentDate}
Time: ${data.appointmentTime}

PREPARATION CHECKLIST:
- Arrive 15 minutes early for check-in
- Bring your reference number: ${data.referenceCode}
- Bring all required documents mentioned in your confirmation
- Valid ID (NIC, Passport, or Driver's License)
- Contact us if you need to reschedule

⚠️ Need to reschedule or cancel? Contact us as soon as possible.

We look forward to serving you ${timeFrame}. Thank you for choosing our services.

---
Civigo Government Services
This is an automated reminder. Please do not reply to this email.
    `;

    console.log('Attempting to send reminder email via Resend...');
    const result = await resend.emails.send({
      from: 'Civigo <onboarding@resend.dev>',
      to: [data.citizenEmail],
      subject: `⏰ Reminder: Appointment ${timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} - ${data.serviceName} (${data.referenceCode})`,
      html: htmlContent,
      text: textContent,
    });

    console.log('Resend API response:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send appointment reminder email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function logNotification(
  userId: string,
  appointmentId: string,
  channel: 'email' | 'sms' | 'inapp',
  type: 'booking_confirmation' | 'reminder' | 'status_update',
  status: 'queued' | 'sent' | 'failed',
  payload?: Record<string, any>
) {
  console.log('logNotification called with:', {
    userId,
    appointmentId,
    channel,
    type,
    status,
    payload
  });
  
  try {
    // Use service role to bypass RLS for notification logging
    const { createClient } = await import('@supabase/supabase-js');
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
    
    console.log('Inserting notification into database...');
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        appointment_id: appointmentId,
        channel,
        type,
        status,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
        payload: payload || null,
      });

    if (error) {
      console.error('Failed to log notification:', error);
      return { success: false, error: error.message };
    }

    console.log('Notification logged successfully');
    return { success: true };
  } catch (error) {
    console.error('Failed to log notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
