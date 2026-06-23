import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
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
      const users = await this.adminService.getUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      logger.error('Error in getUsers controller:', error);
      next(error);
    }
  }

  async suspendUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      await this.adminService.suspendUser(userId);
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
      res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
      logger.error('Error in deleteUser controller:', error);
      next(error);
    }
  }

  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await this.adminService.getAnalytics();
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