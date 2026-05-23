import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { CONFIG } from './config/env';
import { connectDB } from './infrastructure/database';
import { setupMiddleware } from './shared/middleware';
import { setupRoutes } from './routes';

// Initialize Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CONFIG.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// Connect to database
connectDB()
  .then(() => {
    console.log('Database connected successfully');
    
    // Setup middleware (cors, helmet, body parser, etc.)
    setupMiddleware(app);

    // Setup routes
    setupRoutes(app, io);

    // Socket.IO connection handling
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    // Start server
    const PORT = CONFIG.PORT;
    httpServer.listen(PORT, () => {
      console.log(`Server running in ${CONFIG.NODE_ENV} mode on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });

export { app, io };