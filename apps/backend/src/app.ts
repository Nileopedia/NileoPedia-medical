import express, { Express } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { CONFIG } from './config/env';
import prisma from './config/prisma';
import { setupMiddleware } from './shared/middleware';
import { setupRoutes } from './routes';

// Initialize Express app
const app: Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CONFIG.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// Make io accessible to other modules
declare global {
  // eslint-disable-next-line no-var
  var io: Server;
}
global.io = io;

// Connect to database and then setup everything
prisma.$connect()
  .then(() => {
    console.log('Database connected successfully');
    
    // Setup middleware (cors, helmet, body parser, etc.)
    setupMiddleware(app);

    // Import and setup routes with controller instances
    const { default: authRoutes } = require('./modules/auth/routes/auth.routes');
    const { AuthController } = require('./modules/auth/controllers/auth.controller');
    const authController = new AuthController();
    
    setupRoutes(app, io, authController);

    // Socket.IO connection handling
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Join room for specific user to receive personalized notifications
      socket.on('join-user', (userId: string) => {
        socket.join(`user-${userId}`);
      });

      // Listen for question streaming
      socket.on('stream-question', (questionId: string) => {
        socket.join(`question-${questionId}`);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    // Start server
    const PORT = CONFIG.PORT || 3001;
    httpServer.listen(PORT, () => {
      console.log(`Server running in ${CONFIG.NODE_ENV} mode on port ${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });

export { app, io };