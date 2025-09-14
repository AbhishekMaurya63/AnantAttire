// models/Analytics.js
const mongoose = require("mongoose");

const AnalyticsSchema = new mongoose.Schema({
  // Identification
  visitorId: { type: String, required: true },
  sessionId: { type: String, required: true },
  isNewVisitor: { type: Boolean, default: false },
  type: { type: String, enum: ["pageview", "session_end", "engagement"], required: true },

  // Timestamps
  timestamp: { type: Date, required: true },
  sessionStart: { type: Date },
  localTime: { type: String },

  // Navigation
  url: String,
  path: String,
  query: String,
  hash: String,
  referrer: String,

  // Device info
  userAgent: String,
  language: String,
  languages: String,
  screenResolution: String,
  viewport: String,
  colorDepth: Number,
  timezone: String,
  deviceMemory: Number,
  hardwareConcurrency: Number,

  // Classification
  deviceType: String,
  browser: String,
  browserVersion: String,
  os: String,

  // Connection
  connection: {
    effectiveType: String,
    downlink: Number,
    rtt: Number,
    saveData: Boolean,
  },

  // Privacy
  cookiesEnabled: Boolean,
  doNotTrack: String,

  // Performance
  performance: {
    loadTime: Number,
    domReady: Number,
    redirectCount: Number,
  },

  // Geolocation (flexible for device/ip-based)
  geolocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    method: String,
    timestamp: Date,
  },
});

module.exports = mongoose.model("Analytics", AnalyticsSchema);
