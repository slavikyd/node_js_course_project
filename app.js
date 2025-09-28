const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Import config and database connection
const config = require("./config/config");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Serve index.html for root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// In-memory room storage
let inMemoryRooms = [];
let useInMemoryStorage = false;

// --- Room API Endpoints ---
app.post("/api/rooms/create", async (req, res) => {
  try {
    console.log("➡️ Create Room request:", req.body);
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Room name required" });

    // Use in-memory storage
    const newRoom = { 
      name, 
      roomId: uuidv4(),
      createdAt: new Date(),
      _id: uuidv4()
    };
    
    inMemoryRooms.push(newRoom);
    console.log("✅ Room saved:", newRoom);
    res.json(newRoom);
  } catch (err) {
    console.error("❌ Room save error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/rooms", async (req, res) => {
  try {
    console.log("📥 Fetching rooms...");
    const rooms = [...inMemoryRooms].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    console.log(`✅ Found ${rooms.length} rooms`);
    res.json(rooms);
  } catch (err) {
    console.error("❌ Error fetching rooms:", err);
    res.status(500).json({ error: err.message });
  }
});

// Test endpoint to check if API is working
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "API is working!", 
    timestamp: new Date(),
    environment: config.nodeEnv,
    storage: "In-Memory"
  });
});

// Clear rooms endpoint (for testing)
app.delete("/api/rooms/clear", (req, res) => {
  inMemoryRooms = [];
  res.json({ message: "All rooms cleared from memory" });
});

// --- WebRTC Signaling with Socket.io ---
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const roomHosts = {};
const roomUsers = {};

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("join-room", async ({ roomId }) => {
    try {
      console.log(`🎯 User ${socket.id} joining room: ${roomId}`);
      socket.join(roomId);
      
      if (!roomUsers[roomId]) {
        roomUsers[roomId] = [];
      }
      
      roomUsers[roomId].push(socket.id);

      if (!roomHosts[roomId]) {
        roomHosts[roomId] = socket.id;
        socket.emit("role", { role: "host" });
        console.log(`🎥 ${socket.id} is HOST of room ${roomId}`);
      } else {
        socket.emit("role", { role: "viewer" });
        console.log(`👀 ${socket.id} is VIEWER in room ${roomId}`);
        io.to(roomHosts[roomId]).emit("user-joined", { userId: socket.id });
      }

      console.log(`📊 Room ${roomId} now has ${roomUsers[roomId].length} users`);
    } catch (error) {
      console.error("❌ Join room error:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  socket.on("offer", ({ offer, roomId }) => {
    if (roomHosts[roomId] === socket.id) {
      socket.to(roomId).emit("offer", { offer, userId: socket.id });
      console.log(`📤 Host ${socket.id} sent offer to room ${roomId}`);
    }
  });

  socket.on("answer", ({ answer, roomId, toUserId }) => {
    if (toUserId) {
      io.to(toUserId).emit("answer", { answer, userId: socket.id });
      console.log(`📥 Viewer ${socket.id} sent answer to host ${toUserId}`);
    } else {
      const hostId = roomHosts[roomId];
      if (hostId) {
        io.to(hostId).emit("answer", { answer, userId: socket.id });
      }
    }
  });

  socket.on("ice-candidate", ({ candidate, roomId }) => {
    socket.to(roomId).emit("ice-candidate", { candidate, userId: socket.id });
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
    
    for (const roomId in roomUsers) {
      const index = roomUsers[roomId].indexOf(socket.id);
      if (index > -1) {
        roomUsers[roomId].splice(index, 1);
        
        if (roomHosts[roomId] === socket.id) {
          console.log(`🛑 Host left room ${roomId}`);
          if (roomUsers[roomId].length > 0) {
            roomHosts[roomId] = roomUsers[roomId][0];
            io.to(roomHosts[roomId]).emit("role", { role: "host" });
            console.log(`🎥 New host assigned: ${roomHosts[roomId]} for room ${roomId}`);
          } else {
            delete roomHosts[roomId];
            delete roomUsers[roomId];
            console.log(`🗑️ Room ${roomId} cleaned up`);
          }
        }
        
        socket.to(roomId).emit("user-left", { userId: socket.id });
        break;
      }
    }
  });
});

// --- Start Server ---
connectDB().then(() => {
  if (mongoose.connection.readyState !== 1) {
    useInMemoryStorage = true;
    console.log('💾 Using IN-MEMORY storage');
  }
  
  http.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
    console.log(`📱 Open http://localhost:${config.port} in your browser`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`💾 Storage: IN-MEMORY`);
  });
}).catch(err => {
  useInMemoryStorage = true;
  console.log('💾 Using IN-MEMORY storage');
  
  http.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
    console.log(`📱 Open http://localhost:${config.port} in your browser`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log('💾 Storage: IN-MEMORY');
  });
});