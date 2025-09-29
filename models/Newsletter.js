const mongoose = require("mongoose");

const newsletterSubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["Active", "Unsubscribed"],
    default: "Active", // ✅ default when someone subscribes
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "NewsletterSubscriber",
  newsletterSubscriberSchema
);
