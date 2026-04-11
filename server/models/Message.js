// ============================================
// MESSAGE MODEL - models/Message.js
// ============================================
// This model defines what a "Message" looks like in our database.
// Each message has a sender, receiver, and the message text.

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // Who sent the message (references a User document)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Who receives the message (references a User document)
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The actual message text
    message: {
      type: String,
      required: [true, "Message cannot be empty"],
      trim: true,
    },
  },
  {
    // Automatically add createdAt and updatedAt fields
    // createdAt = when the message was sent
    timestamps: true,
  }
);

// Create and export the Message model
module.exports = mongoose.model("Message", messageSchema);
