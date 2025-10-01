const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_USER,
    pass: process.env.USER_PASS,
  },
});

// Send confirmation email to user
const sendUserConfirmation = async (appointment) => {
  try {
    const mailOptions = {
      from: process.env.USER_USER,
      to: appointment.email,
      subject: "Appointment Request Received - Eliaselitaxservices",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Appointment Request Received!</h2>
          <p>Dear ${appointment.name},</p>
          <p>Thank you for booking an appointment with us. We have received your request:</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <p><strong>Service:</strong> ${appointment.service}</p>
            <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.timeSlot}</p>
            <p><strong>Status:</strong> Pending Review</p>
          </div>
          
          <p>Our team will review your request and confirm within 24 hours.</p>
          
          <p>Contact us: 📞 (555) 123-4567 | 📧 info@eliaselitaxservices.com</p>
          
          <p>Best regards,<br>Eliaselitaxservices Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('User confirmation email sent successfully');
  } catch (error) {
    console.error('User email failed:', error);
    throw error;
  }
};

// Send notification email to admin
const sendAdminNotification = async (appointment) => {
  try {
    const mailOptions = {
      from: process.env.USER_USER,
      to: process.env.ADMIN_EMAIL || process.env.USER_USER,
      subject: "New Appointment Request - Admin Notification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">New Appointment Request</h2>
          <p>A new appointment has been requested:</p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p><strong>Client:</strong> ${appointment.name}</p>
            <p><strong>Email:</strong> ${appointment.email}</p>
            <p><strong>Phone:</strong> ${appointment.phone}</p>
            <p><strong>Service:</strong> ${appointment.service}</p>
            <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.timeSlot}</p>
            ${appointment.message ? `<p><strong>Message:</strong> ${appointment.message}</p>` : ''}
          </div>
          
          <p>Please log in to the admin dashboard to manage this appointment.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully');
  } catch (error) {
    console.error('Admin email failed:', error);
    throw error;
  }
};

module.exports = {
  sendUserConfirmation,
  sendAdminNotification
};