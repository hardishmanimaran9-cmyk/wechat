// ============================================
// MAIN SERVER FILE - server.js
// ============================================
// This is the entry point for our backend application.
// It sets up Express, connects to MongoDB, and starts Socket.IO.

// Step 1: Load environment variables from .env file
require("dotenv").config();

// Step 2: Import required packages
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const socketHandler = require("./socket/socketHandler");

// Step 3: Import route files
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const requestRoutes = require("./routes/requests");
const messageRoutes = require("./routes/messages");

// Step 4: Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Step 5: Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Step 6: Middleware
// cors() allows the frontend to make requests to this backend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
// express.json() parses incoming JSON request bodies
app.use(express.json());

// Step 7: API Routes
// All auth routes will be prefixed with /api/auth
app.use("/api/auth", authRoutes);
// All user routes will be prefixed with /api/users
app.use("/api/users", userRoutes);
// All request routes will be prefixed with /api/requests
app.use("/api/requests", requestRoutes);
// All message routes will be prefixed with /api/messages
app.use("/api/messages", messageRoutes);

// Step 8: Basic health check route
app.get("/", (req, res) => {
  res.json({ message: "🚀 Chatwe API is running!" });
});

// Step 9: Initialize Socket.IO handlers
socketHandler(io);

// Step 10: Connect to database and start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log("");
    console.log("============================================");
    console.log(`🚀 Chatwe Server running on port ${PORT}`);
    console.log(`📡 API:    http://localhost:${PORT}`);
    console.log(`🔌 Socket: http://localhost:${PORT}`);
    console.log("============================================");
    console.log("");
  });
});
