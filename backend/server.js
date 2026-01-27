
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
    methods: ['GET', 'POST'],
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
const admin = require('./src/routes/adminRoutes');
const marketplace = require('./src/routes/marketplaceRoutes');
const rates = require('./src/routes/rateRoutes');
const chat = require('./src/routes/chatRoutes');

app.use('/api/auth', auth);
app.use('/api/pickups', pickups);
app.use('/api/admin', admin);
app.use('/api/marketplace', marketplace);
app.use('/api/rates', rates);
app.use('/api/chat', chat);
app.get('/', (req, res) => {
  res.send('Kachrawale API is running...');
});

// Error Handler Middleware
const errorHandler = require('./src/middleware/errorMiddleware');
app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join a private room for the user
  socket.on('join_user', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their private room`);
  });

  // Join a room for a specific pickup tracking
  socket.on('join_pickup', (pickupId) => {
      socket.join(`pickup_${pickupId}`);
      console.log(`Socket joined tracking room for pickup: ${pickupId}`);
  });

  socket.on('update_location', (data) => {
      // Data: { pickupId, lat, lng, heading }
      // Targeted broadcast to the pickup's room
      io.to(`pickup_${data.pickupId}`).emit('location_updated', data);
  });

  socket.on('send_message', async (data) => {
      // Data: { pickupId, senderId, content }
      const Message = require('./src/models/Message');
      try {
          const message = await Message.create({
              pickup: data.pickupId,
              sender: data.senderId,
              content: data.content
          });
          
          const populatedMessage = await message.populate('sender', 'name profilePicture');
          
          // Emit to the pickup room
          io.to(`pickup_${data.pickupId}`).emit('receive_message', populatedMessage);
      } catch (err) {
          console.error('Chat Error:', err);
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
