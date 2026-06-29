"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("../services/admin.service");
const audit_logger_1 = require("../../audit/audit.logger");
const logger_1 = require("../../../config/logger");
const retrieval_service_1 = require("../../../modules/retrieval/retrieval.service");
const embedding_service_1 = require("../../../modules/rag/services/embedding.service");
const env_1 = require("../../../config/env");
const prisma_1 = __importDefault(require("../../../config/prisma"));
class AdminController {
    constructor() {
        this.adminService = new admin_service_1.AdminService();
    }
    async getUsers(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const search = req.query.search || '';
            const result = await this.adminService.getUsers(page, limit, search);
            await audit_logger_1.AuditLogger.log(req, {
                action: 'ADMIN_VIEW_USERS',
                entityType: 'User',
                description: 'Admin viewed users list',
            });
            res.status(200).json({ success: true, data: result });
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
            await audit_logger_1.AuditLogger.log(req, {
                action: 'ADMIN_USER_SUSPENDED',
                entityType: 'User',
                entityId: userId,
                description: 'Admin suspended a user',
                metadata: { targetUserId: userId },
            });
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
            await audit_logger_1.AuditLogger.log(req, {
                action: 'ADMIN_USER_ACTIVATED',
                entityType: 'User',
                entityId: userId,
                description: 'Admin activated a user',
                metadata: { targetUserId: userId },
            });
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
            await audit_logger_1.AuditLogger.log(req, {
                action: 'ADMIN_USER_DELETED',
                entityType: 'User',
                entityId: userId,
                description: 'Admin deleted a user',
                metadata: { targetUserId: userId },
            });
            res.status(200).json({ success: true, message: 'User deleted' });
        }
        catch (error) {
            logger_1.logger.error('Error in deleteUser controller:', error);
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const { userId } = req.params;
            await this.adminService.resetPassword(userId);
            await audit_logger_1.AuditLogger.log(req, {
                action: 'ADMIN_RESET_PASSWORD',
                entityType: 'User',
                entityId: userId,
                description: 'Admin reset user password',
                metadata: { targetUserId: userId },
            });
            res.status(200).json({ success: true, message: 'Password reset initiated' });
        }
        catch (error) {
            logger_1.logger.error('Error in resetPassword controller:', error);
            next(error);
        }
    }
    async getValidators(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const search = req.query.search || '';
            const result = await this.adminService.getValidators(page, limit, search);
            await audit_logger_1.AuditLogger.log(req, {
                action: 'ADMIN_VIEW_VALIDATORS',
                entityType: 'User',
                description: 'Admin viewed validators list',
            });
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            logger_1.logger.error('Error in getValidators controller:', error);
            next(error);
        }
    }
    async addValidator(req, res, next) {
        try {
            const result = await this.adminService.addValidator(req.body);
            await audit_logger_1.AuditLogger.log(req, {
                action: 'ADMIN_ADD_VALIDATOR',
                entityType: 'User',
                entityId: result.id,
                description: 'Admin added a validator',
                metadata: { email: result.email },
            });
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            logger_1.logger.error('Error in addValidator controller:', error);
            if (error.message?.includes('exists')) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            next(error);
        }
    }
    async removeValidator(req, res, next) {
        try {
            const { validatorId } = req.params;
            await this.adminService.removeValidator(validatorId);
            await audit_logger_1.AuditLogger.log(req, {
                action: 'ADMIN_REMOVE_VALIDATOR',
                entityType: 'User',
                entityId: validatorId,
                description: 'Admin removed a validator',
                metadata: { targetValidatorId: validatorId },
            });
            res.status(200).json({ success: true, message: 'Validator removed' });
        }
        catch (error) {
            logger_1.logger.error('Error in removeValidator controller:', error);
            next(error);
        }
    }
    async getAnalytics(req, res, next) {
        try {
            const analytics = await this.adminService.getAnalytics();
            await audit_logger_1.AuditLogger.log(req, {
                action: 'ADMIN_VIEW_ANALYTICS',
                entityType: 'Analytics',
                description: 'Admin viewed analytics dashboard',
            });
            res.status(200).json({ success: true, data: analytics });
        }
        catch (error) {
            logger_1.logger.error('Error in getAnalytics controller:', error);
            next(error);
        }
    }
    async testEmbeddings(req, res, next) {
        try {
            const embeddingService = new embedding_service_1.EmbeddingService();
            const source = embeddingService.embeddingSource;
            const model = 'all-MiniLM-L6-v2';
            let embedding = [];
            let dimensions = 384;
            let actualSource = source;
            try {
                embedding = await embeddingService.generateEmbedding('What is diabetes?');
                dimensions = embedding.length;
                actualSource = embeddingService.embeddingSource;
            }
            catch (e) {
                console.warn('Embedding test fallback to mock:', e);
                actualSource = 'mock';
            }
            await audit_logger_1.AuditLogger.log(req, {
                action: 'ADMIN_TEST_EMBEDDINGS',
                entityType: 'System',
                description: 'Admin ran embedding test',
            });
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
    async performanceTest(req, res, next) {
        const totalStart = Date.now();
        const metrics = { embedding_ms: 0, pinecone_ms: 0, groq_ms: 0, total_ms: 0 };
        try {
            const embeddingStart = Date.now();
            const embeddingService = new embedding_service_1.EmbeddingService();
            try {
                await embeddingService.generateEmbedding('What is diabetes?');
            }
            catch (e) {
                logger_1.logger.warn('Embedding performance test failed:', e);
            }
            metrics.embedding_ms = Date.now() - embeddingStart;
            const pineconeStart = Date.now();
            const retrievalService = new retrieval_service_1.RetrievalService();
            try {
                await retrievalService.hybridSearch('diabetes treatment');
            }
            catch (e) {
                logger_1.logger.warn('Pinecone performance test failed:', e);
            }
            metrics.pinecone_ms = Date.now() - pineconeStart;
            metrics.total_ms = Date.now() - totalStart;
            await audit_logger_1.AuditLogger.log(req, {
                action: 'ADMIN_PERFORMANCE_TEST',
                entityType: 'System',
                description: 'Admin ran performance test',
                metadata: metrics,
            });
            res.status(200).json({
                embedding_ms: metrics.embedding_ms,
                pinecone_ms: metrics.pinecone_ms,
                groq_ms: metrics.groq_ms,
                total_ms: metrics.total_ms,
            });
        }
        catch (error) {
            logger_1.logger.error('Performance test error:', error);
            metrics.total_ms = Date.now() - totalStart;
            res.status(200).json({
                embedding_ms: metrics.embedding_ms,
                pinecone_ms: metrics.pinecone_ms,
                groq_ms: metrics.groq_ms,
                total_ms: metrics.total_ms,
            });
        }
    }
    async getSystemStatus(req, res, next) {
        try {
            const embeddingService = new embedding_service_1.EmbeddingService();
            const retrievalService = new retrieval_service_1.RetrievalService();
            const [embeddingOk, pineconeOk, documentsCount, vectorsCount] = await Promise.all([
                this.testEmbeddingAvailability(embeddingService),
                this.testPineconeAvailability(retrievalService),
                this.getDocumentsCount(),
                this.getVectorsCount(),
            ]);
            await audit_logger_1.AuditLogger.log(req, {
                action: 'ADMIN_VIEW_SYSTEM_STATUS',
                entityType: 'System',
                description: 'Admin viewed system status',
            });
            res.status(200).json({
                embeddings: embeddingOk,
                pinecone: pineconeOk,
                groq: !!env_1.CONFIG.GROQ_API_KEY,
                redis: this.testRedisAvailability(),
                totalDocuments: documentsCount,
                totalVectors: vectorsCount,
                latency: {
                    embedding_ms: 0,
                    pinecone_ms: 0,
                    groq_ms: 0,
                    total_ms: 0,
                },
                lastChecked: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('System status check error:', error);
            res.status(500).json({
                embeddings: false,
                pinecone: false,
                groq: false,
                redis: false,
                totalDocuments: 0,
                totalVectors: 0,
                error: error.message,
                lastChecked: new Date().toISOString(),
            });
        }
    }
    async getRecentValidations(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const validations = await this.adminService.getRecentValidations(limit);
            res.status(200).json({ success: true, data: validations });
        }
        catch (error) {
            logger_1.logger.error('Error in getRecentValidations controller:', error);
            next(error);
        }
    }
    async getSettings(req, res, next) {
        try {
            const settings = await this.adminService.getSettings();
            res.status(200).json({ success: true, data: settings });
        }
        catch (error) {
            logger_1.logger.error('Error in getSettings controller:', error);
            next(error);
        }
    }
    async updateSettings(req, res, next) {
        try {
            const settings = await this.adminService.updateSettings(req.body);
            await audit_logger_1.AuditLogger.log(req, {
                action: 'ADMIN_UPDATE_SETTINGS',
                entityType: 'Settings',
                description: 'Admin updated system settings',
                metadata: req.body,
            });
            res.status(200).json({ success: true, data: settings });
        }
        catch (error) {
            logger_1.logger.error('Error in updateSettings controller:', error);
            next(error);
        }
    }
    async getAiActivity(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const search = req.query.search || '';
            const status = req.query.status || '';
            const result = await this.adminService.getAiActivity(page, limit, search, status);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            logger_1.logger.error('Error in getAiActivity controller:', error);
            next(error);
        }
    }
    async testEmbeddingAvailability(embeddingService) {
        try {
            const testEmbedding = await embeddingService.generateEmbedding('test');
            return testEmbedding.length > 0;
        }
        catch {
            return false;
        }
    }
    async testPineconeAvailability(retrievalService) {
        try {
            if (!retrievalService.pineconeClient) {
                return false;
            }
            const results = await retrievalService.hybridSearch('test');
            return true;
        }
        catch {
            return false;
        }
    }
    async getDocumentsCount() {
        try {
            const count = await prisma_1.default.medicalDocument.count();
            return count;
        }
        catch {
            return 0;
        }
    }
    async getVectorsCount() {
        try {
            const count = await prisma_1.default.embeddingMetadata.count();
            return count;
        }
        catch {
            return 0;
        }
    }
    testRedisAvailability() {
        try {
            const redis = require('../../../lib/redis').redis;
            redis.ping();
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map