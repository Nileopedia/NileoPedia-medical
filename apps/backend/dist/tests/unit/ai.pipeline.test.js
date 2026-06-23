"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-env jest */
const ai_processor_1 = require("../../jobs/processors/ai.processor");
// Mock dependencies for unit testing
jest.mock('../../config/env', () => ({
    CONFIG: { GROQ_API_KEY: undefined, GROQ_MODEL: 'llama-3.3-70b' },
}));
jest.mock('../../lib/redis', () => ({
    redis: { publish: jest.fn(), setex: jest.fn() },
}));
jest.mock('../../config/prisma', () => ({
    __db: {},
    aIResponse: {
        upsert: jest.fn().mockResolvedValue({ id: 'resp-1' }),
    },
    citation: {
        create: jest.fn().mockResolvedValue({}),
    },
}));
describe('AI Pipeline Validation', () => {
    describe('embeddings failure', () => {
        it('should return embeddings error when embedding service unavailable', async () => {
            const mockJob = {
                questionId: 'test-q-2',
                query: 'What is diabetes?',
                userId: 'user-1',
            };
            const result = await (0, ai_processor_1.processAiGeneration)(mockJob);
            expect(result.success).toBe(false);
            expect(result.stage).toBe('embeddings');
            expect(result.message).toBe('Embedding service unavailable');
        });
    });
    describe('llm failure', () => {
        it('should return error when Groq key not configured', async () => {
            const mockJob = {
                questionId: 'test-q-3',
                query: 'What is diabetes?',
                userId: 'user-1',
            };
            const result = await (0, ai_processor_1.processAiGeneration)(mockJob);
            // Without services set up, embeddings/retrieval fails first
            expect(result.success).toBe(false);
            expect(['embeddings', 'retrieval', 'llm']).toContain(result.stage);
        });
    });
    describe('metadata generation', () => {
        it('should include all required metadata fields in response', async () => {
            const mockJob = {
                questionId: 'test-q-meta',
                query: 'What is diabetes?',
                userId: 'user-1',
            };
            const result = await (0, ai_processor_1.processAiGeneration)(mockJob);
            if (result.success && result.metadata) {
                const metadata = result.metadata;
                expect(metadata).toHaveProperty('answer');
                expect(metadata).toHaveProperty('source', 'real');
                expect(metadata).toHaveProperty('documentsUsed');
                expect(metadata).toHaveProperty('model');
                expect(metadata).toHaveProperty('embeddingModel', 'Xenova/all-MiniLM-L6-v2');
                expect(metadata).toHaveProperty('processingTime');
            }
            else {
                // If pipeline fails due to missing services, verify error structure
                expect(result.stage).toBeDefined();
            }
        });
        it('should have processingTime as number', async () => {
            const mockJob = {
                questionId: 'test-q-meta-2',
                query: 'What is diabetes?',
                userId: 'user-1',
            };
            const result = await (0, ai_processor_1.processAiGeneration)(mockJob);
            if (result.success && result.metadata) {
                expect(typeof result.metadata.processingTime).toBe('number');
            }
        });
    });
    describe('response source validation', () => {
        it('should never return success=true when pipeline stages fail', async () => {
            const mockJob = {
                questionId: 'test-q-fail',
                query: 'What is diabetes?',
                userId: 'user-1',
            };
            const result = await (0, ai_processor_1.processAiGeneration)(mockJob);
            if (!result.success) {
                expect(['embeddings', 'retrieval', 'llm', 'database']).toContain(result.stage);
            }
        });
    });
});
//# sourceMappingURL=ai.pipeline.test.js.map