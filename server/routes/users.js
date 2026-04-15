// ============================================
// USER ROUTES - routes/users.js
// ============================================
// Routes for searching users, getting friends, and managing profiles.

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { 
  searchUsers, 
  getFriends, 
  getMe, 
  updateProfile, 
  uploadProfilePicture 
} = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

// Configure Multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Save file as user-id-timestamp.extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `profile-${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed!"));
    }
  }
});

// All routes below require authentication

// GET /api/users/search?email=something
router.get("/search", authMiddleware, searchUsers);

// GET /api/users/friends
router.get("/friends", authMiddleware, getFriends);

// GET /api/users/me
router.get("/me", authMiddleware, getMe);

// PUT /api/users/profile
router.put("/profile", authMiddleware, updateProfile);

// POST /api/users/profile-picture
router.post("/profile-picture", authMiddleware, upload.single("image"), uploadProfilePicture);

module.exports = router;
