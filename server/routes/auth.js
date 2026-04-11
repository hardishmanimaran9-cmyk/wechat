// ============================================
// AUTH ROUTES - routes/auth.js
// ============================================
// Routes for signup and login

const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");

// POST /api/auth/signup - Create a new account
router.post("/signup", signup);

// POST /api/auth/login - Log in to existing account
router.post("/login", login);

module.exports = router;
