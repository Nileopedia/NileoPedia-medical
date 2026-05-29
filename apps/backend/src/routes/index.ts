import { Router } from 'express';
import { Server } from 'socket.io';
import authRoutes from '../modules/auth/routes/auth.routes';
import questionsRoutes from '../modules/questions/questions.routes';
import validationRoutes from '../modules/validation/validation.routes';
import adminRoutes from '../modules/admin/admin.routes';
import analyticsRoutes from '../modules/analytics/analytics.routes';
import userRoutes from '../modules/users/user.routes';
import notificationRoutes from '../modules/notifications/notification.routes';
import auditRoutes from '../modules/audit/audit.routes';
import citationRoutes from '../modules/citations/citation.routes';
import documentRoutes from '../modules/documents/document.routes';
import searchRoutes from '../modules/search/search.routes';

export const setupRoutes = (app: ReturnType<typeof Router>, io: Server, authController: any) => {
  // Health check route
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/v1/auth', authRoutes(authController));
  app.use('/api/v1/questions', questionsRoutes);
  app.use('/api/v1/validation', validationRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/analytics', analyticsRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/audit-logs', auditRoutes);
  app.use('/api/v1/citations', citationRoutes);
  app.use('/api/v1/documents', documentRoutes);
  app.use('/api/v1/search', searchRoutes);
};