"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = void 0;
const auth_routes_1 = __importDefault(require("../modules/auth/routes/auth.routes"));
const questions_routes_1 = __importDefault(require("../modules/questions/questions.routes"));
const validation_routes_1 = __importDefault(require("../modules/validation/validation.routes"));
const admin_routes_1 = __importDefault(require("../modules/admin/admin.routes"));
const analytics_routes_1 = __importDefault(require("../modules/analytics/analytics.routes"));
const user_routes_1 = __importDefault(require("../modules/users/user.routes"));
const notification_routes_1 = __importDefault(require("../modules/notifications/notification.routes"));
const audit_routes_1 = __importDefault(require("../modules/audit/audit.routes"));
const citation_routes_1 = __importDefault(require("../modules/citations/citation.routes"));
const document_routes_1 = __importDefault(require("../modules/documents/document.routes"));
const search_routes_1 = __importDefault(require("../modules/search/search.routes"));
const setupRoutes = (app, io, authController) => {
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
            },
        });
    });
    // API routes
    app.use('/api/v1/auth', (0, auth_routes_1.default)(authController));
    app.use('/api/v1/questions', questions_routes_1.default);
    app.use('/api/v1/validation', validation_routes_1.default);
    app.use('/api/v1/admin', admin_routes_1.default);
    app.use('/api/v1/analytics', analytics_routes_1.default);
    app.use('/api/v1/users', user_routes_1.default);
    app.use('/api/v1/notifications', notification_routes_1.default);
    app.use('/api/v1/audit-logs', audit_routes_1.default);
    app.use('/api/v1/citations', citation_routes_1.default);
    app.use('/api/v1/documents', document_routes_1.default);
    app.use('/api/v1/search', search_routes_1.default);
};
exports.setupRoutes = setupRoutes;
//# sourceMappingURL=index.js.map