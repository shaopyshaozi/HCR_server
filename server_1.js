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

/// ✅ New Route to Handle GET Requests from ESP32
app.get("/send_cmd", (req, res) => {
    const cmdID = req.query.cmd_id;
  
    if (cmdID) {
      console.log(`✅ Received CMD ID from ESP32: ${cmdID}`);
  
      switch (cmdID) {
        case "5":
          console.log("Sending update_chips to WebSocket clients...");
          io.emit("cart_update", { productId: 1, quantity: 1 });
          break;
  
        case "6":
          console.log("Sending update_coke to WebSocket clients...");
          io.emit("cart_update", { productId: 2, quantity: 1 });
          break;
  
        case "22":
          console.log("✅ CMD ID 7 received. Sending response 0 to ESP32...");
          res.status(200).send("2");  // Send back "0" immediately
          return;  // Ensure no further processing happens after sending response
  
        default:
          console.log("⚠️ Unrecognized CMD ID.");
          res.status(400).send("Invalid CMD ID.");
          return;
      }
  
      res.status(200).send(`CMD ID ${cmdID} received and processed.`);
    } else {
      console.log("⚠️ No cmd_id received in query.");
      res.status(400).send("No cmd_id provided.");
    }
  });
  

// ✅ New Route to Handle GET Requests from ESP32
app.get("/send_payment", (req, res) => {
  console.log("Received a request from payment");

  //console.log(req)

  const success = req.query.success;

  if (success) {
    console.log(`✅ Received Payment Success`);
   
    console.log("Sending success to WebSocket clients...");
    io.emit("payment", { success:1 });
  

    res.status(200).send(`Payment received and processed.`);
  } else {
    console.log("⚠️ No cmd_id received in query.");
    res.status(400).send("No cmd_id provided.");
  }
});


// WebSocket Connection
io.on("connection", (socket) => {
  console.log(`New WebSocket client connected: ${socket.id}`);

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`WebSocket client disconnected: ${socket.id}`);
  });
});

// Start server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
