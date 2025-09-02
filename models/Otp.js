// models/Otp.js
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } } // TTL index at expiresAt
}, {
  timestamps: true
});

// Note: Mongo TTL index will remove this document after expiresAt
module.exports = mongoose.model("Otp", otpSchema);
