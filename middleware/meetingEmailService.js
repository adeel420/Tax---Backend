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

// Send Google Meet link to user
const sendMeetingLink = async (appointment, meetingLink) => {
  if (!emailCredentialsAvailable) {
    console.log('Email credentials not configured - skipping meeting link email');
    return;
  }

  try {
    const userMailOptions = {
      from: process.env.USER_USER,
      to: appointment.email,
      subject: "Google Meet Link - Your Appointment Today",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Your Meeting Link is Ready!</h2>
          <p>Dear ${appointment.name},</p>
          <p>Your appointment is starting soon. Please use the link below to join:</p>
          
          <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a; text-align: center;">
            <h3 style="color: #16a34a; margin-top: 0;">📹 Join Your Meeting</h3>
            <a href="${meetingLink}" style="display: inline-block; background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 10px 0;">
              Click to Join Google Meet
            </a>
            <p style="margin: 10px 0; color: #16a34a; font-weight: bold;">${meetingLink}</p>
          </div>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Appointment Details:</strong></p>
            <p>📅 <strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
            <p>🕐 <strong>Time:</strong> ${formatTimeToAMPM(appointment.timeSlot)}</p>
            <p>💼 <strong>Service:</strong> ${appointment.service}</p>

          </div>
          
          <p><strong>Please join 5 minutes before your scheduled time.</strong></p>
          <p>If you have any issues joining, please contact us immediately.</p>
          
          <p>Best regards,<br>Eliaselitaxservices Team</p>
        </div>
      `,
    };

    await transporter.sendMail(userMailOptions);
    console.log('Meeting link sent to user:', appointment.email);
  } catch (error) {
    console.error('Meeting link email failed:', error);
  }
};

module.exports = {
  sendMeetingLink
};