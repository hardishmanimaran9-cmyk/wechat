// ============================================
// USER MODEL - models/User.js
// ============================================
// This model defines what a "User" looks like in our database.
// Think of it as a blueprint for user data.

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // User's email address - must be unique (no two users can have the same email)
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true, // Always store email in lowercase
      trim: true, // Remove extra spaces
    },

    // User's password - will be hashed (encrypted) before saving
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    // User's display name
    username: {
      type: String,
      trim: true,
      default: "",
    },

    // User's short biography
    bio: {
      type: String,
      trim: true,
      default: "",
    },



    // List of user IDs that this user is friends with
    // "ref: User" means each ID points to another User document
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Chat requests received by this user
    requests: [
      {
        // Who sent the request
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        // Current status of the request
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
      },
    ],

    // Is the user currently online or offline?
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
  },
  {
    // Automatically add createdAt and updatedAt fields
    timestamps: true,
  }
);

// Create and export the User model
// "User" is the name, userSchema is the blueprint
module.exports = mongoose.model("User", userSchema);
