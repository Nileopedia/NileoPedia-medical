"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionsService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const queues_1 = require("../../../jobs/queues");
const logger_1 = require("../../../config/logger");
class QuestionsService {
    async askQuestion(userId, questionText, specialty) {
        try {
            const question = await prisma_1.default.question.create({
                data: { userId, questionText, category: specialty || 'General' },
            });
            if (queues_1.aiQueue && typeof queues_1.aiQueue.add === 'function') {
                try {
                    await queues_1.aiQueue.add('generate', {
                        questionId: question.id,
                        query: questionText,
                        userId,
                        topK: 10,
                        specialty: specialty || null,
                    }, {
                        attempts: 3,
                        backoff: { type: 'exponential', delay: 2000 },
                    });
                }
                catch (queueError) {
                    logger_1.logger.error('[ERROR] Queue unavailable:', queueError?.message);
                }
            }
            return {
                questionId: question.id,
                status: 'processing',
                message: 'Question submitted for processing',
            };
        }
        catch (error) {
            logger_1.logger.error('[ERROR] askQuestion failed:', error);
            throw error;
        }
    }
    async getHistory(userId, options = {}) {
        const { page = 1, limit = 10, category, startDate, endDate, } = options;
        const skip = (page - 1) * limit;
        const where = { userId };
        if (category)
            where.category = category;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const [questions, total] = await Promise.all([
            prisma_1.default.question.findMany({
                where,
                include: { aiResponse: { include: { citations: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma_1.default.question.count({ where }),
        ]);
        return {
            questions,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getSavedResponses(userId, options = {}) {
        const { page = 1, limit = 10, search } = options;
        const skip = (page - 1) * limit;
        const where = { userId, isSaved: true };
        if (search) {
            where.OR = [
                { questionText: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [questions, total] = await Promise.all([
            prisma_1.default.question.findMany({
                where,
                include: { aiResponse: { include: { citations: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma_1.default.question.count({ where }),
        ]);
        return {
            questions,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getQuestion(questionId) {
        const question = await prisma_1.default.question.findUnique({
            where: { id: questionId },
            include: { aiResponse: { include: { citations: true } } },
        });
        if (!question)
            throw new Error('Question not found');
        // If no AI response exists, return question with empty response
        if (!question.aiResponse) {
            return {
                ...question,
                aiResponse: {
                    summary: 'I could not find supporting medical information in the knowledge base.',
                    keyFindings: [],
                    detailedExplanation: '',
                    confidenceScore: 0,
                    generatedBy: 'Unavailable',
                },
            };
        }
        return question;
    }
    async saveResponse(questionId, userId) {
        const question = await prisma_1.default.question.findUnique({
            where: { id: questionId },
        });
        if (!question) {
            throw new Error('Question not found');
        }
        if (question.userId !== userId) {
            throw new Error('Unauthorized');
        }
        await prisma_1.default.question.update({
            where: { id: questionId },
            data: { isSaved: true },
        });
    }
    async unsaveResponse(questionId, userId) {
        const question = await prisma_1.default.question.findUnique({
            where: { id: questionId },
        });
        if (!question) {
            throw new Error('Question not found');
        }
        if (question.userId !== userId) {
            throw new Error('Unauthorized');
        }
        await prisma_1.default.question.update({
            where: { id: questionId },
            data: { isSaved: false },
        });
    }
}
exports.QuestionsService = QuestionsService;
//# sourceMappingURL=questions.service.js.map