"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const redis_1 = require("./lib/redis");
const env_1 = require("./config/env");
const prisma_1 = __importDefault(require("./config/prisma"));
const middleware_1 = require("./shared/middleware");
const routes_1 = require("./routes");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: env_1.CONFIG.CORS_ORIGIN,
        methods: ['GET', 'POST'],
    },
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
    },
});
exports.io = io;
global.io = io;
// Initialize default admin account
async function initializeAdmin() {
    const adminEmail = 'admin@nileopedia.com';
    const adminPassword = 'Admin123456!';
    const existingAdmin = await prisma_1.default.user.findUnique({
        where: { email: adminEmail },
    });
    if (existingAdmin) {
        console.log('Admin account already exists');
    }
    else {
        const hashedPassword = await bcryptjs_1.default.hash(adminPassword, 10);
        await prisma_1.default.user.create({
            data: {
                email: adminEmail,
                fullName: 'Administrator',
                password: hashedPassword,
                role: client_1.UserRole.ADMIN,
                isEmailVerified: true,
                accountStatus: 'ACTIVE',
            },
        });
        console.log('Admin account created');
    }
}
// Seed demo knowledge base on startup (FR-20)
async function seedKnowledgeBase() {
    const { refreshKnowledgeBase } = require('./jobs/processors/document.processor');
    const demoCount = await prisma_1.default.medicalDocument.count();
    if (demoCount === 0) {
        console.log('Seeding demo knowledge base...');
        await refreshKnowledgeBase(false);
        console.log('Demo knowledge base seeded');
    }
}
// Verify embedding service on startup
async function verifyEmbeddings() {
    const { EmbeddingService } = require('./modules/rag/services/embedding.service');
    const embeddingService = new EmbeddingService();
    console.log('\n========== EMBEDDING SERVICE VERIFICATION ==========');
    console.log('HF_API_KEY configured:', !!env_1.CONFIG.HF_API_KEY);
    console.log('USE_MOCK_EMBEDDINGS:', env_1.CONFIG.USE_MOCK_EMBEDDINGS);
    console.log('isRealEmbeddings:', embeddingService.isRealEmbeddings);
    if (!embeddingService.isRealEmbeddings) {
        console.warn('\n[INFO] Using mock embeddings - no embedding service available');
        console.warn('[INFO] Install @xenova/transformers for local embeddings\n');
    }
    else {
        console.log('\n[INFO] Real embeddings active:', embeddingService.embeddingSource);
        try {
            const testEmbedding = await embeddingService.generateEmbedding('startup test');
            console.log('[INFO] Test embedding generated:', testEmbedding.length, 'dimensions');
        }
        catch (e) {
            console.error('[ERROR] Failed to generate test embedding:', e?.message || e);
        }
    }
    console.log('===================================================\n');
}
// Connect to database and then setup everything
prisma_1.default.$connect()
    .then(async () => {
    console.log('Database connected successfully');
    // Initialize admin account
    await initializeAdmin();
    // Verify embedding service at startup (non-blocking)
    setImmediate(() => verifyEmbeddings());
    // Seed knowledge base if empty
    await seedKnowledgeBase();
    // Setup middleware (cors, helmet, body parser, etc.)
    (0, middleware_1.setupMiddleware)(app);
    // Import and setup routes with controller instances
    const { default: authRoutes } = require('./modules/auth/routes/auth.routes');
    const { AuthController } = require('./modules/auth/controllers/auth.controller');
    const authController = new AuthController();
    (0, routes_1.setupRoutes)(app, io, authController);
    // Mock AI service endpoint (only when explicitly enabled)
    if (env_1.CONFIG.USE_MOCK_AI) {
        app.post('/api/v1/mock-ai/generate', (req, res) => {
            const { query, specialty } = req.body;
            // Specialty-specific mock content
            const specialtyContent = {
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
            const { title, content, specialty, documentType, source } = req.body;
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
    // Socket.IO connection handling with Redis pub/sub for real-time streaming
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        socket.on('join-user', (userId) => {
            socket.join(`user-${userId}`);
        });
        socket.on('stream-question', (questionId) => {
            socket.join(`question-${questionId}`);
            // Send existing data if available
            redis_1.redis.get(`question-progress:${questionId}`).then(data => {
                if (data) {
                    socket.emit('ai-progress', JSON.parse(data));
                }
            });
        });
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
    // Start server
    const PORT = env_1.CONFIG.PORT || 3001;
    httpServer.listen(PORT, () => {
        console.log(`Server running in ${env_1.CONFIG.NODE_ENV} mode on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
});
//# sourceMappingURL=app.js.map