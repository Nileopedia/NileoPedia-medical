import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { logger } from '../../../config/logger';

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
      // Use a simpler test that doesn't block on model download
      const { EmbeddingService } = await import('../../rag/services/embedding.service');
      const embeddingService = new EmbeddingService();
      
      // Get config info without blocking on embedding generation
      const source = embeddingService.embeddingSource;
      const model = 'all-MiniLM-L6-v2';
      
      // Try to generate embedding - may fall back to mock if network unavailable
      let embedding: number[] = [];
      let dimensions = 384;
      let actualSource = source;
      
      try {
        embedding = await embeddingService.generateEmbedding('What is diabetes?');
        dimensions = embedding.length;
        actualSource = embeddingService.embeddingSource;
      } catch (e) {
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}