const Appointment = require("../models/appointmentModel");
const { sendConfirmationEmail, sendCancellationEmail } = require("../middleware/statusEmailService");
const { sendAdminNotification } = require("../middleware/adminNotificationService");
const { generateSimpleMeetingLink } = require("../services/simpleMeetService");
const { sendMeetingLink } = require("../middleware/meetingEmailService");

// Get available slots for a date
const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.params;
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    let allSlots = [];
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Monday to Friday: 9 AM - 5 PM (last slot 4-5 PM)
      allSlots = [
        "09:00", "10:00", "11:00", "12:00", 
        "13:00", "14:00", "15:00", "16:00"
      ];
    } else if (dayOfWeek === 6) {
      // Saturday: 10 AM - 3 PM (last slot 2-3 PM)
      allSlots = [
        "10:00", "11:00", "12:00", "13:00", "14:00"
      ];
    } else {
      // Sunday: Closed
      allSlots = [];
    }

    const bookedSlots = await Appointment.find({
      date: selectedDate,
      status: { $ne: 'cancelled' }
    }).select('timeSlot');

    const bookedTimes = bookedSlots.map(apt => apt.timeSlot);
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

    res.json({ success: true, availableSlots });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create appointment
const createAppointment = async (req, res) => {
  try {
    const { name, email, phone, service, date, timeSlot, message } = req.body;

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      date: new Date(date),
      timeSlot,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked"
      });
    }

    const appointment = new Appointment({
      name, email, phone, service, date: new Date(date), timeSlot, message
    });

    await appointment.save();

    // Send notification to admin
    try {
      await sendAdminNotification(appointment);
    } catch (emailError) {
      console.error("Admin notification failed:", emailError);
    }

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1, date: 1, timeSlot: 1 });
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id, { status }, { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Handle Google Meet integration and emails based on status
    try {
      if (status === 'confirmed' && !appointment.meetingLink) {
        console.log('Appointment confirmed:', appointment._id);
        appointment.meetingLink = 'Meeting link will be sent separately';
        await appointment.save();
        await sendConfirmationEmail(appointment);
      } else if (status === 'cancelled') {
        await sendCancellationEmail(appointment);
      }
    } catch (error) {
      console.error("Status update error:", error);
    }

    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Send meeting link to user
const sendMeetingLinkToUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { meetingLink } = req.body;

    if (!meetingLink) {
      return res.status(400).json({ success: false, message: "Meeting link is required" });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Update appointment with actual meeting link
    appointment.actualMeetingLink = meetingLink;
    await appointment.save();

    // Send meeting link to user
    await sendMeetingLink(appointment, meetingLink);

    res.json({ success: true, message: "Meeting link sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAvailableSlots,
  createAppointment,
  getAllAppointments,
  updateAppointmentStatus,
  sendMeetingLinkToUser
};