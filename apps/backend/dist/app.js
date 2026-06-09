"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const env_1 = require("./config/env");
const prisma_1 = __importDefault(require("./config/prisma"));
const middleware_1 = require("./shared/middleware");
const routes_1 = require("./routes");
// Initialize Express app
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: env_1.CONFIG.CORS_ORIGIN,
        methods: ['GET', 'POST'],
    },
});
exports.io = io;
global.io = io;
// Connect to database and then setup everything
prisma_1.default.$connect()
    .then(() => {
    console.log('Database connected successfully');
    // Setup middleware (cors, helmet, body parser, etc.)
    (0, middleware_1.setupMiddleware)(app);
    // Import and setup routes with controller instances
    const { default: authRoutes } = require('./modules/auth/routes/auth.routes');
    const { AuthController } = require('./modules/auth/controllers/auth.controller');
    const authController = new AuthController();
    (0, routes_1.setupRoutes)(app, io, authController);
    // Mock AI service endpoint for development/testing (when real AI service unavailable)
    if (env_1.CONFIG.NODE_ENV === 'development' || env_1.CONFIG.USE_MOCK_AI) {
        app.post('/api/v1/mock-ai/generate', (req, res) => {
            const { query } = req.body;
            // Generate mock medical response
            const mockCitations = Array.from({ length: 3 }, (_, i) => ({
                title: `Medical Reference ${i + 1}`,
                source: 'PubMed',
                authors: 'Dr. Smith et al.',
                publicationYear: 2023,
                doi: `10.1001/jama.${i}`,
                url: `https://pubmed.ncbi.nlm.nih.gov/${i}`,
            }));
            setTimeout(() => {
                res.json({
                    summary: `Based on medical literature, here are the key insights for: "${query}"`,
                    citations: mockCitations,
                    confidenceScore: 0.85 + Math.random() * 0.1,
                    keyFindings: [
                        'Key finding 1: Relevant medical information identified',
                        'Key finding 2: Evidence-based recommendations available',
                        'Key finding 3: Clinical guidelines referenced',
                    ],
                });
            }, 500);
        });
        console.log('Mock AI service endpoint enabled at /api/v1/mock-ai/generate');
    }
    // Socket.IO connection handling
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        // Join room for specific user to receive personalized notifications
        socket.on('join-user', (userId) => {
            socket.join(`user-${userId}`);
        });
        // Listen for question streaming
        socket.on('stream-question', (questionId) => {
            socket.join(`question-${questionId}`);
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