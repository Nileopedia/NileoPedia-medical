import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { AuditLogger } from '../../audit/audit.logger';
import { logger } from '../../../config/logger';
import { RetrievalService } from '../../../modules/retrieval/retrieval.service';
import { EmbeddingService } from '../../../modules/rag/services/embedding.service';
import { CONFIG } from '../../../config/env';
import prisma from '../../../config/prisma';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string || '';
      const result = await this.adminService.getUsers(page, limit, search);
      await AuditLogger.log(req, {
        action: 'ADMIN_VIEW_USERS',
        entityType: 'User',
        description: 'Admin viewed users list',
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      logger.error('Error in getUsers controller:', error);
      next(error);
    }
  }

  async suspendUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      await this.adminService.suspendUser(userId);
      await AuditLogger.log(req, {
        action: 'ADMIN_USER_SUSPENDED',
        entityType: 'User',
        entityId: userId,
        description: 'Admin suspended a user',
        metadata: { targetUserId: userId },
      });
      res.status(200).json({ success: true, message: 'User suspended' });
    } catch (error) {
      logger.error('Error in suspendUser controller:', error);
      next(error);
    }
  }

  async activateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      await this.adminService.activateUser(userId);
      await AuditLogger.log(req, {
        action: 'ADMIN_USER_ACTIVATED',
        entityType: 'User',
        entityId: userId,
        description: 'Admin activated a user',
        metadata: { targetUserId: userId },
      });
      res.status(200).json({ success: true, message: 'User activated' });
    } catch (error) {
      logger.error('Error in activateUser controller:', error);
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      await this.adminService.deleteUser(userId);
      await AuditLogger.log(req, {
        action: 'ADMIN_USER_DELETED',
        entityType: 'User',
        entityId: userId,
        description: 'Admin deleted a user',
        metadata: { targetUserId: userId },
      });
      res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
      logger.error('Error in deleteUser controller:', error);
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      await this.adminService.resetPassword(userId);
      await AuditLogger.log(req, {
        action: 'ADMIN_RESET_PASSWORD',
        entityType: 'User',
        entityId: userId,
        description: 'Admin reset user password',
        metadata: { targetUserId: userId },
      });
      res.status(200).json({ success: true, message: 'Password reset initiated' });
    } catch (error) {
      logger.error('Error in resetPassword controller:', error);
      next(error);
    }
  }

  async getValidators(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string || '';
      const result = await this.adminService.getValidators(page, limit, search);
      await AuditLogger.log(req, {
        action: 'ADMIN_VIEW_VALIDATORS',
        entityType: 'User',
        description: 'Admin viewed validators list',
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      logger.error('Error in getValidators controller:', error);
      next(error);
    }
  }

  async addValidator(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.adminService.addValidator(req.body);
      await AuditLogger.log(req, {
        action: 'ADMIN_ADD_VALIDATOR',
        entityType: 'User',
        entityId: result.id,
        description: 'Admin added a validator',
        metadata: { email: result.email },
      });
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      logger.error('Error in addValidator controller:', error);
      if (error.message?.includes('exists')) {
        res.status(409).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  async removeValidator(req: Request, res: Response, next: NextFunction) {
    try {
      const { validatorId } = req.params;
      await this.adminService.removeValidator(validatorId);
      await AuditLogger.log(req, {
        action: 'ADMIN_REMOVE_VALIDATOR',
        entityType: 'User',
        entityId: validatorId,
        description: 'Admin removed a validator',
        metadata: { targetValidatorId: validatorId },
      });
      res.status(200).json({ success: true, message: 'Validator removed' });
    } catch (error) {
      logger.error('Error in removeValidator controller:', error);
      next(error);
    }
  }

  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await this.adminService.getAnalytics();
      await AuditLogger.log(req, {
        action: 'ADMIN_VIEW_ANALYTICS',
        entityType: 'Analytics',
        description: 'Admin viewed analytics dashboard',
      });
      res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      logger.error('Error in getAnalytics controller:', error);
      next(error);
    }
  }

  async testEmbeddings(req: Request, res: Response, next: NextFunction) {
    try {
      const embeddingService = new EmbeddingService();
      
      const source = embeddingService.embeddingSource;
      const model = 'all-MiniLM-L6-v2';
      
      let embedding: number[] = [];
      let dimensions = 384;
      let actualSource = source;
      
      try {
        embedding = await embeddingService.generateEmbedding('What is diabetes?');
        dimensions = embedding.length;
        actualSource = embeddingService.embeddingSource;
      } catch (e) {
        console.warn('Embedding test fallback to mock:', e);
        actualSource = 'mock';
      }
      
      await AuditLogger.log(req, {
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

    async retrievalTest(req: Request, res: Response, next: NextFunction) {
      try {
        const query = (req.query.q as string) || 'hypertension';
        const embeddingService = new EmbeddingService();
        const retrievalService = new RetrievalService();

        const embeddingSource = embeddingService.embeddingSource;
        let embeddingDimension = 0;
        let embedding: number[] = [];

        try {
          embedding = await embeddingService.generateEmbedding(query);
          embeddingDimension = embedding.length;
        } catch (e: any) {
          console.warn('Embedding test failed:', e?.message || e);
        }

        let pineconeMatches = 0;
        let topResults: any[] = [];
        let pineconeError: string | undefined;

        try {
          const results = await retrievalService.hybridSearch(query);
          pineconeMatches = results.length;
          topResults = results.slice(0, 5).map((r: any) => ({
            id: r.id,
            score: r.score,
            title: r.metadata?.title || r.metadata?.source || 'Unknown',
          }));
        } catch (e: any) {
          pineconeError = e?.message || String(e);
          console.error('[RETRIEVAL_TEST] Pinecone query failed:', e);
        }

        let aiStatus = 'idle';
        if (pineconeError) {
          aiStatus = 'pinecone_error';
        } else if (embeddingDimension === 0) {
          aiStatus = 'embedding_error';
        } else if (pineconeMatches === 0) {
          aiStatus = 'no_results';
        } else {
          aiStatus = 'ready';
        }

        await AuditLogger.log(req, {
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
      } catch (error: any) {
        logger.error('Retrieval test error:', error);
        res.status(500).json({
          success: false,
          error: error.message,
          aiStatus: 'error',
        });
      }
    }

    async ragDebug(req: Request, res: Response, next: NextFunction) {
      try {
        const query = (req.query.q as string) || '';
        const retrievalService = new RetrievalService();

        const pineconeMatches = await retrievalService.semanticSearch(query, 10);
        const relevant = pineconeMatches.filter((match: any) => (match.score ?? 0) >= 0.75);
        const documents = relevant.map((doc: any) => ({
          id: doc.id,
          score: doc.score,
          title: doc.metadata?.title || doc.metadata?.source || 'Unknown',
          source: doc.metadata?.source || 'Unknown',
        }));

        await AuditLogger.log(req, {
          action: 'ADMIN_RAG_DEBUG',
          entityType: 'System',
          description: 'Admin inspected RAG retrieval results',
          metadata: { query, retrievedCount: documents.length, topScore: documents[0]?.score },
        });

        res.status(200).json({
          success: true,
          query,
          retrievedCount: documents.length,
          topScore: documents[0]?.score || null,
          documents,
        });
      } catch (error: any) {
        logger.error('RAG debug error:', error);
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }

  async performanceTest(req: Request, res: Response, next: NextFunction) {
    const totalStart = Date.now();
    const metrics = { embedding_ms: 0, pinecone_ms: 0, groq_ms: 0, total_ms: 0 };
    
    try {
      const embeddingStart = Date.now();
      const embeddingService = new EmbeddingService();
      
      try {
        await embeddingService.generateEmbedding('What is diabetes?');
      } catch (e) {
        logger.warn('Embedding performance test failed:', e);
      }
      metrics.embedding_ms = Date.now() - embeddingStart;

      const pineconeStart = Date.now();
      const retrievalService = new RetrievalService();
      
      try {
        await retrievalService.hybridSearch('diabetes treatment');
      } catch (e) {
        logger.warn('Pinecone performance test failed:', e);
      }
      metrics.pinecone_ms = Date.now() - pineconeStart;

      metrics.total_ms = Date.now() - totalStart;

      await AuditLogger.log(req, {
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
    } catch (error: any) {
      logger.error('Performance test error:', error);
      metrics.total_ms = Date.now() - totalStart;
      res.status(200).json({
        embedding_ms: metrics.embedding_ms,
        pinecone_ms: metrics.pinecone_ms,
        groq_ms: metrics.groq_ms,
        total_ms: metrics.total_ms,
      });
    }
  }

  async getSystemStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const embeddingService = new EmbeddingService();
      const retrievalService = new RetrievalService();
      
      const [embeddingOk, pineconeOk, documentsCount, vectorsCount] = await Promise.all([
        this.testEmbeddingAvailability(embeddingService),
        this.testPineconeAvailability(retrievalService),
        this.getDocumentsCount(),
        this.getVectorsCount(),
      ]);

      await AuditLogger.log(req, {
        action: 'ADMIN_VIEW_SYSTEM_STATUS',
        entityType: 'System',
        description: 'Admin viewed system status',
      });
      
      res.status(200).json({
        embeddings: embeddingOk,
        pinecone: pineconeOk,
        groq: !!CONFIG.GROQ_API_KEY,
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
    } catch (error: any) {
      logger.error('System status check error:', error);
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

  async getRecentValidations(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const validations = await this.adminService.getRecentValidations(limit);
      res.status(200).json({ success: true, data: validations });
    } catch (error) {
      logger.error('Error in getRecentValidations controller:', error);
      next(error);
    }
  }

  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await this.adminService.getSettings();
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      logger.error('Error in getSettings controller:', error);
      next(error);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await this.adminService.updateSettings(req.body);
      await AuditLogger.log(req, {
        action: 'ADMIN_UPDATE_SETTINGS',
        entityType: 'Settings',
        description: 'Admin updated system settings',
        metadata: req.body,
      });
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      logger.error('Error in updateSettings controller:', error);
      next(error);
    }
  }

  async getAiActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string || '';
      const status = req.query.status as string || '';
      
      const result = await this.adminService.getAiActivity(page, limit, search, status);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      logger.error('Error in getAiActivity controller:', error);
      next(error);
    }
  }

  private async testEmbeddingAvailability(embeddingService: EmbeddingService): Promise<boolean> {
    try {
      const testEmbedding = await embeddingService.generateEmbedding('test');
      return testEmbedding.length > 0;
    } catch {
      return false;
    }
  }

  private async testPineconeAvailability(retrievalService: RetrievalService): Promise<boolean> {
    try {
      if (!retrievalService.pineconeClient) {
        return false;
      }
      const results = await retrievalService.hybridSearch('test');
      return true;
    } catch {
      return false;
    }
  }

  private async getDocumentsCount(): Promise<number> {
    try {
      const count = await prisma.medicalDocument.count();
      return count;
    } catch {
      return 0;
    }
  }

  private async getVectorsCount(): Promise<number> {
    try {
      const count = await prisma.embeddingMetadata.count();
      return count;
    } catch {
      return 0;
    }
  }

  private testRedisAvailability(): boolean {
    try {
      const redis = require('../../../lib/redis').redis;
      redis.ping();
      return true;
    } catch {
      return false;
    }
  }
}