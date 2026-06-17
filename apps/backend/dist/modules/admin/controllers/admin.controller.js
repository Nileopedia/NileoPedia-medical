"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("../services/admin.service");
const logger_1 = require("../../../config/logger");
class AdminController {
    constructor() {
        this.adminService = new admin_service_1.AdminService();
    }
    async getUsers(req, res, next) {
        try {
            const users = await this.adminService.getUsers();
            res.status(200).json({ success: true, data: users });
        }
        catch (error) {
            logger_1.logger.error('Error in getUsers controller:', error);
            next(error);
        }
    }
    async suspendUser(req, res, next) {
        try {
            const { userId } = req.params;
            await this.adminService.suspendUser(userId);
            res.status(200).json({ success: true, message: 'User suspended' });
        }
        catch (error) {
            logger_1.logger.error('Error in suspendUser controller:', error);
            next(error);
        }
    }
    async activateUser(req, res, next) {
        try {
            const { userId } = req.params;
            await this.adminService.activateUser(userId);
            res.status(200).json({ success: true, message: 'User activated' });
        }
        catch (error) {
            logger_1.logger.error('Error in activateUser controller:', error);
            next(error);
        }
    }
    async deleteUser(req, res, next) {
        try {
            const { userId } = req.params;
            await this.adminService.deleteUser(userId);
            res.status(200).json({ success: true, message: 'User deleted' });
        }
        catch (error) {
            logger_1.logger.error('Error in deleteUser controller:', error);
            next(error);
        }
    }
    async getAnalytics(req, res, next) {
        try {
            const analytics = await this.adminService.getAnalytics();
            res.status(200).json({ success: true, data: analytics });
        }
        catch (error) {
            logger_1.logger.error('Error in getAnalytics controller:', error);
            next(error);
        }
    }
    async testEmbeddings(req, res, next) {
        try {
            // Use a simpler test that doesn't block on model download
            const { EmbeddingService } = await Promise.resolve().then(() => __importStar(require('../../rag/services/embedding.service')));
            const embeddingService = new EmbeddingService();
            // Get config info without blocking on embedding generation
            const source = embeddingService.embeddingSource;
            const model = 'all-MiniLM-L6-v2';
            // Try to generate embedding - may fall back to mock if network unavailable
            let embedding = [];
            let dimensions = 384;
            let actualSource = source;
            try {
                embedding = await embeddingService.generateEmbedding('What is diabetes?');
                dimensions = embedding.length;
                actualSource = embeddingService.embeddingSource;
            }
            catch (e) {
                // If generation fails, still report configured source
                console.warn('Embedding test fallback to mock:', e);
                actualSource = 'mock';
            }
            res.status(200).json({
                success: true,
                model,
                dimensions,
                source: actualSource,
                embedding: embedding.slice(0, 5),
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map