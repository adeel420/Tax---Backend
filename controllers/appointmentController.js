const Appointment = require("../models/appointmentModel");
const { sendAppointmentConfirmation, sendAppointmentCancellation } = require("../middleware/appointmentEmail");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Create new appointment
const createAppointment = async (req, res) => {
  try {
    const { name, email, phone, service, date, time, message } = req.body;

    // Check if appointment slot is already taken
    const existingAppointment = await Appointment.findOne({
      date: new Date(date),
      time: time,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked. Please choose another time."
      });
    }

    const appointment = new Appointment({
      name,
      email,
      phone,
      service,
      date: new Date(date),
      time,
      message
    });

    await appointment.save();

    // Send immediate booking confirmation
    const bookingConfirmation = {
      from: process.env.EMAIL_USER,
      to: appointment.email,
      subject: "Appointment Booking Received - Eliaselitaxservices",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Appointment Request Received!</h2>
          <p>Dear ${appointment.name},</p>
          <p>Thank you for booking an appointment. We have received your request:</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <p><strong>Service:</strong> ${appointment.service}</p>
            <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.time}</p>
            <p><strong>Status:</strong> Pending Review</p>
          </div>
          
          <p>Our team will review your request and confirm within 24 hours. You'll receive another email once confirmed.</p>
          
          <p>Contact us: 📞 (555) 123-4567 | 📧 info@eliaselitaxservices.com</p>
          
          <p>Best regards,<br>Eliaselitaxservices Team</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(bookingConfirmation);
    } catch (error) {
      console.error("Error sending booking confirmation:", error);
    }

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully!",
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to book appointment",
      error: error.message
    });
  }
};

// Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1, time: 1 });
    res.status(200).json({
      success: true,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message
    });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Send email notifications
    if (status === 'confirmed') {
      await sendAppointmentConfirmation(appointment);
    } else if (status === 'cancelled') {
      await sendAppointmentCancellation(appointment);
    }

    res.status(200).json({
      success: true,
      message: "Appointment status updated",
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update appointment",
      error: error.message
    });
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  updateAppointmentStatus
};