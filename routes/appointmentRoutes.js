const express = require("express");
const Appointment = require("../models/appointmentModel");
const {
  createAppointment,
  getAllAppointments,
  updateAppointmentStatus
} = require("../controllers/appointmentController");

const router = express.Router();

router.post("/book", createAppointment);
router.get("/all", getAllAppointments);
router.get("/user/:email", async (req, res) => {
  try {
    const appointments = await Appointment.find({ email: req.params.email }).sort({ date: 1 });
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.put("/update/:id", updateAppointmentStatus);

module.exports = router;