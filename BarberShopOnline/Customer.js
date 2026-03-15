// server/models/Customer.js
const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
  date:    { type: Date, default: Date.now },
  service: { type: String },
  price:   { type: Number },
  barber:  { type: String },
  notes:   { type: String },
}, { _id: false });

const customerSchema = new mongoose.Schema({
  owner:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name:      { type: String, required: true, trim: true },
  phone:     { type: String, required: true },
  email:     { type: String, lowercase: true, trim: true },
  notes:     { type: String },
  visits:    [visitSchema],
  lastVisit: { type: Date },
  totalSpent:{ type: Number, default: 0 },
}, { timestamps: true });

// Auto-update lastVisit and totalSpent
customerSchema.pre("save", function (next) {
  if (this.visits && this.visits.length > 0) {
    const sorted = [...this.visits].sort((a, b) => new Date(b.date) - new Date(a.date));
    this.lastVisit  = sorted[0].date;
    this.totalSpent = this.visits.reduce((sum, v) => sum + (v.price || 0), 0);
  }
  next();
});

module.exports = mongoose.model("Customer", customerSchema);
