const express = require("express");
const {
  getAvailableSlots,
  createAppointment,
  getAllAppointments,
  updateAppointmentStatus,
  sendMeetingLinkToUser
} = require("../controllers/appointmentController");

const router = express.Router();

router.get("/slots/:date", getAvailableSlots);
router.post("/book", createAppointment);
router.get("/all", getAllAppointments);
router.put("/update/:id", updateAppointmentStatus);
router.post("/send-meeting-link/:id", sendMeetingLinkToUser);

module.exports = router;