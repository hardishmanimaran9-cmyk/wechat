const express = require("express");
const router = express.Router();
const { sendMessage, getMessages, editMessage, deleteMessage } = require("../controllers/messageController");
const authMiddleware = require("../middleware/auth");
const multer = require("multer");

// Configure multer for image uploads (in memory buffer)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// All routes require authentication
// POST /api/messages/send - Send a message (support image upload)
router.post("/send", authMiddleware, upload.single("image"), sendMessage);

// GET /api/messages/:userId - Get chat history with a specific user
router.get("/:userId", authMiddleware, getMessages);

// PUT /api/messages/:messageId - Edit a message
router.put("/:messageId", authMiddleware, editMessage);

// DELETE /api/messages/:messageId - Unsend a message
router.delete("/:messageId", authMiddleware, deleteMessage);

module.exports = router;
