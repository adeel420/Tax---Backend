const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER_USER,
    pass: process.env.USER_PASS,
  },
  debug: true,
});

module.exports = transporter;
