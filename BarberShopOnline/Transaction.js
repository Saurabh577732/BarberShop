// server/models/Transaction.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  owner:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerName:  { type: String, required: true },
  customerPhone: { type: String },
  serviceName:   { type: String, required: true },
  price:         { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ["cash", "upi", "card", "other"],
    default: "cash",
  },
  barber:        { type: String },
  date:          { type: Date, default: Date.now },
  notes:         { type: String },
  bookingId:     { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
