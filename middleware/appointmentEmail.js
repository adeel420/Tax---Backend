const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_USER,
    pass: process.env.USER_PASS,
  },
});

const sendAppointmentConfirmation = async (appointment) => {
  const mailOptions = {
    from: process.env.USER_USER,
    to: appointment.email,
    subject: "Appointment Confirmation - Eliaselitaxservices",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; backgroud-color: #87a7ff; padding: 20px; border-radius: 8px;">
        <h2 style="color: #2563eb;">Appointment Confirmed!</h2>
        <p>Dear ${appointment.name},</p>
        <p>Your appointment has been confirmed with the following details:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Service:</strong> ${appointment.service}</p>
          <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${appointment.time}</p>
          <p><strong>Status:</strong> ${appointment.status}</p>
        </div>
        
        <h3>What to bring:</h3>
        <ul>
          <li>Valid ID (Driver's License or Passport)</li>
          <li>Social Security Card</li>
          <li>W-2 forms from all employers</li>
          <li>1099 forms (if applicable)</li>
          <li>Bank statements</li>
          <li>Previous year tax return</li>
          <li>Any other relevant tax documents</li>
        </ul>
        
        <h3>Meeting Options:</h3>
        <p>📍 <strong>In-Person:</strong> 123 Tax Street, Suite 100, City, State 12345</p>
        <p>💻 <strong>Virtual:</strong> Zoom link will be sent 30 minutes before appointment</p>
        <p>📞 <strong>Phone:</strong> (555) 123-4567</p>
        
        <p>If you need to reschedule or cancel, please contact us at least 12 hours in advance.</p>
        
        <p>Best regards,<br>Eliaselitaxservices Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Appointment email sent successfully");
  } catch (error) {
    console.error("Error sending appointment email:", error);
  }
};

const sendAppointmentCancellation = async (appointment) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
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
          <p><strong>Time:</strong> ${appointment.time}</p>
          <p><strong>Status:</strong> Cancelled</p>
        </div>
        
        <p>We apologize for any inconvenience. Please contact us to reschedule:</p>
        <p>📞 <strong>Phone:</strong> (555) 123-4567</p>
        <p>📧 <strong>Email:</strong> info@eliaselitaxservices.com</p>
        
        <p>Best regards,<br>Eliaselitaxservices Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Cancellation email sent successfully");
  } catch (error) {
    console.error("Error sending cancellation email:", error);
  }
};

module.exports = { sendAppointmentConfirmation, sendAppointmentCancellation };