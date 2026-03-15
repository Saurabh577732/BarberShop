// server/routes/auth.js
const router = require("express").Router();
const jwt    = require("jsonwebtoken");
const User   = require("../models/User");
const { protect } = require("../middleware/auth");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { shopName, ownerName, email, password, phone } = req.body;
    if (!shopName || !ownerName || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }
    const user = await User.create({ shopName, ownerName, email, password, phone });
    const token = signToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, shopName: user.shopName, ownerName: user.ownerName, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const token = signToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, shopName: user.shopName, ownerName: user.ownerName, email: user.email, phone: user.phone },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/auth/profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { shopName, ownerName, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { shopName, ownerName, phone, address },
      { new: true, select: "-password" }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
