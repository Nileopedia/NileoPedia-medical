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
const setupRoutes = (app, io, authController) => {
    // Health check route
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
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
};
exports.setupRoutes = setupRoutes;
//# sourceMappingURL=index.js.map