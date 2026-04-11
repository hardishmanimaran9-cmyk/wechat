// ============================================
// REQUEST CONTROLLER - controllers/requestController.js
// ============================================
// Handles the chat request system:
// - Send a chat request to another user
// - Accept or reject a chat request
// - Get all pending requests

const User = require("../models/User");

// ---- SEND REQUEST ----
// POST /api/requests/send
// Send a chat request to another user
const sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    // Can't send request to yourself
    if (senderId.toString() === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a request to yourself.",
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check if they're already friends
    const sender = await User.findById(senderId);
    if (sender.friends.includes(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "You are already friends with this user.",
      });
    }

    // Check if a request already exists (in either direction)
    const existingRequest = receiver.requests.find(
      (r) => r.from.toString() === senderId.toString() && r.status === "pending"
    );
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Request already sent. Waiting for response.",
      });
    }

    // Check if the OTHER person already sent us a request
    const reverseRequest = sender.requests.find(
      (r) =>
        r.from.toString() === receiverId.toString() && r.status === "pending"
    );
    if (reverseRequest) {
      return res.status(400).json({
        success: false,
        message: "This user has already sent you a request. Check your pending requests!",
      });
    }

    // Add the request to the receiver's requests array
    receiver.requests.push({
      from: senderId,
      status: "pending",
    });
    await receiver.save();

    res.status(200).json({
      success: true,
      message: "Chat request sent successfully!",
    });
  } catch (error) {
    console.error("Send request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending request.",
    });
  }
};

// ---- RESPOND TO REQUEST ----
// POST /api/requests/respond
// Accept or reject a chat request
const respondToRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body; // action = "accepted" or "rejected"
    const userId = req.user._id;

    // Validate action
    if (!["accepted", "rejected"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be "accepted" or "rejected".',
      });
    }

    // Find the current user
    const user = await User.findById(userId);

    // Find the specific request
    const request = user.requests.id(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request has already been responded to.",
      });
    }

    // Update the request status
    request.status = action;

    // If accepted, add each other as friends
    if (action === "accepted") {
      const senderId = request.from;

      // Add each other to friends lists (if not already there)
      if (!user.friends.includes(senderId)) {
        user.friends.push(senderId);
      }

      const sender = await User.findById(senderId);
      if (sender && !sender.friends.includes(userId)) {
        sender.friends.push(userId);
        await sender.save();
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Request ${action} successfully!`,
    });
  } catch (error) {
    console.error("Respond to request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while responding to request.",
    });
  }
};

// ---- GET PENDING REQUESTS ----
// GET /api/requests/pending
// Get all pending requests for the current user
const getPendingRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "requests.from",
      "-password"
    );

    // Filter only pending requests
    const pendingRequests = user.requests.filter(
      (r) => r.status === "pending"
    );

    res.status(200).json({
      success: true,
      requests: pendingRequests,
    });
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching requests.",
    });
  }
};

module.exports = { sendRequest, respondToRequest, getPendingRequests };
