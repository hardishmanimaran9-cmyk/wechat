// ============================================
// REQUEST ROUTES - routes/requests.js
// ============================================
// Routes for chat request system

const express = require("express");
const router = express.Router();
const {
  sendRequest,
  respondToRequest,
  getPendingRequests,
} = require("../controllers/requestController");
const authMiddleware = require("../middleware/auth");

// All routes require authentication
// POST /api/requests/send - Send a chat request
router.post("/send", authMiddleware, sendRequest);

// POST /api/requests/respond - Accept or reject a request
router.post("/respond", authMiddleware, respondToRequest);

// GET /api/requests/pending - Get pending requests
router.get("/pending", authMiddleware, getPendingRequests);

module.exports = router;
