const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",  // Allow all origins
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const port = 5001;

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Simple Messaging Server is Running");
});

// WebSocket Connection
io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Listen for messages
  socket.on("send_message", (data) => {
    console.log("Received message:", data);
    // Broadcast message to other clients
    socket.broadcast.emit("receive_message", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
