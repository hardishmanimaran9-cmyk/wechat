// ============================================
// MESSAGE CONTROLLER - controllers/messageController.js
// ============================================
// Handles sending and fetching messages between users.

const Message = require("../models/Message");
const User = require("../models/User");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// ---- SEND MESSAGE ----
// POST /api/messages/send
// Send a message to another user (must be friends)
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    // Validate input: Either message or image is required
    if (!receiverId || (!message && !req.file)) {
      return res.status(400).json({
        success: false,
        message: "Receiver and at least a message or image are required.",
      });
    }

    // Check if they are friends
    const sender = await User.findById(senderId);
    if (!sender.friends.includes(receiverId)) {
      return res.status(403).json({
        success: false,
        message: "You can only message your friends. Send a chat request first.",
      });
    }

    let imagePath = null;
    if (req.file) {
      const fileName = `chat-${Date.now()}.webp`;
      const fullPath = path.join(__dirname, "../uploads", fileName);
      
      // Compress image using sharp
      await sharp(req.file.buffer)
        .resize(800, 800, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(fullPath);
        
      imagePath = fileName;
    }

    // Create the message in the database
    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message: message ? message.trim() : "",
      image: imagePath,
      replyTo: req.body.replyTo || null,
    });

    // Populated message for socket emission
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "-password")
      .populate("receiver", "-password")
      .populate({ path: "replyTo", populate: { path: "sender", select: "email" } });

    // Emit to both parties via Socket.IO
    req.io.to(receiverId.toString()).emit("receive_message", populatedMessage);
    req.io.to(senderId.toString()).emit("receive_message", populatedMessage);

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending message.",
    });
  }
};

// ---- GET MESSAGES ----
// GET /api/messages/:userId
// Get all messages between the current user and specified user
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Find all messages between the two users (in both directions)
    // Sort by createdAt so messages appear in order
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .sort({ createdAt: 1 }) // 1 = oldest first (ascending)
      .populate("sender", "-password")
      .populate("receiver", "-password")
      .populate({ path: "replyTo", populate: { path: "sender", select: "email" } });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching messages.",
    });
  }
};

// ---- EDIT MESSAGE ----
// PUT /api/messages/:messageId
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { newMessage } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    message.message = newMessage.trim();
    message.isEdited = true;
    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "-password")
      .populate("receiver", "-password")
      .populate({ path: "replyTo", populate: { path: "sender", select: "email" } });

    // Emit update via socket
    const editData = {
      messageId: message._id,
      newMessage: message.message,
      senderId: message.sender,
      receiverId: message.receiver,
      isEdited: true
    };
    req.io.to(message.receiver.toString()).emit("message_updated", editData);
    req.io.to(message.sender.toString()).emit("message_updated", editData);

    res.status(200).json({ success: true, message: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---- DELETE MESSAGE (UNSEND) ----
// DELETE /api/messages/:messageId
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // If there is an image, delete it from the server
    if (message.image) {
      const filePath = path.join(__dirname, "../uploads", message.image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const { receiver, sender } = message;
    await Message.findByIdAndDelete(messageId);

    // Emit delete via socket
    req.io.to(receiver.toString()).emit("message_deleted", { messageId });
    req.io.to(sender.toString()).emit("message_deleted", { messageId });

    res.status(200).json({ success: true, message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { sendMessage, getMessages, editMessage, deleteMessage };
