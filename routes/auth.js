// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../models/User.js";
import Otp from "../models/Otp.js";
import TokenBlacklist from "../models/TokenBlacklist.js";
import { sendMail } from "../utils/mail.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const genOtpCode = () => {
  // 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ✅ Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    if (!name || !email || !username || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });
    if (existing)
      return res
        .status(400)
        .json({ message: "Email or username already registered" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email: email.toLowerCase(),
      username,
      password: hashed,
      role: "admin",
    });

    await user.save();
    res.status(201).json({
      message: "User registered",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Login (email or username)
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password)
      return res
        .status(400)
        .json({ message: "Identifier and password required" });

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
    });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Forgot password - send OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res
        .status(200)
        .json({ message: "If this email is registered, you will receive an OTP" });

    const code = genOtpCode();
    const minutes = Number(process.env.OTP_EXPIRES_MINUTES || 10);
    const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email: email.toLowerCase() },
      { email: email.toLowerCase(), code, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    try {
      await sendMail({
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is ${code}. It expires in ${minutes} minute(s).`,
        html: `<p>Your OTP is <strong>${code}</strong>. It expires in ${minutes} minute(s).</p>`,
      });
    } catch (mailErr) {
      console.error("Mail error:", mailErr);
    }

    res
      .status(200)
      .json({ message: "If this email is registered, you will receive an OTP" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Validate OTP
router.post("/validate-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });

    const record = await Otp.findOne({ email: email.toLowerCase() });
    if (!record) return res.status(400).json({ message: "Invalid or expired OTP" });

    if (record.code !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    res.json({ message: "OTP valid" });
  } catch (err) {
    console.error("Validate OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res
        .status(400)
        .json({ message: "Email, OTP and new password required" });

    const record = await Otp.findOne({ email: email.toLowerCase() });
    if (!record) return res.status(400).json({ message: "Invalid or expired OTP" });
    if (record.code !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    user.password = hashed;
    await user.save();

    await Otp.deleteOne({ email: email.toLowerCase() });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Logout
router.post("/logout", authMiddleware, async (req, res) => {
  try {
    const token = req.token;
    const decoded = jwt.decode(token);
    let exp =
      decoded && decoded.exp
        ? new Date(decoded.exp * 1000)
        : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const black = new TokenBlacklist({ token, expiresAt: exp });
    await black.save();
    res.json({ message: "Logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
