"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionsService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const pinecone_service_1 = require("../../rag/services/pinecone.service");
const embedding_service_1 = require("../../rag/services/embedding.service");
const ai_service_1 = require("../../ai/services/ai.service");
class QuestionsService {
    constructor() {
        this.pineconeService = new pinecone_service_1.PineconeService();
        this.embeddingService = new embedding_service_1.EmbeddingService();
        this.aiService = new ai_service_1.AIService();
    }
    async askQuestion(userId, questionText) {
        const question = await prisma_1.default.question.create({
            data: { userId, questionText },
        });
        const retrievedChunks = await this.pineconeService.searchSimilar(questionText, this.embeddingService, 10);
        const context = retrievedChunks.map((r) => r.metadata?.textPreview || '').join('\n\n');
        const aiResponse = await this.aiService.generateResponse(questionText, context);
        const response = await prisma_1.default.aIResponse.create({
            data: {
                questionId: question.id,
                summary: aiResponse.summary,
                confidenceScore: aiResponse.confidenceScore,
                generatedBy: 'GPT-4o',
                citations: {
                    create: aiResponse.citations?.map((c, i) => ({
                        title: c.title || 'Medical Source',
                        source: c.source || 'Unknown',
                        authors: c.authors,
                        publicationYear: c.year,
                        citationIndex: i + 1,
                    })) || [],
                },
            },
            include: { citations: true },
        });
        return {
            questionId: question.id,
            response: {
                summary: response.summary,
                status: response.validationStatus,
                confidenceScore: response.confidenceScore,
                citations: response.citations,
                timestamp: response.createdAt,
            },
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
        await prisma_1.default.question.update({
            where: { id: questionId, userId },
            data: {},
        });
    }
    async unsaveResponse(questionId, userId) {
        await prisma_1.default.question.update({
            where: { id: questionId, userId },
            data: {},
        });
    }
}
exports.QuestionsService = QuestionsService;
//# sourceMappingURL=questions.service.js.map