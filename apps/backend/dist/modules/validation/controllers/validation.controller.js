"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationController = void 0;
const validation_service_1 = require("../services/validation.service");
const logger_1 = require("../../../config/logger");
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
            const history = await this.validationService.getHistory(validatorId, userRole);
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
}
exports.ValidationController = ValidationController;
//# sourceMappingURL=validation.controller.js.map