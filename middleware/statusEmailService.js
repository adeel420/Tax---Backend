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

// Send confirmation email when admin confirms (USER EMAIL ONLY)
const sendConfirmationEmail = async (appointment) => {
  if (!emailCredentialsAvailable) {
    console.log('Email credentials not configured - skipping email');
    return;
  }

  try {
    // Email to user only
    const userMailOptions = {
      from: process.env.USER_USER,
      to: appointment.email,
      subject: "Appointment Confirmed - Eliaselitaxservices",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Appointment Confirmed!</h2>
          <p>Dear ${appointment.name},</p>
          <p>Great news! Your appointment has been confirmed:</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <p><strong>Service:</strong> ${appointment.service}</p>
            <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${formatTimeToAMPM(appointment.timeSlot)}</p>
            <p><strong>Status:</strong> ✅ Confirmed</p>

          </div>
          
          <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3 style="color: #16a34a; margin-top: 0;">📹 Virtual Meeting Instructions</h3>
            <p style="margin: 15px 0;"><strong>How the meeting will work:</strong></p>
            <ul style="margin: 5px 0; padding-left: 20px;">
              <li><strong>10 minutes before your appointment:</strong> Our admin will send you a Google Meet link via email</li>
              <li><strong>At your appointment time:</strong> Click the link to join the meeting</li>
              <li><strong>Backup contact:</strong> ${process.env.ADMIN_USER || 'admin@eliaselitaxservices.com'}</li>
              <li>Please be ready 5 minutes before your scheduled time</li>
            </ul>
            <p style="background: #fef3c7; padding: 10px; border-radius: 4px; margin-top: 10px;"><strong>Note:</strong> You will receive the actual Google Meet link shortly before your appointment via email.</p>
          </div>
          
          <h3>What to prepare:</h3>
          <ul>
            <li><strong>Documents (have digital copies ready):</strong></li>
            <li style="margin-left: 20px;">Valid ID (Driver License/Passport)</li>
            <li style="margin-left: 20px;">Social Security Card</li>
            <li style="margin-left: 20px;">W-2 forms from all employers</li>
            <li style="margin-left: 20px;">Previous year tax return</li>
            <li style="margin-left: 20px;">Any relevant tax documents</li>
            <li><strong>Technology:</strong> Stable internet connection, working camera/microphone</li>
          </ul>
          
          <p>We look forward to seeing you!</p>
          <p>Contact us: 📞 (555) 123-4567 | 📧 info@eliaselitaxservices.com</p>
          
          <p>Best regards,<br>Eliaselitaxservices Team</p>
        </div>
      `,
    };

    await transporter.sendMail(userMailOptions);
    console.log('Confirmation email sent to user');
  } catch (error) {
    console.error('Confirmation email failed:', error);
  }
};

// Send cancellation email when admin cancels (USER EMAIL ONLY)
const sendCancellationEmail = async (appointment) => {
  if (!emailCredentialsAvailable) {
    console.log('Email credentials not configured - skipping email');
    return;
  }

  try {
    // Email to user only
    const userMailOptions = {
      from: process.env.USER_USER,
      to: appointment.email,
      subject: "Appointment Cancelled - Eliaselitaxservices",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">Appointment Cancelled</h2>
          <p>Dear ${appointment.name},</p>
          <p>We regret to inform you that your appointment has been cancelled:</p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p><strong>Service:</strong> ${appointment.service}</p>
            <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${formatTimeToAMPM(appointment.timeSlot)}</p>
            <p><strong>Status:</strong> ❌ Cancelled</p>
          </div>
          
          <p>If you would like to reschedule, please book a new appointment on our website or contact us directly.</p>
          
          <p>We apologize for any inconvenience.</p>
          <p>Contact us: 📞 (555) 123-4567 | 📧 info@eliaselitaxservices.com</p>
          
          <p>Best regards,<br>Eliaselitaxservices Team</p>
        </div>
      `,
    };

    await transporter.sendMail(userMailOptions);
    console.log('Cancellation email sent to user');
  } catch (error) {
    console.error('Cancellation email failed:', error);
  }
};

module.exports = {
  sendConfirmationEmail,
  sendCancellationEmail
};