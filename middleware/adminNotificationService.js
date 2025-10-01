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

// Send notification to admin when user books appointment
const sendAdminNotification = async (appointment) => {
  if (!emailCredentialsAvailable) {
    console.log('Email credentials not configured - skipping admin notification');
    return;
  }

  try {
    const mailOptions = {
      from: process.env.USER_USER,
      to: process.env.ADMIN_USER || process.env.USER_USER,
      subject: "New Appointment Request - Admin Action Required",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">New Appointment Request</h2>
          <p>A new appointment has been requested and requires your review:</p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p><strong>Client:</strong> ${appointment.name}</p>
            <p><strong>Email:</strong> ${appointment.email}</p>
            <p><strong>Phone:</strong> ${appointment.phone}</p>
            <p><strong>Service:</strong> ${appointment.service}</p>
            <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${formatTimeToAMPM(appointment.timeSlot)}</p>
            ${appointment.message ? `<p><strong>Message:</strong> ${appointment.message}</p>` : ''}
            </div>
            
            <p><strong>Action Required:</strong> Please log in to the admin dashboard to confirm or manage this appointment.</p>
            <a href="http://localhost:3000/admin-dashoard">Login Here</a>
          
          <p>The client will receive a confirmation email only after you approve the appointment.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Admin notification sent successfully');
  } catch (error) {
    console.error('Admin notification failed:', error);
  }
};

module.exports = {
  sendAdminNotification
};