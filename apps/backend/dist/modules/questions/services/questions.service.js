"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionsService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const queues_1 = require("../../../jobs/queues");
class QuestionsService {
    async askQuestion(userId, questionText) {
        const question = await prisma_1.default.question.create({
            data: { userId, questionText },
        });
        await queues_1.aiQueue.add('generate', {
            questionId: question.id,
            query: questionText,
            userId,
            topK: 10,
        }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
        });
        return {
            questionId: question.id,
            status: 'processing',
            message: 'Question submitted for processing',
        };
    }
    async getHistory(userId) {
        return prisma_1.default.question.findMany({
            where: { userId },
            include: { aiResponse: { include: { citations: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getQuestion(questionId) {
        const question = await prisma_1.default.question.findUnique({
            where: { id: questionId },
            include: { aiResponse: { include: { citations: true } } },
        });
        if (!question)
            throw new Error('Question not found');
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