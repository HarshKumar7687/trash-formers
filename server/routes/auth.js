const express = require("express");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { registerUser, loginUser, getUserProfile } = require("../controllers/authController");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Logout - simplified version
router.post('/logout', protect, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Get user profile
router.get("/profile", protect, getUserProfile);

module.exports = router;