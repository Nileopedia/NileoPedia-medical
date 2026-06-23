"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("../services/admin.service");
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