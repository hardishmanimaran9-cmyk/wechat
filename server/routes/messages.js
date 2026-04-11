// ============================================
// MESSAGE ROUTES - routes/messages.js
// ============================================
// Routes for sending and fetching messages

const express = require("express");
const router = express.Router();
const { sendMessage, getMessages } = require("../controllers/messageController");
const authMiddleware = require("../middleware/auth");

// All routes require authentication
// POST /api/messages/send - Send a message
router.post("/send", authMiddleware, sendMessage);

// GET /api/messages/:userId - Get chat history with a specific user
router.get("/:userId", authMiddleware, getMessages);

module.exports = router;
