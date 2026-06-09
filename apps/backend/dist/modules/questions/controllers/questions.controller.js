"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionsController = void 0;
const questions_service_1 = require("../services/questions.service");
const logger_1 = require("../../../config/logger");
class QuestionsController {
    constructor() {
        this.questionsService = new questions_service_1.QuestionsService();
    }
    async askQuestion(req, res, next) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Authentication required' });
            }
            const userId = req.user.id;
            const { question } = req.body;
            const result = await this.questionsService.askQuestion(userId, question);
            res.status(201).json({
                success: true,
                message: 'Question submitted successfully',
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in askQuestion controller:', error);
            next(error);
        }
    }
    async getHistory(req, res, next) {
        try {
            const userId = req.user.id;
            const questions = await this.questionsService.getHistory(userId);
            res.status(200).json({
                success: true,
                data: questions,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getHistory controller:', error);
            next(error);
        }
    }
    async getQuestion(req, res, next) {
        try {
            const { questionId } = req.params;
            const question = await this.questionsService.getQuestion(questionId);
            res.status(200).json({
                success: true,
                data: question,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getQuestion controller:', error);
            next(error);
        }
    }
    async saveResponse(req, res, next) {
        try {
            const { questionId } = req.params;
            await this.questionsService.saveResponse(questionId, req.user.id);
            res.status(200).json({
                success: true,
                message: 'Response saved',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in saveResponse controller:', error);
            next(error);
        }
    }
    async unsaveResponse(req, res, next) {
        try {
            const { questionId } = req.params;
            await this.questionsService.unsaveResponse(questionId, req.user.id);
            res.status(200).json({
                success: true,
                message: 'Response unsaved',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in unsaveResponse controller:', error);
            next(error);
        }
    }
}
exports.QuestionsController = QuestionsController;
//# sourceMappingURL=questions.controller.js.map