"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitationController = void 0;
const citation_service_1 = require("./citation.service");
const logger_1 = require("../../config/logger");
const citation_validation_1 = require("./citation.validation");
class CitationController {
    constructor() {
        this.citationService = new citation_service_1.CitationService();
    }
    async getCitationsForResponse(req, res, next) {
        try {
            const { responseId } = req.params;
            const citations = await this.citationService.getCitationsForResponse(responseId);
            res.status(200).json({
                success: true,
                data: { citations },
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getCitationsForResponse controller:', error);
            next(error);
        }
    }
    async getCitationById(req, res, next) {
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
        }
        catch (error) {
            logger_1.logger.error('Error in getCitationById controller:', error);
            next(error);
        }
    }
    async searchCitations(req, res, next) {
        try {
            const query = citation_validation_1.searchCitationsQuerySchema.parse(req.query);
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
        }
        catch (error) {
            logger_1.logger.error('Error in searchCitations controller:', error);
            next(error);
        }
    }
    async createCitation(req, res, next) {
        try {
            const validatedData = citation_validation_1.createCitationSchema.parse(req.body);
            const citation = await this.citationService.createCitation(validatedData);
            res.status(201).json({
                success: true,
                message: 'Citation created successfully',
                data: citation,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in createCitation controller:', error);
            next(error);
        }
    }
    async updateCitation(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = citation_validation_1.updateCitationSchema.parse(req.body);
            const citation = await this.citationService.updateCitation(id, validatedData);
            res.status(200).json({
                success: true,
                message: 'Citation updated successfully',
                data: citation,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in updateCitation controller:', error);
            next(error);
        }
    }
    async deleteCitation(req, res, next) {
        try {
            const { id } = req.params;
            await this.citationService.deleteCitation(id);
            res.status(200).json({
                success: true,
                message: 'Citation deleted successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in deleteCitation controller:', error);
            next(error);
        }
    }
}
exports.CitationController = CitationController;
//# sourceMappingURL=citation.controller.js.map