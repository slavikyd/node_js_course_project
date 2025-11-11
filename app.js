require('dotenv').config(); // Load .env variables

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const socketio = require('socket.io');
const authRoutes = require('./app/routes/auth');

const { connectDB, config } = require('./config/db');
const auth = require('./app/middleware/auth');
const roomRoutes = require('./app/routes/routes');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// Serve front-end
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Use Routes
// Protect room-related API endpoints with auth middleware
app.use('/api/auth', authRoutes);

// General API routes under /api
app.use('/api', require('./app/routes/routes'));

// Optional: other public routes without auth can be added here

// WebRTC signaling with Socket.io (kept unchanged)
// roomHosts and roomUsers management as in your original code
const roomHosts = {};
const roomUsers = {};

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('join-room', ({ roomId }) => {
    socket.join(roomId);

    if (!roomUsers[roomId]) {
      roomUsers[roomId] = [];
    }

    roomUsers[roomId].push(socket.id);

    if (!roomHosts[roomId]) {
      roomHosts[roomId] = socket.id;
      socket.emit('role', { role: 'host' });
      console.log(`🎥 ${socket.id} is HOST of room ${roomId}`);
    } else {
      socket.emit('role', { role: 'viewer' });
      io.to(roomHosts[roomId]).emit('user-joined', { userId: socket.id });
      console.log(`👀 ${socket.id} is VIEWER in room ${roomId}`);
    }

    console.log(`📊 Room ${roomId} now has ${roomUsers[roomId].length} users`);
  });

  socket.on('offer', ({ offer, roomId }) => {
    if (roomHosts[roomId] === socket.id) {
      socket.to(roomId).emit('offer', { offer, userId: socket.id });
      console.log(`📤 Host ${socket.id} sent offer to room ${roomId}`);
    }
  });

  socket.on('answer', ({ answer, roomId, toUserId }) => {
    if (toUserId) {
      io.to(toUserId).emit('answer', { answer, userId: socket.id });
      console.log(`📥 Viewer ${socket.id} sent answer to host ${toUserId}`);
    } else {
      const hostId = roomHosts[roomId];
      if (hostId) {
        io.to(hostId).emit('answer', { answer, userId: socket.id });
      }
    }
  });

  socket.on('ice-candidate', ({ candidate, roomId }) => {
    socket.to(roomId).emit('ice-candidate', { candidate, userId: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected:', socket.id);

    for (const roomId in roomUsers) {
      const index = roomUsers[roomId].indexOf(socket.id);
      if (index > -1) {
        roomUsers[roomId].splice(index, 1);

        if (roomHosts[roomId] === socket.id) {
          console.log(`🛑 Host left room ${roomId}`);

          if (roomUsers[roomId].length > 0) {
            roomHosts[roomId] = roomUsers[roomId][0];
            io.to(roomHosts[roomId]).emit('role', { role: 'host' });
            console.log(`🎥 New host assigned: ${roomHosts[roomId]} for room ${roomId}`);
          } else {
            delete roomHosts[roomId];
            delete roomUsers[roomId];
            console.log(`🗑️ Room ${roomId} cleaned up`);
          }
        }

        socket.to(roomId).emit('user-left', { userId: socket.id });
        break;
      }
    }
  });
});

// Connect to MongoDB then start server
connectDB()
  .then(() => {
    server.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📱 Open http://localhost:${config.port} in your browser`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🔐 JWT Secret set: ${!!config.jwtSecret}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server due to DB connection error:', err.message);
    process.exit(1);
  });
