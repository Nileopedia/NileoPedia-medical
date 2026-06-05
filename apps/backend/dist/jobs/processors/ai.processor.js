"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAiGeneration = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../../config/logger");
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
async function processAiGeneration(job) {
    const { questionId, query, userId, topK = 10, specialty } = job;
    try {
        const response = await axios_1.default.post(`${AI_SERVICE_URL}/generate`, {
            query,
            topK,
            specialty,
        });
        const { summary, citations, confidenceScore, keyFindings } = response.data;
        const aiResponse = await prisma_1.default.aIResponse.create({
            data: {
                questionId,
                summary,
                keyFindings: keyFindings || [],
                confidenceScore,
                generatedBy: 'GPT-4o',
            },
        });
        for (const citation of citations) {
            await prisma_1.default.citation.create({
                data: {
                    aiResponseId: aiResponse.id,
                    title: citation.title,
                    source: citation.source,
                    authors: citation.authors,
                    publicationYear: citation.publicationYear,
                    doi: citation.doi,
                    url: citation.url,
                    citationIndex: citations.indexOf(citation),
                },
            });
        }
        logger_1.logger.info(`AI generation completed for question: ${questionId}`);
        return { success: true, responseId: aiResponse.id };
    }
    catch (error) {
        logger_1.logger.error(`AI generation failed for question: ${questionId}`, error);
        throw error;
    }
}
exports.processAiGeneration = processAiGeneration;
//# sourceMappingURL=ai.processor.js.map