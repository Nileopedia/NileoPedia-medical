"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const search_service_1 = require("./search.service");
const logger_1 = require("../../config/logger");
const search_validation_1 = require("./search.validation");
class SearchController {
    constructor() {
        this.searchService = new search_service_1.SearchService();
    }
    async globalSearch(req, res, next) {
        try {
            const validatedQuery = search_validation_1.searchQuerySchema.parse(req.query);
            const result = await this.searchService.globalSearch({
                q: validatedQuery.q,
                type: validatedQuery.type,
                specialty: validatedQuery.specialty,
                limit: validatedQuery.limit,
                page: validatedQuery.page,
                publicationYear: validatedQuery.publicationYear,
                documentType: validatedQuery.documentType,
            });
            // Handle error response (Pinecone unavailable)
            if ('success' in result && result.success === false) {
                return res.status(503).json({
                    success: false,
                    error: result.error,
                });
            }
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in globalSearch controller:', error);
            next(error);
        }
    }
    async semanticSearch(req, res, next) {
        try {
            const { q, topK, specialty } = req.query;
            const result = {
                query: q,
                results: await this.searchService.semanticSearch(q, specialty, parseInt(topK) || 10),
                pagination: {
                    total: 0,
                    page: 1,
                    limit: parseInt(topK) || 10,
                    totalPages: 1,
                },
                searchType: 'semantic',
            };
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in semanticSearch controller:', error);
            next(error);
        }
    }
    async keywordSearch(req, res, next) {
        try {
            const { q, limit, specialty } = req.query;
            const result = {
                query: q,
                results: await this.searchService.keywordSearch(q, specialty, parseInt(limit) || 20),
                pagination: {
                    total: 0,
                    page: 1,
                    limit: parseInt(limit) || 20,
                    totalPages: 1,
                },
                searchType: 'keyword',
            };
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in keywordSearch controller:', error);
            next(error);
        }
    }
    async hybridSearch(req, res, next) {
        try {
            const { q, limit, specialty } = req.query;
            const result = {
                query: q,
                results: await this.searchService.hybridSearch(q, specialty, parseInt(limit) || 20),
                pagination: {
                    total: 0,
                    page: 1,
                    limit: parseInt(limit) || 20,
                    totalPages: 1,
                },
                searchType: 'hybrid',
            };
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in hybridSearch controller:', error);
            next(error);
        }
    }
    async searchDocuments(req, res, next) {
        try {
            const { q, specialty, limit, page, publicationYear, documentType, } = req.query;
            const validatedQuery = search_validation_1.searchQuerySchema.parse(req.query);
            const result = await this.searchService.searchDocuments({
                q: validatedQuery.q,
                type: 'keyword',
                specialty: specialty,
                limit: parseInt(limit) || 20,
                page: parseInt(page) || 1,
                publicationYear: publicationYear ? parseInt(publicationYear) : undefined,
                documentType: documentType,
            });
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in searchDocuments controller:', error);
            next(error);
        }
    }
    async searchCitations(req, res, next) {
        try {
            const { q, limit, page } = req.query;
            const validatedQuery = search_validation_1.searchQuerySchema.parse(req.query);
            const result = await this.searchService.searchCitations({
                q: validatedQuery.q,
                type: 'keyword',
                limit: parseInt(limit) || 20,
                page: parseInt(page) || 1,
            });
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in searchCitations controller:', error);
            next(error);
        }
    }
}
exports.SearchController = SearchController;
//# sourceMappingURL=search.controller.js.map