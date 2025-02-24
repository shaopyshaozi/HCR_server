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
app.use(express.urlencoded({ extended: true })); // 解析 URL 编码的数据

const port = 5001;

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Simple Messaging Server is Running");
});

// ✅ 新增: 处理 ESP32 发送的 CMD ID (GET)
app.get("/cmd", (req, res) => {
  const cmdId = req.query.cmd_id; // 读取 URL 参数 ?cmd_id=xxx
  if (cmdId) {
    console.log(`✅ 服务器收到 CMD ID (GET): ${cmdId}`);
    res.send(`服务器成功接收 CMD ID: ${cmdId}`);
  } else {
    console.log("⚠️ 服务器未收到 CMD ID");
    res.status(400).send("缺少 CMD ID");
  }
});

// ✅ 新增: 处理 ESP32 发送的 CMD ID (POST)
app.post("/cmd", (req, res) => {
  const cmdId = req.body.cmd_id; // 读取 POST 数据
  if (cmdId) {
    console.log(`✅ 服务器收到 CMD ID (POST): ${cmdId}`);
    res.send(`服务器成功接收 CMD ID: ${cmdId}`);
  } else {
    console.log("⚠️ 服务器未收到 CMD ID");
    res.status(400).send("缺少 CMD ID");
  }
});

// WebSocket Connection
io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Listen for messages from sender
  socket.on("send_message", (data) => {
    console.log("Received message:", data);

    // If the message is "1", send update_coke to receivers
    if (data === "1") {
      console.log("Sending update_coke to receivers...");
      io.emit("update_coke", { productId: 3, quantity: 1 });  // Assuming Diet Coke has productId 3
    } else {
      // Optional: handle other messages
      console.log("Unhandled message:", data);
    }
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
