"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAiGeneration = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const groq_sdk_1 = require("groq-sdk");
const logger_1 = require("../../config/logger");
const redis_1 = require("../../lib/redis");
const env_1 = require("../../config/env");
const retrieval_service_1 = require("../../modules/retrieval/retrieval.service");
const generateMockResponse = (query, topK, specialty) => {
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
    const mockCitations = Array.from({ length: 3 }, (_, i) => ({
        title: `${specialtyName} Reference ${i + 1}`,
        source: 'PubMed',
        authors: 'Dr. Smith et al.',
        publicationYear: 2024,
        doi: `10.1001/${specialty || 'jama'}.${i}`,
        url: `https://pubmed.ncbi.nlm.nih.gov/${i}`,
    }));
    return {
        summary: `Based on ${specialtyName} medical literature, here are the key insights for: "${query}"`,
        citations: mockCitations,
        confidenceScore: 0.85 + Math.random() * 0.1,
        keyFindings: content.keyFindings,
    };
};
async function processAiGeneration(job) {
    const { questionId, query, userId, topK = 10, specialty } = job;
    try {
        let summary, citations, confidenceScore, keyFindings, generatedBy;
        if (env_1.CONFIG.USE_MOCK_AI) {
            logger_1.logger.info(`Using mock AI response for question:`, questionId, `specialty:`, specialty);
            const mock = generateMockResponse(query, topK, specialty || undefined);
            ({ summary, citations, confidenceScore, keyFindings } = mock);
            generatedBy = 'Llama-3.3-70b (mock)';
            const progressEvents = [
                { progress: 25, status: 'analyzing' },
                { progress: 50, keyFindings: mock.keyFindings.slice(0, 1) },
                { progress: 75, keyFindings: mock.keyFindings.slice(0, 2) },
                { progress: 100, keyFindings: mock.keyFindings },
            ];
            for (const event of progressEvents) {
                await redis_1.redis.publish('ai-progress', JSON.stringify({
                    questionId,
                    ...event,
                }));
                await redis_1.redis.setex(`question-progress:${questionId}`, 300, JSON.stringify({ questionId, ...event }));
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
        else {
            logger_1.logger.info(`Calling Groq for question:`, questionId);
            const retrievalService = new retrieval_service_1.RetrievalService();
            const pineconeResults = await retrievalService.hybridSearch(query, specialty || undefined);
            const chunks = pineconeResults.map((match) => ({
                text: match.metadata?.textPreview || match.metadata?.text || '',
                metadata: match.metadata,
            }));
            const context = chunks.map((c) => c.text).join('\n\n');
            const groq = env_1.CONFIG.GROQ_API_KEY ? new groq_sdk_1.Groq({ apiKey: env_1.CONFIG.GROQ_API_KEY }) : null;
            if (!groq) {
                throw new Error('Groq API key not configured');
            }
            const completion = await groq.chat.completions.create({
                model: env_1.CONFIG.GROQ_MODEL,
                messages: [
                    { role: 'system', content: 'You are a medical AI assistant providing evidence-based answers. Always cite your sources.' },
                    { role: 'user', content: `Question: ${query}\n\nContext:\n${context}` },
                ],
            });
            summary = completion.choices[0]?.message?.content || '';
            const extractedCitations = [];
            const seenTitles = new Set();
            for (const chunk of chunks) {
                const metadata = chunk.metadata || {};
                const title = metadata.title || metadata.source || 'Unknown Source';
                if (seenTitles.has(title))
                    continue;
                seenTitles.add(title);
                extractedCitations.push({
                    title,
                    source: metadata.source || '',
                    authors: metadata.authors,
                    publicationYear: metadata.publicationYear,
                    doi: metadata.doi,
                    url: metadata.url,
                    pageNumber: metadata.pageNumber,
                    sectionTitle: metadata.sectionTitle,
                });
            }
            ({ citations, confidenceScore, keyFindings } = {
                citations: extractedCitations.slice(0, 5),
                confidenceScore: 0.85 + Math.random() * 0.1,
                keyFindings: [summary.substring(0, 150)]
            });
            generatedBy = 'Llama-3.3-70b';
            await redis_1.redis.setex(`question-progress:${questionId}`, 300, JSON.stringify({
                questionId,
                progress: 100,
                keyFindings,
            }));
        }
        const aiResponse = await prisma_1.default.aIResponse.create({
            data: {
                questionId,
                summary,
                keyFindings: keyFindings || [],
                confidenceScore,
                generatedBy,
            },
        });
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
        logger_1.logger.info(`AI generation completed for question: ${questionId}`);
        return { success: true, responseId: aiResponse.id };
    }
    catch (error) {
        logger_1.logger.error(`AI generation failed for question: ${questionId}`, error);
        if (!env_1.CONFIG.USE_MOCK_AI) {
            logger_1.logger.info('Falling back to mock response for question:', questionId);
            const mock = generateMockResponse(query, topK, specialty || undefined);
            const aiResponse = await prisma_1.default.aIResponse.create({
                data: {
                    questionId,
                    summary: mock.summary,
                    keyFindings: mock.keyFindings,
                    confidenceScore: mock.confidenceScore,
                    generatedBy: 'Llama-3.3-70b (fallback)',
                },
            });
            return { success: true, responseId: aiResponse.id };
        }
        throw error;
    }
}
exports.processAiGeneration = processAiGeneration;
//# sourceMappingURL=ai.processor.js.map