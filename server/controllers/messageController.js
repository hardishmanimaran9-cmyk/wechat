// ============================================
// MESSAGE CONTROLLER - controllers/messageController.js
// ============================================
// Handles sending and fetching messages between users.

const Message = require("../models/Message");
const User = require("../models/User");

// ---- SEND MESSAGE ----
// POST /api/messages/send
// Send a message to another user (must be friends)
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    // Validate input
    if (!receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: "Receiver and message are required.",
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

    // Create the message in the database
    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message: message.trim(),
    });

    // Populate sender and receiver info for the response
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "-password")
      .populate("receiver", "-password");

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
      .populate("receiver", "-password");

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

module.exports = { sendMessage, getMessages };
