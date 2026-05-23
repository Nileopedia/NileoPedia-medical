import { Router } from 'express';
import { Server } from 'socket.io';
import authRoutes from '../modules/auth/routes/auth.routes';

export const setupRoutes = (app: ReturnType<typeof Router>, io: Server) => {
  // Health check route
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/v1/auth', authRoutes);
  // Other modules will be added here
};