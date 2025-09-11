// routes/users.js
import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import auth from "../middleware/auth.js";


const router = express.Router();

// GET /api/users - get all users (admin only)
router.get("/", auth, async (req, res) => {
  try {
    // all users are admin role as per your requirement; still check role
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/:id", auth, async (req, res) => {
  try {
    const admin = req.user;
    const { id } = req.params;

    if (admin.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    // if (String(admin._id) === id) return res.status(400).json({ message: "Admin cannot modify his own data via this endpoint" });

    const { name, email, username, password, role } = req.body;
    const update = {};
    if (name) update.name = name;
    if (email) update.email = email.toLowerCase();
    if (username) update.username = username;
    if (role) update.role = role;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    }

    const updated = await User.findByIdAndUpdate(id, update, { new: true }).select("-password");
    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated", user: updated });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/users/profile - get current user profile
router.get("/profile", auth, async (req, res) => {
  try {
    res.json(req.user); // req.user already has fields without password
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/users/profile - update own profile
router.put("/profile", auth, async (req, res) => {
  try {
    console.log(req.user,req.body)
    const user = req.user;
    const { name, email, username, password } = req.body;
    if (email && email.toLowerCase() !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(400).json({ message: "Email already in use" });
    }
    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) return res.status(400).json({ message: "Username already in use" });
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (username) user.username = username;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    const ret = user.toObject();
    delete ret.password;
    res.json({ message: "Profile updated", user: ret });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
