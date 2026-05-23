import { Router } from 'express';
import { Server } from 'socket.io';
import authRoutes from '../modules/auth/routes/auth.routes';

export const setupRoutes = (app: ReturnType<typeof Router>, io: Server, authController: any) => {
  // Health check route
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/v1/auth', authRoutes(authController));
  // Other modules will be added here
};