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
        // Emit initial status
        if (io) {
            io.to(`question-${questionId}`).emit('ai-status', {
                questionId,
                status: 'processing',
                message: 'Generating AI response...'
            });
        }
        const response = await axios_1.default.post(`${AI_SERVICE_URL}/generate`, {
            query,
            topK,
            specialty,
        });
        const { summary, citations, confidenceScore, keyFindings } = response.data;
        // Emit partial response (streaming chunks)
        if (io && keyFindings && keyFindings.length > 0) {
            for (let i = 0; i < keyFindings.length; i++) {
                io.to(`question-${questionId}`).emit('ai-key-findings', {
                    questionId,
                    keyFindings: keyFindings.slice(0, i + 1),
                    progress: Math.round((i + 1) / keyFindings.length * 100)
                });
                // Small delay to simulate streaming
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
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
        // Emit completion
        if (io) {
            io.to(`question-${questionId}`).emit('ai-response-complete', {
                questionId,
                responseId: aiResponse.id,
                status: 'completed'
            });
        }
        logger_1.logger.info(`AI generation completed for question: ${questionId}`);
        return { success: true, responseId: aiResponse.id };
    }
    catch (error) {
        // Emit error
        if (io) {
            io.to(`question-${questionId}`).emit('ai-error', {
                questionId,
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
        logger_1.logger.error(`AI generation failed for question: ${questionId}`, error);
        throw error;
    }
}
exports.processAiGeneration = processAiGeneration;
//# sourceMappingURL=ai.processor.js.map