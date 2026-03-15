// server/index.js — Main Express Server
require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const mongoose = require("mongoose");

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: [process.env.CLIENT_URL || "http://localhost:5173", "https://*.vercel.app"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Database Connection ──────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/barbershop")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",         require("./routes/auth"));
app.use("/api/customers",    require("./routes/customers"));
app.use("/api/bookings",     require("./routes/bookings"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/services",     require("./routes/services"));
app.use("/api/dashboard",    require("./routes/dashboard"));
app.use("/api/reminders",    require("./routes/reminders"));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Barber Shop API running 🚀" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
