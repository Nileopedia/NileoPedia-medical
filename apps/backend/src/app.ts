import express, { Express } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { EmailService } from './modules/email/email.service';
import './jobs/worker';
import { redis } from './lib/redis';
import { CONFIG } from './config/env';
import prisma from './config/prisma';
import { setupMiddleware } from './shared/middleware';
import { setupRoutes } from './routes';

const app: Express = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CONFIG.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
  },
});

declare global {
  // eslint-disable-next-line no-var
  var io: Server;
}
global.io = io;

// Initialize default admin account
async function initializeAdmin(): Promise<void> {
  const adminEmail = 'admin@nileopedia.com';
  const adminPassword = 'Admin123456!';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('Admin account already exists');
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        fullName: 'Administrator',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isEmailVerified: true,
        accountStatus: 'ACTIVE',
      },
    });
    console.log('Admin account created');
  }
}

// Seed demo knowledge base on startup (FR-20)
async function seedKnowledgeBase(): Promise<void> {
  const { refreshKnowledgeBase } = require('./jobs/processors/document.processor');

  const demoCount = await prisma.medicalDocument.count();
  if (demoCount === 0) {
    console.log('Seeding demo knowledge base...');
    await refreshKnowledgeBase(false);
    console.log('Demo knowledge base seeded');
  }
}

// Warm up AI services on startup (FR-38)
async function warmupAiServices(): Promise<void> {
  console.log('\n========== AI SERVICES WARMUP ==========');

  // Warmup EmbeddingService with preloaded model
  try {
    const { EmbeddingService, preloadEmbeddingModel } = require('./modules/rag/services/embedding.service');
    const embeddingService = new EmbeddingService();
    console.log('[WARMUP] Initializing EmbeddingService...');

    const warmupStart = Date.now();
    try {
      // Preload the model before first use
      await preloadEmbeddingModel();
      await embeddingService.generateEmbedding('medical test query');
      console.log(`[STARTUP] Embedding model loaded in ${Date.now() - warmupStart}ms`);
    } catch (e) {
      console.log('[WARMUP] EmbeddingService using mock mode (warmup fallback):', e);
    }
  } catch (e) {
    console.error('[WARMUP] Failed to initialize EmbeddingService:', e);
  }

  // Warmup Pinecone
  try {
    const { RetrievalService } = require('./modules/retrieval/retrieval.service');
    const retrievalService = new RetrievalService();
    console.log('[WARMUP] Initializing RetrievalService...');

    const warmupStart = Date.now();
    try {
      await retrievalService.hybridSearch('diabetes');
      console.log(`[STARTUP] Pinecone ready in ${Date.now() - warmupStart}ms`);
    } catch (e) {
      console.log('[WARMUP] Pinecone using mock mode (warmup fallback):', e);
    }
  } catch (e) {
    console.error('[WARMUP] Failed to initialize RetrievalService:', e);
  }

  console.log('[STARTUP] Warmup complete\n');
}

// Verify Pinecone index on startup
async function verifyPineconeIndex(): Promise<void> {
  const { RetrievalService } = require('./modules/retrieval/retrieval.service');
  const retrievalService = new RetrievalService();

  console.log('\n========== PINECONE INDEX VERIFICATION ==========');

  if (!retrievalService.pineconeClient || !retrievalService.index) {
    console.warn('[WARN] Pinecone not configured - mock mode active');
    console.log('=================================================\n');
    return;
  }

  try {
    const { index } = retrievalService;
    const stats = await index.describeIndexStats();
    console.log('[PINECONE] Total vectors:', (stats as any).totalRecordCount ?? 'unknown');
    console.log('[PINECONE] Index dimension:', (stats as any).dimension ?? 'unknown');

    const vectorCount = (stats as any).totalRecordCount || 0;
    if (vectorCount === 0) {
      console.warn('[WARN] No vectors indexed - knowledge base is empty');
      console.warn('[WARN] Run ingestion to populate the knowledge base');
    } else {
      console.log(`[PINECONE] Index healthy with ${vectorCount} vectors`);
    }
  } catch (e: any) {
    console.error('[ERROR] Failed to verify Pinecone index:', e?.message || e);
  }
  console.log('===================================================\n');
}

