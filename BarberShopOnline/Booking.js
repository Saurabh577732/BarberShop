// server/models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  owner:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerName:  { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String },
  service:       { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  serviceName:   { type: String, required: true },
  servicePrice:  { type: Number, default: 0 },
  barber:        { type: String, default: "Any Available" },
  date:          { type: Date, required: true },
  timeSlot:      { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending",
  },
  notes:         { type: String },
  reminderSent:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
