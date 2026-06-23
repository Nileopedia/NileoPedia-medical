"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionsService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const queues_1 = require("../../../jobs/queues");
const logger_1 = require("../../../config/logger");
function generateMockAiResponse(questionText, specialty) {
    const specialtyContent = {
        cardiology: {
            keywords: ['heart', 'cardiac', 'cardiovascular'],
            keyFindings: [
                'Cardiology finding 1: ACE inhibitors improve cardiac function',
                'Cardiology finding 2: Beta-blockers reduce mortality post-MI',
                'Cardiology finding 3: Statins provide cardiovascular protection',
            ],
        },
        endocrinology: {
            keywords: ['diabetes', 'hormone', 'endocrine'],
            keyFindings: [
                'Endocrinology finding 1: Metformin is first-line for T2DM',
                'Endocrinology finding 2: GLP-1 agonists provide cardiovascular benefit',
                'Endocrinology finding 3: HbA1c target <7% for most patients',
            ],
        },
        oncology: {
            keywords: ['cancer', 'tumor', 'malignant'],
            keyFindings: [
                'Oncology finding 1: Immunotherapy improves survival in certain cancers',
                'Oncology finding 2: Precision oncology targets specific mutations',
                'Oncology finding 3: Multimodal treatment shows best outcomes',
            ],
        },
        neurology: {
            keywords: ['brain', 'neurological', 'nerve'],
            keyFindings: [
                'Neurology finding 1: Cholinesterase inhibitors improve cognition',
                'Neurology finding 2: Mechanical thrombectomy within 24 hours',
                'Neurology finding 3: Disease-modifying therapies in development',
            ],
        },
        gastroenterology: {
            keywords: ['liver', 'intestine', 'digestive'],
            keyFindings: [
                'Gastroenterology finding 1: H. pylori eradication prevents ulcers',
                'Gastroenterology finding 2: Anti-TNF agents for IBD',
                'Gastroenterology finding 3: Colonoscopy screening reduces CRC',
            ],
        },
        general: {
            keywords: [],
            keyFindings: [
                'Key finding 1: Relevant medical information identified',
                'Key finding 2: Evidence-based recommendations available',
                'Key finding 3: Clinical guidelines referenced',
            ],
        },
    };
    const content = specialtyContent[specialty || 'general'] || specialtyContent.general;
    const specialtyName = specialty ? specialty.charAt(0).toUpperCase() + specialty.slice(1).toLowerCase() : 'General';
    return {
        summary: `Based on ${specialtyName} medical literature, here are the key insights for: "${questionText}"`,
        keyFindings: content.keyFindings,
        confidenceScore: 0.85 + Math.random() * 0.1,
        generatedBy: 'Llama-3.3-70b (mock)',
        citations: Array.from({ length: 3 }, (_, i) => ({
            aiResponseId: '',
            title: `${specialtyName} Reference ${i + 1}`,
            source: 'PubMed',
            authors: 'Dr. Smith et al.',
            publicationYear: 2024,
            doi: `10.1001/${specialty || 'jama'}.${i}`,
            url: `https://pubmed.ncbi.nlm.nih.gov/${i}`,
            citationIndex: i,
        })),
    };
}
class QuestionsService {
    async askQuestion(userId, questionText, specialty) {
        try {
            const question = await prisma_1.default.question.create({
                data: { userId, questionText },
            });
            // Check if queue is available
            const queueAvailable = queues_1.aiQueue && typeof queues_1.aiQueue.add === 'function';
            if (queueAvailable) {
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
                    logger_1.logger.warn('Queue add failed, generating mock response:', queueError?.message);
                    await this.generateMockResponse(question.id, questionText, specialty);
                }
            }
            else {
                // Generate mock response immediately when queue unavailable
                logger_1.logger.warn('Queue unavailable, generating mock AI response immediately');
                await this.generateMockResponse(question.id, questionText, specialty);
            }
            return {
                questionId: question.id,
                status: 'processing',
                message: 'Question submitted for processing',
            };
        }
        catch (error) {
            logger_1.logger.error('Error in askQuestion:', error);
            throw error;
        }
    }
    async generateMockResponse(questionId, questionText, specialty) {
        const mock = generateMockAiResponse(questionText, specialty);
        const aiResponse = await prisma_1.default.aIResponse.upsert({
            where: { questionId },
            create: {
                questionId,
                summary: mock.summary,
                keyFindings: mock.keyFindings || [],
                confidenceScore: mock.confidenceScore,
                generatedBy: mock.generatedBy,
            },
            update: {
                summary: mock.summary,
                keyFindings: mock.keyFindings || [],
                confidenceScore: mock.confidenceScore,
                generatedBy: mock.generatedBy,
            },
        });
        for (let i = 0; i < (mock.citations?.length || 0); i++) {
            const citation = mock.citations[i];
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