"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = void 0;
const auth_routes_1 = __importDefault(require("../modules/auth/routes/auth.routes"));
const setupRoutes = (app, io) => {
    // Health check route
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    // API routes
    app.use('/api/v1/auth', auth_routes_1.default);
    // Other modules will be added here
};
exports.setupRoutes = setupRoutes;
//# sourceMappingURL=index.js.map