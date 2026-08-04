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
const pinecone_service_1 = require("../../../modules/rag/services/pinecone.service");
const env_1 = require("../../../config/env");
const prisma_1 = __importDefault(require("../../../config/prisma"));
const knowledge_audit_service_1 = require("../../../modules/medical/knowledge-audit.service");
const production_monitoring_service_1 = require("../../../modules/monitoring/production-monitoring.service");
const knowledge_gap_detection_service_1 = require("../../../modules/monitoring/knowledge-gap-detection.service");
const evaluation_dataset_service_1 = require("../../../modules/evaluation/evaluation-dataset.service");
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
    async retrievalTest(req, res, next) {
        try {
            const query = req.query.q || 'hypertension';
            const embeddingService = new embedding_service_1.EmbeddingService();
            const retrievalService = new retrieval_service_1.RetrievalService();
            const { embeddingSource } = embeddingService;
            let embeddingDimension = 0;
            let embedding = [];
            try {
                embedding = await embeddingService.generateEmbedding(query);
                embeddingDimension = embedding.length;
            }
            catch (e) {
                console.warn('Embedding test failed:', e?.message || e);
            }
            let pineconeMatches = 0;
            let topResults = [];
            let pineconeError;
            try {
                const results = await retrievalService.hybridSearch(query);
                pineconeMatches = results.length;
                topResults = results.slice(0, 5).map((r) => ({
                    id: r.id,
                    score: r.score,
                    title: r.metadata?.title || r.metadata?.source || 'Unknown',
                }));
            }
            catch (e) {
                pineconeError = e?.message || String(e);
                console.error('[RETRIEVAL_TEST] Pinecone query failed:', e);
            }
            let aiStatus = 'idle';
            if (pineconeError) {
                aiStatus = 'pinecone_error';
            }
            else if (embeddingDimension === 0) {
                aiStatus = 'embedding_error';
            }
            else if (pineconeMatches === 0) {
                aiStatus = 'no_results';
            }
            else {
                aiStatus = 'ready';
            }
            await audit_logger_1.AuditLogger.log(req, {
                action: 'ADMIN_RETRIEVAL_TEST',
                entityType: 'System',
                description: 'Admin ran retrieval pipeline test',
                metadata: { query, aiStatus, pineconeMatches },
            });
            res.status(200).json({
                success: true,
                query,
                embeddingSource,
                embeddingDimension,
                pineconeMatches,
                topResults,
                aiStatus,
                pineconeError,
            });
        }
        catch (error) {
            logger_1.logger.error('Retrieval test error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                aiStatus: 'error',
            });
        }
    }
    async ragDebug(req, res, next) {
        try {
            const { ragDebugService } = require('../../../debug/rag-debug.service');
            const latestDebug = ragDebugService.getLatest();
            await audit_logger_1.AuditLogger.log(req, {
                action: 'ADMIN_RAG_DEBUG',
                entityType: 'System',
                description: 'Admin inspected RAG debug data',
                metadata: {
                    query: latestDebug?.query || 'none',
                    retrievedCount: latestDebug?.retrievedCount || 0,
                    topScore: latestDebug?.topScore || null,
                    matchedSynonym: latestDebug?.matchedSynonym || null,
                    expandedQuery: latestDebug?.expandedQuery || null,
                },
            });
            if (!latestDebug) {
                res.status(200).json({
                    success: true,
                    message: 'No RAG debug data available. Submit a query first.',
                    data: null,
                });
                return;
            }
            const avgChunkLength = latestDebug.finalContext?.length
                ? Math.round(latestDebug.finalContext.reduce((sum, c) => sum + (c.preview?.length || 0), 0) / latestDebug.finalContext.length)
                : 0;
            const metadataFields = ['title', 'authors', 'journal', 'publicationYear', 'doi', 'source'];
            let totalFields = 0;
            let filledFields = 0;
            for (const chunk of latestDebug.finalContext || []) {
                for (const field of metadataFields) {
                    totalFields++;
                    const value = chunk.metadata?.[field];
                    if (value && value !== 'unknown' && value !== 'Unknown' && value !== 'N/A') {
                        filledFields++;
                    }
                }
            }
            const metadataCompleteness = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
            res.status(200).json({
                success: true,
                data: {
                    ...latestDebug,
                    diagnostics: {
                        originalQuery: latestDebug.query,
                        normalizedQuery: latestDebug.normalizedQuery,
                        expandedQuery: latestDebug.expandedQuery || latestDebug.query,
                        matchedSynonym: latestDebug.matchedSynonym || null,
                        synonyms: latestDebug.synonyms || [],
                        resolvedAcronyms: latestDebug.resolvedAcronyms || [],
                        hybridWeights: latestDebug.hybridWeights || { dense: 0.6, keyword: 0.4 },
                        denseResultCount: latestDebug.pineconeMatches?.length || latestDebug.denseResults?.length || 0,
                        keywordResultCount: latestDebug.keywordResults?.length || 0,
                        mergedResultCount: latestDebug.mergedResults?.length || 0,
                        rerankedResultCount: latestDebug.rerankedResults?.length || 0,
                        finalSelectedChunks: latestDebug.finalContext?.length || 0,
                        chunkCount: latestDebug.finalContext?.length || 0,
                        chunkLength: avgChunkLength,
                        metadataCompleteness,
                        citationQuality: latestDebug.citationQuality || 0,
                        confidenceScore: latestDebug.confidenceScore || 0,
                        evidenceStrength: latestDebug.evidenceStrength || 'Unknown',
                        retrievalQuality: latestDebug.retrievalQuality || 0,
                        contextSize: latestDebug.charactersSent || 0,
                        promptSize: latestDebug.promptSize || 0,
                        minScore: latestDebug.minScore || 0.25,
                        embeddingScore: latestDebug.pineconeMatches?.[0]?.score || null,
                        bm25Score: latestDebug.keywordResults?.[0]?.score || null,
                        rerankerScore: latestDebug.rerankedResults?.[0]?.score || null,
                        finalRank: latestDebug.finalContext?.[0]?.rank || null,
                    },
                    averageChunkLength: avgChunkLength,
                    duplicateChunksRemoved: latestDebug.pineconeMatches?.length - latestDebug.filteredMatches?.length || 0,
                    totalContextCharacters: latestDebug.charactersSent,
                    metadataCompleteness,
                    retrievedChunks: (latestDebug.finalContext || []).map((chunk) => ({
                        chunkId: chunk.chunkId,
                        title: chunk.title,
                        authors: chunk.metadata?.authors || 'Unknown',
                        score: chunk.score,
                        rank: chunk.rank,
                        length: chunk.preview?.length || 0,
                        preview: chunk.preview,
                    })),
                },
            });
        }
        catch (error) {
            logger_1.logger.error('RAG debug error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    async performanceTest(req, res, next) {
        const totalStart = Date.now();
        const metrics = {
            embedding_ms: 0, pinecone_ms: 0, groq_ms: 0, total_ms: 0,
        };
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
            const { redis } = require('../../../lib/redis');
            redis.ping();
            return true;
        }
        catch {
            return false;
        }
    }
    async documentDebug(req, res, next) {
        try {
            const { id } = req.params;
            const document = await prisma_1.default.medicalDocument.findUnique({
                where: { id },
                include: {
                    embeddingMetadata: true,
                },
            });
            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found',
                });
            }
            const pineconeService = new pinecone_service_1.PineconeService();
            let pineconeExists = false;
            let vectorCount = 0;
            if (pineconeService && env_1.CONFIG.PINECONE_API_KEY) {
                try {
                    const stats = await pineconeService.describeIndexStats();
                    vectorCount = stats?.totalRecordCount ?? 0;
                    pineconeExists = true;
                }
                catch (e) {
                    logger_1.logger.warn('Could not fetch Pinecone stats', { documentId: id });
                }
            }
            const sampleChunk = document.embeddingMetadata[0]?.chunkText ?? null;
            res.status(200).json({
                success: true,
                documentId: document.id,
                title: document.title,
                uploadStatus: document.ingestionStatus,
                chunkCount: document.embeddingMetadata.length,
                vectorCount,
                pineconeExists,
                sampleChunk,
            });
        }
        catch (error) {
            logger_1.logger.error('Document debug error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    async queryDebug(req, res, next) {
        try {
            const query = req.query.q || '';
            const retrievalService = new retrieval_service_1.RetrievalService();
            const matches = await retrievalService.semanticSearch(query, 10);
            const threshold = retrievalService.embeddingService.embeddingSource === 'mock' ? 0.0 : 0.25;
            const retrievedCount = matches.filter((m) => (m.score ?? 0) >= threshold).length;
            const topScores = matches.slice(0, 3).map((m) => m.score).filter((s) => s !== undefined);
            const documents = matches.map((m) => ({
                id: m.id,
                score: m.score,
                title: m.metadata?.title || m.metadata?.source || 'Unknown',
                preview: m.metadata?.textPreview || m.metadata?.text?.substring(0, 100) || '',
            }));
            res.status(200).json({
                query,
                retrievedCount,
                topScores,
                documents,
            });
        }
        catch (error) {
            logger_1.logger.error('Query debug error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    async aiProcess(req, res, next) {
        try {
            const query = req.query.q || 'what is blood pressure';
            const { processAiGeneration } = require('../../../jobs/processors/ai.processor');
            const result = await processAiGeneration({
                questionId: 'debug-' + Date.now(),
                query,
                userId: '00000000-0000-0000-0000-000000000000',
                topK: 10,
            });
            res.status(200).json({
                success: true,
                query,
                result,
            });
        }
        catch (error) {
            logger_1.logger.error('AI process error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    async seedMockIndex(req, res, next) {
        try {
            const fs = require('fs');
            const path = require('path');
            const { ChunkingService } = require('../../rag/services/chunking.service');
            const { EmbeddingService } = require('../../rag/services/embedding.service');
            const { PineconeService } = require('../../rag/services/pinecone.service');
            const embeddingService = new EmbeddingService();
            const pineconeService = new PineconeService();
            const uploadDir = path.join(process.cwd(), 'uploads');
            const files = fs.readdirSync(uploadDir).filter((f) => f.endsWith('.html') && fs.statSync(path.join(uploadDir, f)).size > 1000);
            let totalChunks = 0;
            for (const file of files.slice(0, 5)) {
                const fullPath = path.join(uploadDir, file);
                const content = fs.readFileSync(fullPath, 'utf8');
                const clean = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 10000);
                const chunkingService = new ChunkingService();
                const chunks = chunkingService.chunkDocument(clean, { source: 'MedlinePlus', specialty: 'general' });
                if (chunks.length > 0) {
                    const batchSize = 20;
                    for (let i = 0; i < Math.min(chunks.length, 200); i += batchSize) {
                        const batch = chunks.slice(i, i + batchSize);
                        const embeddings = await embeddingService.generateBatchEmbeddings(batch.map((c) => c.text));
                        await pineconeService.storeChunks(batch, embeddings, 'mock-' + file);
                    }
                    totalChunks += chunks.length;
                }
            }
            res.status(200).json({
                success: true,
                message: 'Seeded mock index',
                filesProcessed: Math.min(files.length, 5),
                totalChunks,
                totalVectors: PineconeService.mockVectors.length,
            });
        }
        catch (error) {
            logger_1.logger.error('Seed mock index error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    async knowledgeAudit(req, res, next) {
        try {
            const auditService = new knowledge_audit_service_1.KnowledgeAuditService();
            const result = await auditService.runAudit();
            await audit_logger_1.AuditLogger.log(req, {
                action: 'ADMIN_KNOWLEDGE_AUDIT',
                entityType: 'System',
                description: 'Admin ran knowledge base audit',
                metadata: {
                    coveragePercentage: result.coveragePercentage,
                    diseasesIndexed: result.diseasesIndexed.length,
                    missingDiseases: result.missingDiseases.length,
                },
            });
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.error('Knowledge audit error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    async coverageReport(req, res, next) {
        try {
            const auditService = new knowledge_audit_service_1.KnowledgeAuditService();
            const result = await auditService.getCoverageReport();
            await audit_logger_1.AuditLogger.log(req, {
                action: 'ADMIN_COVERAGE_REPORT',
                entityType: 'System',
                description: 'Admin viewed medical coverage report',
                metadata: {
                    coveragePercentage: result.coveragePercentage,
                    missingDiseases: result.missingDiseases.length,
                },
            });
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.error('Coverage report error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    async monitoringDashboard(req, res, next) {
        try {
            const monitoringService = new production_monitoring_service_1.ProductionMonitoringService();
            const dashboardData = await monitoringService.getDashboardData();
            await audit_logger_1.AuditLogger.log(req, {
                action: 'ADMIN_MONITORING_DASHBOARD',
                entityType: 'System',
                description: 'Admin viewed monitoring dashboard',
                metadata: {
                    totalQueries: dashboardData.systemMetrics.totalQueries,
                    failedRetrievals: dashboardData.systemMetrics.failedRetrievals,
                },
            });
            res.status(200).json({
                success: true,
                data: dashboardData,
            });
        }
        catch (error) {
            logger_1.logger.error('Monitoring dashboard error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    async knowledgeGaps(req, res, next) {
        try {
            const gapDetectionService = new knowledge_gap_detection_service_1.KnowledgeGapDetectionService();
            const report = await gapDetectionService.detectGaps();
            await audit_logger_1.AuditLogger.log(req, {
                action: 'ADMIN_KNOWLEDGE_GAPS',
                entityType: 'System',
                description: 'Admin viewed knowledge gap report',
                metadata: {
                    totalGaps: report.totalGaps,
                    highPriorityGaps: report.highPriorityGaps,
                },
            });
            res.status(200).json({
                success: true,
                data: report,
            });
        }
        catch (error) {
            logger_1.logger.error('Knowledge gaps error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    async runEvaluation(req, res, next) {
        try {
            const evaluationDataset = new evaluation_dataset_service_1.EvaluationDataset();
            const report = await evaluationDataset.runEvaluation();
            await audit_logger_1.AuditLogger.log(req, {
                action: 'ADMIN_RUN_EVALUATION',
                entityType: 'System',
                description: 'Admin ran evaluation benchmark',
                metadata: {
                    totalQuestions: report.totalQuestions,
                    averageOverallScore: report.averageOverallScore,
                },
            });
            res.status(200).json({
                success: true,
                data: report,
            });
        }
        catch (error) {
            logger_1.logger.error('Evaluation error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map