// Verify embedding service on startup
async function verifyEmbeddings(): Promise<void> {
  const { EmbeddingService } = require('./modules/rag/services/embedding.service');
  const embeddingService = new EmbeddingService();

  console.log('\n========== EMBEDDING SERVICE VERIFICATION ==========');
  console.log('HF_API_KEY configured:', !!CONFIG.HF_API_KEY);
  console.log('USE_MOCK_EMBEDDINGS:', CONFIG.USE_MOCK_EMBEDDINGS);
  console.log('isRealEmbeddings:', embeddingService.isRealEmbeddings);

  if (!embeddingService.isRealEmbeddings) {
    console.warn('\n[INFO] Using mock embeddings - no embedding service available');
    console.warn('[INFO] Install @xenova/transformers for local embeddings\n');
  } else {
    console.log('\n[INFO] Real embeddings active:', embeddingService.embeddingSource);
    try {
      const testEmbedding = await embeddingService.generateEmbedding('startup test');
      console.log('[INFO] Test embedding generated:', testEmbedding.length, 'dimensions');
    } catch (e: any) {
      console.error('[ERROR] Failed to generate test embedding:', e?.message || e);
    }
  }
  console.log('===================================================\n');
}

// Connect to database and then setup everything
prisma.$connect()
  .then(async () => {
    console.log('Database connected successfully');

    // Initialize admin account
    await initializeAdmin();

    // Verify email service on startup
    const emailStatus = await EmailService.checkConnection();
    console.log('===================================================');
    console.log(`[INFO] Email Provider: ${emailStatus.provider}`);
    console.log(`[INFO] Email Service Configured: ${emailStatus.configured}`);
    console.log(`[INFO] Email Service Status: ${emailStatus.status}`);
    console.log('===================================================\n');

    const warmupPromise = warmupAiServices();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Warmup timeout after 20000ms')), 20000);
    });

    try {
      await Promise.race([warmupPromise, timeoutPromise]);
    } catch (e: any) {
      console.warn(`[STARTUP] Warmup timeout or error (continuing startup): ${e.message}`);
    }

    // Verify embedding service at startup (non-blocking)
    setImmediate(() => verifyEmbeddings());
    setImmediate(() => verifyPineconeIndex());

    // Seed knowledge base if empty
    await seedKnowledgeBase();

    // Setup middleware (cors, helmet, body parser, etc.)
    setupMiddleware(app);

    // Import and setup routes with controller instances
    const { default: authRoutes } = require('./modules/auth/routes/auth.routes');
    const { AuthController } = require('./modules/auth/controllers/auth.controller');
    const authController = new AuthController();

    setupRoutes(app, io, authController);

    // Mock AI service endpoint (only when explicitly enabled)
    if (CONFIG.USE_MOCK_AI) {
      app.post('/api/v1/mock-ai/generate', (req, res) => {
        const { query, specialty } = req.body;

        // Specialty-specific mock content
        const specialtyContent: Record<string, { keywords: string[], keyFindings: string[] }> = {
          cardiology: {
            keywords: ['heart', 'cardiac', 'cardiovascular'],
            keyFindings: [
              'Cardiology finding 1: ACE inhibitors improve cardiac function',
              'Cardiology finding 2: Beta-blockers reduce mortality post-MI',
              'Cardiology finding 3: Statins provide cardiovascular protection',
            ],
          },
          endocrinology: {
            keywords: ['diabetes', 'hormone', 'endocrine'],
            keyFindings: [
              'Endocrinology finding 1: Metformin is first-line for T2DM',
              'Endocrinology finding 2: GLP-1 agonists provide cardiovascular benefit',
              'Endocrinology finding 3: HbA1c target <7% for most patients',
            ],
          },
          oncology: {
            keywords: ['cancer', 'tumor', 'malignant'],
            keyFindings: [
              'Oncology finding 1: Immunotherapy improves survival in certain cancers',
              'Oncology finding 2: Precision oncology targets specific mutations',
              'Oncology finding 3: Multimodal treatment shows best outcomes',
            ],
          },
          neurology: {
            keywords: ['brain', 'neurological', 'nerve'],
            keyFindings: [
              'Neurology finding 1: Cholinesterase inhibitors improve cognition',
              'Neurology finding 2: Mechanical thrombectomy within 24 hours',
              'Neurology finding 3: Disease-modifying therapies in development',
            ],
          },
          gastroenterology: {
            keywords: ['liver', 'intestine', 'digestive'],
            keyFindings: [
              'Gastroenterology finding 1: H. pylori eradication prevents ulcers',
              'Gastroenterology finding 2: Anti-TNF agents for IBD',
              'Gastroenterology finding 3: Colonoscopy screening reduces CRC',
            ],
          },
          general: {
            keywords: [],
            keyFindings: [
              'Key finding 1: Relevant medical information identified',
              'Key finding 2: Evidence-based recommendations available',
              'Key finding 3: Clinical guidelines referenced',
            ],
          },
        };

        const content = specialtyContent[specialty] || specialtyContent.general;
        const specialtyName = specialty ? specialty.charAt(0).toUpperCase() + specialty.slice(1).toLowerCase() : 'General';

        const mockCitations = Array.from({ length: 3 }, (_, i) => ({
          title: `${specialtyName} Reference ${i + 1}`,
          source: 'PubMed',
          authors: 'Dr. Smith et al.',
          publicationYear: 2024,
          doi: `10.1001/${specialty || 'jama'}.${i}`,
          url: `https://pubmed.ncbi.nlm.nih.gov/${i}`,
        }));

        setTimeout(() => {
          res.json({
            summary: `Based on ${specialtyName} medical literature, here are the key insights for: "${query}"`,
            citations: mockCitations,
            confidenceScore: 0.85 + Math.random() * 0.1,
            keyFindings: content.keyFindings,
          });
        }, 500);
      });
      console.log('Mock AI service endpoint enabled at /api/v1/mock-ai/generate');

      // Mock ingest endpoint for document processing
      app.post('/api/v1/mock-ai/ingest', (req, res) => {
        const {
          title, content, specialty, documentType, source,
        } = req.body;
        console.log(`Mock ingest processed: ${title} (${content?.length || 0} chars)`);
        setTimeout(() => {
          res.json({
            status: 'indexed',
            documentId: `mock-${Date.now()}`,
            chunks: Math.ceil((content?.length || 0) / 1000),
          });
        }, 100);
      });
    }

    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        database: prisma ? 'connected' : 'disconnected',
        socket: io ? 'active' : 'inactive',
      });
    });

    // Socket.IO connection handling with Redis pub/sub for real-time streaming
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join-user', (userId: string) => {
        socket.join(`user-${userId}`);
      });

      socket.on('stream-question', (questionId: string) => {
        socket.join(`question-${questionId}`);
        // Send existing data if available
        redis.get(`question-progress:${questionId}`).then((data) => {
          if (data) {
            socket.emit('ai-progress', JSON.parse(data));
          }
        });
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    // Global error handler
    const { errorHandler } = require('./shared/middleware');
    app.use(errorHandler);

    // Start server
    const PORT = CONFIG.PORT || 3001;
    console.log('Backend URL:', CONFIG.API_URL);
    httpServer.listen(PORT, () => {
      console.log(`Server running in ${CONFIG.NODE_ENV} mode on port ${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });

export { app, io };
