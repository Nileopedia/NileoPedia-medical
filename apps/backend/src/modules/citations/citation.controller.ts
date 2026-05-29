import { Request, Response, NextFunction } from 'express';
import { CitationService } from './citation.service';
import { logger } from '../../config/logger';
import { createCitationSchema, updateCitationSchema, searchCitationsQuerySchema } from './citation.validation';

export class CitationController {
  private citationService: CitationService;

  constructor() {
    this.citationService = new CitationService();
  }

  async getCitationsForResponse(req: Request, res: Response, next: NextFunction) {
    try {
      const { responseId } = req.params;
      const citations = await this.citationService.getCitationsForResponse(responseId);

      res.status(200).json({
        success: true,
        data: { citations },
      });
    } catch (error) {
      logger.error('Error in getCitationsForResponse controller:', error);
      next(error);
    }
  }

  async getCitationById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const citation = await this.citationService.getCitationById(id);

      if (!citation) {
        return res.status(404).json({
          success: false,
          message: 'Citation not found',
        });
      }

      res.status(200).json({
        success: true,
        data: citation,
      });
    } catch (error) {
      logger.error('Error in getCitationById controller:', error);
      next(error);
    }
  }

  async searchCitations(req: Request, res: Response, next: NextFunction) {
    try {
      const query = searchCitationsQuerySchema.parse(req.query);
      const result = await this.citationService.searchCitations(query);

      res.status(200).json({
        success: true,
        data: {
          citations: result.citations,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
        },
      });
    } catch (error) {
      logger.error('Error in searchCitations controller:', error);
      next(error);
    }
  }

  async createCitation(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createCitationSchema.parse(req.body);
      const citation = await this.citationService.createCitation(validatedData);

      res.status(201).json({
        success: true,
        message: 'Citation created successfully',
        data: citation,
      });
    } catch (error) {
      logger.error('Error in createCitation controller:', error);
      next(error);
    }
  }

  async updateCitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updateCitationSchema.parse(req.body);
      const citation = await this.citationService.updateCitation(id, validatedData);

      res.status(200).json({
        success: true,
        message: 'Citation updated successfully',
        data: citation,
      });
    } catch (error) {
      logger.error('Error in updateCitation controller:', error);
      next(error);
    }
  }

  async deleteCitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this.citationService.deleteCitation(id);

      res.status(200).json({
        success: true,
        message: 'Citation deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteCitation controller:', error);
      next(error);
    }
  }
}