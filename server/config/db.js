// ============================================
// DATABASE CONNECTION - config/db.js
// ============================================
// This file connects our app to MongoDB using Mongoose.
// Mongoose is a library that makes it easy to work with MongoDB.

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // mongoose.connect() tries to connect to MongoDB using the URI from .env
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, show the error and stop the server
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error("");
    console.error("👉 Common fixes:");
    console.error("   1. Check your MONGO_URI in the .env file");
    console.error("   2. Make sure your IP is whitelisted in MongoDB Atlas");
    console.error("   3. Check your username and password are correct");
    console.error("   4. See MONGODB_SETUP.md for detailed instructions");
    process.exit(1); // Stop the server if DB connection fails
  }
};

module.exports = connectDB;
