const express = require("express");
const router = express.Router();
const { sendMessage, getMessages, editMessage, deleteMessage } = require("../controllers/messageController");
const authMiddleware = require("../middleware/auth");

// All routes require authentication
// POST /api/messages/send - Send a text message
router.post("/send", authMiddleware, sendMessage);

// GET /api/messages/:userId - Get chat history with a specific user
router.get("/:userId", authMiddleware, getMessages);

// PUT /api/messages/:messageId - Edit a message
router.put("/:messageId", authMiddleware, editMessage);

// DELETE /api/messages/:messageId - Unsend a message
router.delete("/:messageId", authMiddleware, deleteMessage);

module.exports = router;
