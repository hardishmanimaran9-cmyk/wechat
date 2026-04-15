// ============================================
// MESSAGE CONTROLLER - controllers/messageController.js
// ============================================
// Handles sending and fetching messages between users.

const Message = require("../models/Message");
const User = require("../models/User");
const path = require("path");
const fs = require("fs");

// ---- SEND MESSAGE ----
// POST /api/messages/send
// Send a message to another user (must be friends)
    // Create the message in the database
    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message: message.trim(),
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
    const { before } = req.query; // Timestamp for pagination
    const currentUserId = req.user._id;
    const limit = 30; // Fetch 30 messages at a time

    // Build query
    const query = {
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    };

    // If 'before' is provided, only fetch messages older than that
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Find messages, sort by newest first for slicing, then we'll reverse in frontend
    const messages = await Message.find(query)
      .sort({ createdAt: -1 }) 
      .limit(limit)
      .populate("sender", "-password")
      .populate("receiver", "-password")
      .populate({ path: "replyTo", populate: { path: "sender", select: "email" } });

    // Reverse to return in chronological order
    messages.reverse();

    res.status(200).json({
      success: true,
      messages,
      hasMore: messages.length === limit,
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
