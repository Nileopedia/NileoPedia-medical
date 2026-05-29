import { Request, Response, NextFunction } from 'express';
import { SearchService } from './search.service';
import { logger } from '../../config/logger';
import { searchQuerySchema, semanticSearchSchema, keywordSearchSchema } from './search.validation';
import { SearchType } from './search.types';

export class SearchController {
  private searchService: SearchService;

  constructor() {
    this.searchService = new SearchService();
  }

  async globalSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedQuery = searchQuerySchema.parse(req.query);

      const result = await this.searchService.globalSearch({
        q: validatedQuery.q,
        type: validatedQuery.type as SearchType,
        specialty: validatedQuery.specialty,
        limit: validatedQuery.limit,
        page: validatedQuery.page,
        publicationYear: validatedQuery.publicationYear,
        documentType: validatedQuery.documentType,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in globalSearch controller:', error);
      next(error);
    }
  }

  async semanticSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, topK, specialty } = req.query;
      const result = {
        query: q as string,
        results: await this.searchService.semanticSearch(
          q as string,
          specialty as string,
          parseInt(topK as string) || 10
        ),
        pagination: {
          total: 0,
          page: 1,
          limit: parseInt(topK as string) || 10,
          totalPages: 1,
        },
        searchType: 'semantic' as SearchType,
      };

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in semanticSearch controller:', error);
      next(error);
    }
  }

  async keywordSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, limit, specialty } = req.query;
      const result = {
        query: q as string,
        results: await this.searchService.keywordSearch(
          q as string,
          specialty as string,
          parseInt(limit as string) || 20
        ),
        pagination: {
          total: 0,
          page: 1,
          limit: parseInt(limit as string) || 20,
          totalPages: 1,
        },
        searchType: 'keyword' as SearchType,
      };

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in keywordSearch controller:', error);
      next(error);
    }
  }

  async hybridSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, limit, specialty } = req.query;
      const result = {
        query: q as string,
        results: await this.searchService.hybridSearch(
          q as string,
          specialty as string,
          parseInt(limit as string) || 20
        ),
        pagination: {
          total: 0,
          page: 1,
          limit: parseInt(limit as string) || 20,
          totalPages: 1,
        },
        searchType: 'hybrid' as SearchType,
      };

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in hybridSearch controller:', error);
      next(error);
    }
  }

  async searchDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, specialty, limit, page, publicationYear, documentType } = req.query;
      const validatedQuery = searchQuerySchema.parse(req.query);

      const result = await this.searchService.searchDocuments({
        q: validatedQuery.q,
        type: 'keyword' as SearchType,
        specialty: specialty as string,
        limit: parseInt(limit as string) || 20,
        page: parseInt(page as string) || 1,
        publicationYear: publicationYear ? parseInt(publicationYear as string) : undefined,
        documentType: documentType as string,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in searchDocuments controller:', error);
      next(error);
    }
  }

  async searchCitations(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, limit, page } = req.query;
      const validatedQuery = searchQuerySchema.parse(req.query);

      const result = await this.searchService.searchCitations({
        q: validatedQuery.q,
        type: 'keyword' as SearchType,
        limit: parseInt(limit as string) || 20,
        page: parseInt(page as string) || 1,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in searchCitations controller:', error);
      next(error);
    }
  }
}