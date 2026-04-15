// ============================================
// SOCKET HANDLER - socket/socketHandler.js
// ============================================
// Handles real-time communication using Socket.IO.
// This manages:
// - Who is online
// - Real-time message delivery
// - Chat request notifications

const Message = require("../models/Message");
const User = require("../models/User");

// Map to track online users: { userId: socketId }
const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 New socket connection: ${socket.id}`);

    // ---- USER CONNECTED ----
    // When a user logs in, they emit this event with their userId
    socket.on("user_connected", async (userId) => {
      // Store the mapping: userId -> socketId
      onlineUsers.set(userId, socket.id);
      
      // Join a private room for this user
      // This allows sending messages to this user by userId instead of socketId
      socket.join(userId);

      // Update user status in database
      try {
        await User.findByIdAndUpdate(userId, { status: "online" });
      } catch (err) {
        console.error("Error updating user status:", err);
      }

      console.log(`✅ User ${userId} is online and joined room. Total online: ${onlineUsers.size}`);

      // Tell ALL connected clients who is online
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });

    // ---- SEND MESSAGE ----
    // When a user sends a message
    socket.on("send_message", async (data) => {
      const { senderId, receiverId, message, replyTo } = data;

      try {
        // Save the message to the database
        const newMessage = await Message.create({
          sender: senderId,
          receiver: receiverId,
          message: message,
          replyTo: replyTo || null,
        });

        // Get the full message with sender/receiver details
        const populatedMessage = await Message.findById(newMessage._id)
          .populate("sender", "-password")
          .populate("receiver", "-password")
          .populate({ path: "replyTo", populate: { path: "sender", select: "email" } });

        // Send the message to the receiver if they're online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", populatedMessage);
        }

        // Also send it back to the sender (so they see it in their chat)
        socket.emit("receive_message", populatedMessage);
      } catch (err) {
        console.error("Error sending message via socket:", err);
        socket.emit("message_error", { error: "Failed to send message" });
      }
    });

    // ---- EDIT MESSAGE ----
    socket.on("edit_message", (data) => {
      const { receiverId, messageId, newMessage, isEdited } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message_updated", data);
      }
    });

    // ---- DELETE MESSAGE ----
    socket.on("delete_message", (data) => {
      const { receiverId, messageId } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message_deleted", { messageId });
      }
    });

    // ---- NEW REQUEST NOTIFICATION ----
    // Notify a user when they receive a chat request
    socket.on("new_request", (data) => {
      const { receiverId } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("request_received", data);
      }
    });

    // ---- REQUEST RESPONSE NOTIFICATION ----
    // Notify the sender when their request is accepted/rejected
    socket.on("request_response", (data) => {
      const { senderId } = data;
      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("request_updated", data);
      }
    });

    // ---- TYPING STATUS ----
    socket.on("typing", (data) => {
      const { receiverId } = data;
      // Emit 'user_typing' to the receiver's private room
      io.to(receiverId).emit("user_typing", { userId: data.senderId });
    });

    socket.on("stop_typing", (data) => {
      const { receiverId } = data;
      // Emit 'user_stop_typing' to the receiver's private room
      io.to(receiverId).emit("user_stop_typing", { userId: data.senderId });
    });

    // ---- USER DISCONNECTED ----
    // When a user closes the browser or logs out
    socket.on("disconnect", async () => {
      // Find which userId this socket belongs to
      let disconnectedUserId = null;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }

      if (disconnectedUserId) {
        // Remove from online map
        onlineUsers.delete(disconnectedUserId);

        // Update status in database
        try {
          await User.findByIdAndUpdate(disconnectedUserId, {
            status: "offline",
          });
        } catch (err) {
          console.error("Error updating user status:", err);
        }

        console.log(`❌ User ${disconnectedUserId} went offline. Total online: ${onlineUsers.size}`);

        // Tell everyone about the updated online list
        io.emit("online_users", Array.from(onlineUsers.keys()));
      }
    });
  });
};

module.exports = socketHandler;
