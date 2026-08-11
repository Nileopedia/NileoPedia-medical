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
import medicalTopicsRoutes from '../modules/medical/medical-topics.routes';

export const setupRoutes = (app: ReturnType<typeof Router>, io: Server, authController: any) => {
  // Health check route
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // API documentation endpoint (FR-26)
  app.get('/api/v1', (req, res) => {
    res.status(200).json({
      name: 'NileoPedia API',
      version: '1.0.0',
      endpoints: {
        auth: {
          'POST /api/v1/auth/register': 'Register new user',
          'POST /api/v1/auth/login': 'User login',
          'POST /api/v1/auth/verify': 'Check email verification requirement',
          'POST /api/v1/auth/verify-otp': 'Verify OTP code',
          'POST /api/v1/auth/forgot-password': 'Request password reset',
          'POST /api/v1/auth/reset-password': 'Reset password with token',
          'POST /api/v1/auth/refresh': 'Refresh JWT token',
          'POST /api/v1/auth/logout': 'Logout user',
        },
        questions: {
          'POST /api/v1/questions/ask': 'Submit medical question',
          'GET /api/v1/questions/history': 'Get user query history',
          'GET /api/v1/questions/:id': 'Get specific question',
          'POST /api/v1/questions/:id/save': 'Save response',
          'DELETE /api/v1/questions/:id/save': 'Unsave response',
        },
        validation: {
          'GET /api/v1/validation/pending': 'Get pending reviews (VALIDATOR only)',
          'POST /api/v1/validation/:id/approve': 'Approve AI response',
          'POST /api/v1/validation/:id/reject': 'Reject AI response',
          'GET /api/v1/validation/history': 'Get validation history (VALIDATOR only)',
        },
        admin: {
          'POST /api/v1/admin/ingestion/run': 'Run manual document ingestion',
          'POST /api/v1/admin/ingestion/refresh': 'Run incremental refresh',
          'GET /api/v1/admin/ingestion/status': 'Get ingestion status',
          'GET /api/v1/admin/users': 'List all users',
          'GET /api/v1/admin/analytics': 'Get system analytics',
          'GET /api/v1/admin/retrieval-test?q=...': 'Test retrieval pipeline (embeddings + Pinecone + Groq)',
          'GET /api/v1/admin/performance-test': 'Get AI performance timing metrics',
        },
        users: {
          'POST /api/v1/users/validator': 'Create a new validator (ADMIN only)',
        },
        documents: {
          'POST /api/v1/documents/upload': 'Upload medical document (ADMIN)',
          'GET /api/v1/documents': 'List documents',
          'GET /api/v1/documents/:id': 'Get document details',
          'POST /api/v1/documents/:id/verify': 'Verify document for indexing (ADMIN)',
          'PUT /api/v1/documents/:id': 'Update document metadata',
          'DELETE /api/v1/documents/:id': 'Delete document',
        },
        search: {
          'GET /api/v1/search': 'Global search (q, type, specialty, limit, page)',
          'GET /api/v1/search/documents': 'Search documents',
          'GET /api/v1/search/citations': 'Search citations',
        },
        'medical-topics': {
          'GET /api/v1/medical-topics': 'List medical topics from ingested document metadata',
        },
      },
    });
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
  app.use('/api/v1/medical-topics', medicalTopicsRoutes);
};
