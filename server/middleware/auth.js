// ============================================
// AUTH MIDDLEWARE - middleware/auth.js
// ============================================
// This middleware checks if a user is logged in before
// allowing them to access protected routes.
// It verifies the JWT token sent in the request header.

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // Step 1: Get the token from the request header
    // The token is sent as: "Bearer <token>"
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please log in.",
      });
    }

    // Extract just the token part (remove "Bearer ")
    const token = authHeader.replace("Bearer ", "");

    // Step 2: Verify the token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 3: Find the user in the database using the ID from the token
    const user = await User.findById(decoded.userId).select("-password");
    // .select("-password") means: get all fields EXCEPT password

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Token may be invalid.",
      });
    }

    // Step 4: Attach the user to the request object
    // Now any route using this middleware can access req.user
    req.user = user;

    // Step 5: Continue to the actual route handler
    next();
  } catch (error) {
    // If the token is expired or invalid
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please log in again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during authentication.",
    });
  }
};

module.exports = authMiddleware;
