const cron = require('node-cron');

console.log('Civigo Reminder Scheduler Started');
console.log('Will check for reminders every minute');
console.log('Target endpoint: http://localhost:3001/api/send-reminders');
console.log('Logs will show processing results and any errors');
console.log('─'.repeat(60));

// Run every minute for faster testing and processing
const scheduledTask = cron.schedule('* * * * *', async () => {
  const timestamp = new Date().toISOString();
  console.log(`\n [${timestamp}] Checking for appointment reminders...`);
  
  try {
    const response = await fetch('http://localhost:3001/api/send-reminders');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Reminders processed successfully');
      console.log(`Emails sent: ${result.emailsSent || 0}`);
      console.log(`Notifications logged: ${result.notificationsLogged || 0}`);
      
      if (result.emailsSent > 0) {
        console.log('Reminder emails sent to:');
        result.results?.forEach(r => {
          if (r.success) {
            console.log(`   • ${r.appointment.citizen_name} (${r.appointment.citizen_email})`);
          }
        });
      } else {
        console.log('No appointments need reminders at this time');
      }
    } else {
      console.log('Reminder processing completed with warnings');
      console.log('Response:', result);
    }
    
  } catch (error) {
    console.error('Error running reminders:', error.message);
    console.error('Make sure your Next.js dev server is running on port 3002');
  }
}, {
  scheduled: false // Don't start immediately, we'll start it manually
});

// For immediate testing - run once when the script starts
console.log('\n Running initial test to verify connection...');
(async () => {
  try {
    const response = await fetch('http://localhost:3001/api/send-reminders');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Initial test successful - endpoint is reachable');
    console.log('Test result:', {
      success: result.success,
      emailsSent: result.emailsSent || 0,
      appointmentsProcessed: result.results?.length || 0
    });
    
    // Start the scheduled task after successful test
    console.log('\n Starting scheduled reminder checks...');
    scheduledTask.start();
    
    console.log('\n Press Ctrl+C to stop the scheduler');
    
  } catch (error) {
    console.error(' Initial test failed:', error.message);
    console.error(' Please ensure:');
    console.error('   1. Next.js dev server is running: npm run dev');
    console.error('   2. Server is running on port 3002');
    console.error('   3. /api/send-reminders endpoint is accessible');
    process.exit(1);
  }
})();

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down reminder scheduler...');
  scheduledTask.stop();
  console.log(' Scheduler stopped gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n Received SIGTERM, shutting down...');
  scheduledTask.stop();
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('\n Uncaught Exception:', error.message);
  scheduledTask.stop();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n Unhandled Rejection at:', promise, 'reason:', reason);
  scheduledTask.stop();
  process.exit(1);
});
