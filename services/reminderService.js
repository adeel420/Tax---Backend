const cron = require('node-cron');
const Appointment = require('../models/appointmentModel');
const nodemailer = require("nodemailer");

// Helper function to format time to AM/PM
const formatTimeToAMPM = (timeSlot) => {
  const [hour, minute] = timeSlot.split(':');
  const date = new Date();
  date.setHours(parseInt(hour), parseInt(minute));
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Check if email credentials are available
const emailCredentialsAvailable = process.env.USER_USER && process.env.USER_PASS;

const transporter = emailCredentialsAvailable ? nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_USER,
    pass: process.env.USER_PASS,
  },
}) : null;

// Send reminder to admin
const sendAdminReminder = async (appointment) => {
  if (!emailCredentialsAvailable) {
    console.log('Email credentials not configured - skipping admin reminder');
    return;
  }

  try {
    const mailOptions = {
      from: process.env.USER_USER,
      to: process.env.ADMIN_USER || process.env.USER_USER,
      subject: "⏰ Urgent: Meeting in 30 Minutes - Send Google Meet Link",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">⏰ Urgent Reminder</h2>
          <p>You have an appointment starting in 30 minutes that needs a Google Meet link:</p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p><strong>Client:</strong> ${appointment.name}</p>
            <p><strong>Email:</strong> ${appointment.email}</p>
            <p><strong>Phone:</strong> ${appointment.phone}</p>
            <p><strong>Service:</strong> ${appointment.service}</p>
            <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${formatTimeToAMPM(appointment.timeSlot)}</p>
            ${appointment.message ? `<p><strong>Message:</strong> ${appointment.message}</p>` : ''}
          </div>
          
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #16a34a; margin-top: 0;">📋 Action Required:</h3>
            <p>1. Create a Google Meet link at meet.google.com</p>
            <p>2. Send the meeting link to the client via admin dashboard</p>
            <p>3. Send the link NOW - meeting starts in 30 minutes!</p>
          </div>
          
          <p><strong>Don't forget to send the Google Meet link!</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Admin reminder sent for appointment: ${appointment._id}`);
  } catch (error) {
    console.error('Admin reminder email failed:', error);
  }
};

// Check for appointments that need reminders (30 minutes before)
const checkForReminders = async () => {
  try {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + (30 * 60 * 1000)); // 30 minutes from now
    
    // Find confirmed appointments happening in ~30 minutes that haven't been reminded
    const appointments = await Appointment.find({
      status: 'confirmed',
      date: {
        $gte: new Date(reminderTime.getTime() - (5 * 60 * 1000)), // 25 minutes from now
        $lte: new Date(reminderTime.getTime() + (5 * 60 * 1000))  // 35 minutes from now
      },
      reminderSent: { $ne: true }
    });
    
    // Also check if appointment time matches (date + timeSlot)
    const validAppointments = [];
    for (const appointment of appointments) {
      const [hour, minute] = appointment.timeSlot.split(':');
      const appointmentDateTime = new Date(appointment.date);
      appointmentDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
      
      const timeDiff = appointmentDateTime.getTime() - now.getTime();
      const minutesDiff = timeDiff / (1000 * 60);
      
      // Check if appointment is 25-35 minutes away
      if (minutesDiff >= 25 && minutesDiff <= 35) {
        validAppointments.push(appointment);
      }
    }

    for (const appointment of validAppointments) {
      await sendAdminReminder(appointment);
      
      // Mark reminder as sent
      appointment.reminderSent = true;
      await appointment.save();
    }

    if (validAppointments.length > 0) {
      console.log(`Sent ${validAppointments.length} admin reminders`);
    }
  } catch (error) {
    console.error('Error checking for reminders:', error);
  }
};

// Schedule reminder check every 5 minutes
const startReminderService = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    console.log('Checking for appointment reminders...');
    checkForReminders();
  });
  
  console.log('Reminder service started - checking every 5 minutes');
};

module.exports = {
  startReminderService,
  checkForReminders
};