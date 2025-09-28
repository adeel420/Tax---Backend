// controllers/newsletterController.js
const NewsletterSubscriber = require("../models/Newsletter");
const transporter = require("../middleware/config");

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "You are already subscribed!" });
    }

    const newSubscriber = new NewsletterSubscriber({ email });
    await newSubscriber.save();

    // Send welcome email
    await transporter.sendMail({
      from: `"Eliaselitaxservices Newsletter" <${process.env.USER_USER}>`,
      to: email,
      subject: "🎉 Welcome to Eliaselitaxservices Newsletter",
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;background:#f4f6f9;">
          <div style="max-width:600px;margin:auto;background:#fff;border-radius:8px;padding:20px;box-shadow:0 2px 6px rgba(0,0,0,0.1);">
            <h2 style="color:#2563eb;">Welcome to Eliaselitaxservices Newsletter 🎉</h2>
            <p>Thanks for subscribing! 🎊</p>
            <p>You’ll now receive important updates, new features, and announcements directly to your inbox.</p>
            <p style="margin-top:20px;">Best regards,<br/>Eliaselitaxservices Team</p>
          </div>
        </div>
      `,
    });

    res.status(201).json({
      success: true,
      message: "Subscription successful. A welcome email has been sent!",
    });
  } catch (err) {
    console.error("❌ Newsletter subscribe error:", err);
    res.status(500).json({ success: false, message: "Subscription failed" });
  }
};

exports.sendNewsletter = async (req, res) => {
  try {
    const { subject, content } = req.body;

    if (!subject || !content) {
      return res
        .status(400)
        .json({ message: "Subject and content are required" });
    }

    const subscribers = await NewsletterSubscriber.find({}, "email");

    if (subscribers.length === 0) {
      return res.status(400).json({ message: "No subscribers found" });
    }

    const emails = subscribers.map((s) => s.email);

    await transporter.sendMail({
      from: `"Eliaselitaxservices Newsletter" <${process.env.USER_USER}>`,
      to: emails, // can also use BCC for privacy
      subject,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;background:#f4f6f9;">
          <div style="max-width:600px;margin:auto;background:#fff;border-radius:8px;padding:20px;box-shadow:0 2px 6px rgba(0,0,0,0.1);">
            <h2 style="color:#2563eb;">📢 Eliaselitaxservices Update</h2>
            <p>${content}</p>
            <p style="margin-top:20px;">Stay tuned for more updates 🚀</p>
          </div>
        </div>
      `,
    });

    res.json({ success: true, message: "Newsletter sent successfully" });
  } catch (err) {
    console.error("❌ Newsletter send error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to send newsletter" });
  }
};

exports.getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await NewsletterSubscriber.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: subscribers.length,
      subscribers,
    });
  } catch (err) {
    console.error("❌ Get Subscribers error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscribers",
    });
  }
};
