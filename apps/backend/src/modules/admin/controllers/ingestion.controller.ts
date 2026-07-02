import { Request, Response, NextFunction } from 'express';
import { documentQueue } from '../../../jobs/queues';
import { refreshKnowledgeBase } from '../../../jobs/processors/document.processor';
import { AuditLogger } from '../../audit/audit.logger';
import { logger } from '../../../config/logger';

const JOURNAL_SOURCES = [
  { name: 'PubMed Central', specialty: 'general' },
  { name: 'NEJM', specialty: 'general' },
  { name: 'The Lancet', specialty: 'general' },
  { name: 'JAMA', specialty: 'general' },
  { name: 'Circulation', specialty: 'cardiology' },
  { name: 'Diabetes Care', specialty: 'endocrinology' },
  { name: 'Journal of Clinical Oncology', specialty: 'oncology' },
  { name: 'Neurology', specialty: 'neurology' },
  { name: 'Gastroenterology', specialty: 'gastroenterology' },
];

export class IngestionController {
  async runManualIngestion(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await refreshKnowledgeBase(false);
      await AuditLogger.log(req, {
        action: 'ADMIN_INGESTION_RUN',
        entityType: 'Ingestion',
        description: 'Admin triggered manual knowledge base ingestion',
        metadata: { result: results },
      });
      res.status(200).json({ success: true, message: 'Manual ingestion completed', data: results });
    } catch (error) {
      logger.error('Error in runManualIngestion controller:', error);
      next(error);
    }
  }

  async runIncrementalRefresh(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await refreshKnowledgeBase(true);
      await AuditLogger.log(req, {
        action: 'ADMIN_INGESTION_REFRESH',
        entityType: 'Ingestion',
        description: 'Admin triggered incremental KB refresh',
        metadata: { result: results },
      });
      res.status(200).json({ success: true, message: 'Incremental refresh completed', data: results });
    } catch (error) {
      logger.error('Error in runIncrementalRefresh controller:', error);
      next(error);
    }
  }

  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = {
        isRunning: false,
        isActive: !!documentQueue,
        sources: JOURNAL_SOURCES.length,
      };
      res.status(200).json({ success: true, data: status });
    } catch (error) {
      logger.error('Error in getStatus controller:', error);
      next(error);
    }
  }
}
