const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
const db = require("./db");
const userRoutes = require("./routes/UserRoutes");
const contactRoutes = require("./routes/ContactRoutes");
const documentRoutes = require("./routes/DocumentRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const { startReminderService } = require("./services/reminderService");

const passport = require("./middleware/auth");
const cors = require("cors");

// Packages
app.use(cors());
const PORT = process.env.PORT || 8080;
app.use(bodyParser.json());
app.use(passport.initialize());
const authMiddleware = passport.authenticate("local", { session: false });

// Routes
app.use("/user", userRoutes);
app.use("/contact", contactRoutes);
app.use("/document", documentRoutes);
app.use("/newsletter", newsletterRoutes);
app.use("/appointment", appointmentRoutes);


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Listening the port ${PORT}`);
  // Start reminder service
  startReminderService();
});
