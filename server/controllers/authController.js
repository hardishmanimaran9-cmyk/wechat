// ============================================
// AUTH CONTROLLER - controllers/authController.js
// ============================================
// Handles user signup and login.
// - Signup: creates a new user with a hashed password
// - Login: verifies credentials and returns a JWT token

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ---- SIGNUP ----
// POST /api/auth/signup
// Creates a new user account
const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash the password (encrypt it so it's not stored as plain text)
    // "10" is the salt rounds - how many times the hash is applied
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user in the database
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Generate a JWT token for the new user
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Token is valid for 7 days
    });

    // Send back success response with token
    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        _id: user._id,
        email: user.email,
        friends: user.friends,
        requests: user.requests,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ---- LOGIN ----
// POST /api/auth/login
// Logs in an existing user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare the entered password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Send back success response with token
    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        _id: user._id,
        email: user.email,
        friends: user.friends,
        requests: user.requests,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

module.exports = { signup, login };
