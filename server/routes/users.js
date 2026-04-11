// ============================================
// USER ROUTES - routes/users.js
// ============================================
// Routes for searching users and getting friends

const express = require("express");
const router = express.Router();
const { searchUsers, getFriends, getMe, updateProfilePicture } = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

// All routes below require authentication
// GET /api/users/search?email=something
router.get("/search", authMiddleware, searchUsers);

// GET /api/users/friends
router.get("/friends", authMiddleware, getFriends);

// GET /api/users/me
router.get("/me", authMiddleware, getMe);

// PUT /api/users/profile-picture
router.put("/profile-picture", authMiddleware, updateProfilePicture);

module.exports = router;
