const Contact = require("../models/contactModel");
const transporter = require("../middleware/config");
require("dotenv").config();

exports.create = async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;
    const data = new Contact({ name, email, phone, service, message });
    const savedData = await data.save();

    // 2. Send email to admin
    await transporter.sendMail({
      from: `"Website Contact" <${email}>`,
      to: process.env.USER_USER,
      subject: "📩 New Contact Form Submission",
      html: `
  <div style="font-family: Arial, sans-serif; background:#f9f9f9; padding:20px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color:#333; border-bottom:2px solid #4CAF50; padding-bottom:10px;">New Contact Request</h2>
      <p style="font-size:15px; color:#555;">You have received a new contact form submission:</p>
      <table style="width:100%; border-collapse:collapse; margin-top:15px;">
        <tr>
          <td style="padding:8px; font-weight:bold; color:#333;">Name:</td>
          <td style="padding:8px; color:#555;">${name}</td>
        </tr>
        <tr style="background:#f4f4f4;">
          <td style="padding:8px; font-weight:bold; color:#333;">Email:</td>
          <td style="padding:8px; color:#555;">${email}</td>
        </tr>
        <tr>
          <td style="padding:8px; font-weight:bold; color:#333;">Phone:</td>
          <td style="padding:8px; color:#555;">${phone}</td>
        </tr>
        <tr style="background:#f4f4f4;">
          <td style="padding:8px; font-weight:bold; color:#333;">Service:</td>
          <td style="padding:8px; color:#555;">${service}</td>
        </tr>
        <tr>
          <td style="padding:8px; font-weight:bold; color:#333;">Message:</td>
          <td style="padding:8px; color:#555;">${message}</td>
        </tr>
      </table>
      <p style="margin-top:20px; font-size:13px; color:#999;">This is an automated notification from your website contact form.</p>
    </div>
  </div>
  `,
    });

    // 3. Send confirmation email to user
    await transporter.sendMail({
      from: `"Support Team" <${process.env.USER_USER}>`,
      to: email,
      subject: "✅ We received your message",
      html: `
  <div style="font-family: Arial, sans-serif; background:#f9f9f9; padding:20px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color:#4CAF50; border-bottom:2px solid #4CAF50; padding-bottom:10px;">Thank You, ${name}!</h2>
      <p style="font-size:15px; color:#555;">We have received your message. Our team will get back to you soon.</p>
      
      <h3 style="margin-top:20px; color:#333;">Your submitted details:</h3>
      <ul style="line-height:1.6; color:#555;">
        <li><b>Service:</b> ${service}</li>
        <li><b>Message:</b> ${message}</li>
      </ul>

      <p style="margin-top:20px; font-size:15px; color:#555;">If this wasn’t you, please ignore this email.</p>
      <p style="margin-top:30px; font-size:13px; color:#999;">— Support Team</p>
    </div>
  </div>
  `,
    });

    res.status(200).json({
      message: "Contact saved and emails sent successfully",
      data: savedData,
    });
  } catch (err) {
    console.error("Error saving contact or sending emails:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.all = async (req, res) => {
  try {
    const response = await Contact.find();
    res.status(200).json(response);
  } catch (err) {
    console.error("Error saving contact or sending emails:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
