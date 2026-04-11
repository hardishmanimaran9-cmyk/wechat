// ============================================
// USER CONTROLLER - controllers/userController.js
// ============================================
// Handles user-related operations:
// - Search users by email
// - Get friends list
// - Get current user's profile

const User = require("../models/User");

// ---- SEARCH USERS ----
// GET /api/users/search?email=something
// Search for users by email (partial match)
const searchUsers = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email to search.",
      });
    }

    // Find users whose email contains the search term
    // $regex allows partial matching, $options: "i" makes it case-insensitive
    // We exclude the current user from results and don't return passwords
    const users = await User.find({
      email: { $regex: email, $options: "i" },
      _id: { $ne: req.user._id }, // $ne = "not equal" - exclude yourself
    }).select("-password"); // Don't send passwords back

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching users.",
    });
  }
};

// ---- GET FRIENDS ----
// GET /api/users/friends
// Get the current user's friends list with their details
const getFriends = async (req, res) => {
  try {
    // Find the current user and "populate" their friends
    // populate() replaces the friend IDs with actual user data
    const user = await User.findById(req.user._id)
      .populate("friends", "-password") // Get friend details, exclude passwords
      .select("friends");

    res.status(200).json({
      success: true,
      friends: user.friends,
    });
  } catch (error) {
    console.error("Get friends error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching friends.",
    });
  }
};

// ---- GET CURRENT USER ----
// GET /api/users/me
// Get the logged-in user's profile
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("friends", "-password")
      .populate("requests.from", "-password");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile.",
    });
  }
};

module.exports = { searchUsers, getFriends, getMe };
