// routes/newsletterRoutes.js
const express = require("express");
const router = express.Router();
const {
  subscribe,
  sendNewsletter,
  getAllSubscribers,
} = require("../controllers/newsletterController");

// Public
router.post("/subscribe", subscribe);

// Admin only (protect with middleware later)
router.post("/send", sendNewsletter);
router.get("/subscribers", getAllSubscribers);

module.exports = router;
