"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.errorHandler = exports.setupMiddleware = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const validation_middleware_1 = require("./validation.middleware");
Object.defineProperty(exports, "validate", { enumerable: true, get: function () { return validation_middleware_1.validate; } });
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
const setupMiddleware = (app) => {
    // Security middleware
    app.use((0, helmet_1.default)());
    // CORS middleware
    app.use((0, cors_1.default)({
        origin: env_1.CONFIG.CORS_ORIGIN,
        credentials: true,
    }));
    // Body parsing middleware
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Logging middleware
    app.use((0, morgan_1.default)('combined'));
    // Rate limiting
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: env_1.CONFIG.RATE_LIMIT_WINDOW_MS,
        max: env_1.CONFIG.RATE_LIMIT_MAX_REQUESTS,
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use(limiter);
    // Request logging middleware
    app.use((req, res, next) => {
        logger_1.logger.info(`${req.method} ${req.path} - ${req.ip}`);
        next();
    });
};
exports.setupMiddleware = setupMiddleware;
// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error('Error handler caught:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=index.js.map