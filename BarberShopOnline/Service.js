// server/models/Service.js
const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name:        { type: String, required: true, trim: true },
  price:       { type: Number, required: true },
  duration:    { type: Number, default: 30 },   // minutes
  description: { type: String },
  isActive:    { type: Boolean, default: true },
  category: {
    type: String,
    enum: ["haircut", "beard", "grooming", "combo", "other"],
    default: "haircut",
  },
}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);
