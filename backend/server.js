
const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', process.env.CLIENT_URL].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', process.env.CLIENT_URL].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

app.use((req, res, next) => {
  req.io = io;
  next();
});

const auth = require('./src/routes/authRoutes');
const pickups = require('./src/routes/pickupRoutes');
const { router: admin, collectorRouter } = require('./src/routes/adminRoutes');
const marketplace = require('./src/routes/marketplaceRoutes');
const rates = require('./src/routes/rateRoutes');
const chat = require('./src/routes/chatRoutes');

app.use('/api/auth', auth);
app.use('/api/pickups', pickups);
app.use('/api/admin', admin);
app.use('/api/collector', collectorRouter);
app.use('/api/marketplace', marketplace);
app.use('/api/rates', rates);
app.use('/api/chat', chat);
app.get('/', (req, res) => {
  res.send('Clean&Green API is running...');
});

// Error Handler Middleware
const errorHandler = require('./src/middleware/errorMiddleware');
app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join a private room for the user
  socket.on('join_user', (userId) => {
      if (!userId) {
          socket.emit('error', { message: 'Invalid user ID' });
          return;
      }
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their private room`);
  });

  // Join a room for a specific pickup tracking
  socket.on('join_pickup', (pickupId) => {
      if (!pickupId) {
          socket.emit('error', { message: 'Invalid pickup ID' });
          return;
      }
      socket.join(`pickup_${pickupId}`);
      console.log(`Socket joined tracking room for pickup: ${pickupId}`);
  });

  socket.on('update_location', (data) => {
      // Data: { pickupId, lat, lng, heading }
      if (!data || !data.pickupId) {
          socket.emit('error', { message: 'Invalid location data' });
          return;
      }
      // Targeted broadcast to the pickup's room
      io.to(`pickup_${data.pickupId}`).emit('location_updated', data);
  });

  socket.on('send_message', async (data) => {
      // Data: { pickupId, senderId, content }
      if (!data || !data.pickupId || !data.senderId || !data.content) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
      }
      const Message = require('./src/models/Message');
      try {
          const message = await Message.create({
              pickup: data.pickupId,
              sender: data.senderId,
              content: data.content.trim()
          });
          
          const populatedMessage = await message.populate('sender', 'name profilePicture');
          
          // Emit to the pickup room
          io.to(`pickup_${data.pickupId}`).emit('receive_message', populatedMessage);
      } catch (err) {
          console.error('Chat Error:', err);
          socket.emit('error', { message: 'Failed to send message' });
      }
  });

  // --- SUPPORT CHAT EVENTS ---
  socket.on('join_support', (data) => {
      // data: { userId, role }
      if (!data || !data.userId) {
          socket.emit('error', { message: 'Invalid support join data' });
          return;
      }
      if (data.role === 'admin') {
          socket.join('support_all'); // Admins listen to all support activity
          console.log(`Admin ${data.userId} joined support_all room`);
      }
      socket.join(`support_${data.userId}`); // Join individual support room
      console.log(`User ${data.userId} joined their support room`);
  });

  socket.on('send_support_message', async (data) => {
      // data: { supportUserId, senderId, content, isAdmin }
      if (!data || !data.supportUserId || !data.senderId || !data.content) {
          socket.emit('error', { message: 'Invalid support message data' });
          return;
      }
      const Message = require('./src/models/Message');
      try {
          const message = await Message.create({
              sender: data.senderId,
              isSupport: true,
              supportUser: data.supportUserId,
              content: data.content.trim()
          });
          
          const populatedMessage = await message.populate('sender', 'name profilePicture role');
          
          // 1. Notify the user seeking support
          io.to(`support_${data.supportUserId}`).emit('receive_support_message', populatedMessage);
          
          // 2. Notify all admins (so they see new messages in their global support view)
          io.to('support_all').emit('receive_support_message', populatedMessage);
          
      } catch (err) {
          console.error('Support Chat Error:', err);
          socket.emit('error', { message: 'Failed to send support message' });
      }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
