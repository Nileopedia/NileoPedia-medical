"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationController = void 0;
const validation_service_1 = require("../services/validation.service");
const logger_1 = require("../../../config/logger");
const audit_logger_1 = require("../../../modules/audit/audit.logger");
class ValidationController {
    constructor() {
        this.validationService = new validation_service_1.ValidationService();
    }
    async getPending(req, res, next) {
        try {
            const pending = await this.validationService.getPending();
            res.status(200).json({ success: true, data: pending });
        }
        catch (error) {
            logger_1.logger.error('Error in getPending controller:', error);
            next(error);
        }
    }
    async approve(req, res, next) {
        try {
            const { responseId } = req.params;
            const validatorId = req.user.id;
            const { score, feedback } = req.body;
            await this.validationService.approve(responseId, validatorId, score, feedback);
            await audit_logger_1.AuditLogger.log(req, {
                action: 'VALIDATION_APPROVED',
                entityType: 'AIResponse',
                entityId: responseId,
                description: 'Validator approved an AI response',
            });
            res.status(200).json({ success: true, message: 'Response approved' });
        }
        catch (error) {
            logger_1.logger.error('Error in approve controller:', error);
            next(error);
        }
    }
    async reject(req, res, next) {
        try {
            const { responseId } = req.params;
            const validatorId = req.user.id;
            const { feedback } = req.body;
            await this.validationService.reject(responseId, validatorId, feedback);
            await audit_logger_1.AuditLogger.log(req, {
                action: 'VALIDATION_REJECTED',
                entityType: 'AIResponse',
                entityId: responseId,
                description: 'Validator rejected an AI response',
            });
            res.status(200).json({ success: true, message: 'Response rejected' });
        }
        catch (error) {
            logger_1.logger.error('Error in reject controller:', error);
            next(error);
        }
    }
    async getHistory(req, res, next) {
        try {
            const validatorId = req.user.id;
            const userRole = req.user.role;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const history = await this.validationService.getHistory(validatorId, userRole, page, limit);
            res.status(200).json({ success: true, data: history });
        }
        catch (error) {
            logger_1.logger.error('Error in getHistory controller:', error);
            next(error);
        }
    }
    async getReview(req, res, next) {
        try {
            const { responseId } = req.params;
            const review = await this.validationService.getReview(responseId);
            res.status(200).json({ success: true, data: review });
        }
        catch (error) {
            logger_1.logger.error('Error in getReview controller:', error);
            next(error);
        }
    }
    async getApproved(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await this.validationService.getApproved(page, limit);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            logger_1.logger.error('Error in getApproved controller:', error);
            next(error);
        }
    }
    async getRejected(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await this.validationService.getRejected(page, limit);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            logger_1.logger.error('Error in getRejected controller:', error);
            next(error);
        }
    }
    async getFeedbackReports(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await this.validationService.getFeedbackReports(page, limit);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            logger_1.logger.error('Error in getFeedbackReports controller:', error);
            next(error);
        }
    }
    async updateFeedbackReport(req, res, next) {
        try {
            const { reportId } = req.params;
            const { severity, status } = req.body;
            await this.validationService.updateFeedbackReport(reportId, severity, status);
            res.status(200).json({ success: true, message: 'Feedback report updated' });
        }
        catch (error) {
            logger_1.logger.error('Error in updateFeedbackReport controller:', error);
            next(error);
        }
    }
    async getProfile(req, res, next) {
        try {
            const validatorId = req.user.id;
            const profile = await this.validationService.getProfile(validatorId);
            res.status(200).json({ success: true, data: profile });
        }
        catch (error) {
            logger_1.logger.error('Error in getProfile controller:', error);
            next(error);
        }
    }
    async updateProfile(req, res, next) {
        try {
            const validatorId = req.user.id;
            const profile = await this.validationService.updateProfile(validatorId, req.body);
            res.status(200).json({ success: true, data: profile });
        }
        catch (error) {
            logger_1.logger.error('Error in updateProfile controller:', error);
            next(error);
        }
    }
    async getSettings(req, res, next) {
        try {
            const validatorId = req.user.id;
            const settings = await this.validationService.getSettings(validatorId);
            res.status(200).json({ success: true, data: settings });
        }
        catch (error) {
            logger_1.logger.error('Error in getSettings controller:', error);
            next(error);
        }
    }
    async updateSettings(req, res, next) {
        try {
            const validatorId = req.user.id;
            const settings = await this.validationService.updateSettings(validatorId, req.body);
            res.status(200).json({ success: true, data: settings });
        }
        catch (error) {
            logger_1.logger.error('Error in updateSettings controller:', error);
            next(error);
        }
    }
}
exports.ValidationController = ValidationController;
//# sourceMappingURL=validation.controller.js.map