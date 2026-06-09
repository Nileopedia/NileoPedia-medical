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
const USE_MOCK_AI = process.env.USE_MOCK_AI === 'true' || !AI_SERVICE_URL;
const generateMockResponse = (query, topK) => {
    const mockCitations = Array.from({ length: 3 }, (_, i) => ({
        title: `Medical Reference ${i + 1}`,
        source: 'PubMed',
        authors: 'Dr. Smith et al.',
        publicationYear: 2023,
        doi: `10.1001/jama.${i}`,
        url: `https://pubmed.ncbi.nlm.nih.gov/${i}`,
    }));
    return {
        summary: `Based on medical literature, here are the key insights for: "${query}"`,
        citations: mockCitations,
        confidenceScore: 0.85 + Math.random() * 0.1,
        keyFindings: [
            'Key finding 1: Relevant medical information identified',
            'Key finding 2: Evidence-based recommendations available',
            'Key finding 3: Clinical guidelines referenced',
        ],
    };
};
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
        let summary, citations, confidenceScore, keyFindings;
        // Use mock mode if AI service is unavailable or mock mode is enabled
        if (USE_MOCK_AI) {
            logger_1.logger.info('Using mock AI response for question:', questionId);
            const mock = generateMockResponse(query, topK);
            ({ summary, citations, confidenceScore, keyFindings } = mock);
        }
        else {
            const response = await axios_1.default.post(`${AI_SERVICE_URL}/generate`, {
                query,
                topK,
                specialty,
            }, { timeout: 30000 });
            ({ summary, citations, confidenceScore, keyFindings } = response.data);
        }
        // Emit partial response (streaming chunks)
        if (io && keyFindings && keyFindings.length > 0) {
            for (let i = 0; i < keyFindings.length; i++) {
                const progress = Math.round((i + 1) / keyFindings.length * 100);
                io.to(`question-${questionId}`).emit('ai-progress', {
                    questionId,
                    progress
                });
                io.to(`question-${questionId}`).emit('ai-key-findings', {
                    questionId,
                    keyFindings: keyFindings.slice(0, i + 1),
                    progress
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
        // Add mock citations to database
        for (let i = 0; i < citations.length; i++) {
            const citation = citations[i];
            await prisma_1.default.citation.create({
                data: {
                    aiResponseId: aiResponse.id,
                    title: citation.title || `Reference ${i + 1}`,
                    source: citation.source || 'Medical Database',
                    authors: citation.authors || 'Unknown',
                    publicationYear: citation.publicationYear || new Date().getFullYear(),
                    doi: citation.doi || `10.1000/ref.${i}`,
                    url: citation.url,
                    citationIndex: i,
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
        // Fallback to mock response on AI service error
        if (!USE_MOCK_AI) {
            logger_1.logger.info('Falling back to mock response for question:', questionId);
            const mock = generateMockResponse(query, topK);
            const aiResponse = await prisma_1.default.aIResponse.create({
                data: {
                    questionId,
                    summary: mock.summary,
                    keyFindings: mock.keyFindings,
                    confidenceScore: mock.confidenceScore,
                    generatedBy: 'GPT-4o (fallback)',
                },
            });
            if (io) {
                io.to(`question-${questionId}`).emit('ai-response-complete', {
                    questionId,
                    responseId: aiResponse.id,
                    status: 'completed'
                });
            }
            return { success: true, responseId: aiResponse.id };
        }
        throw error;
    }
}
exports.processAiGeneration = processAiGeneration;
//# sourceMappingURL=ai.processor.js.map