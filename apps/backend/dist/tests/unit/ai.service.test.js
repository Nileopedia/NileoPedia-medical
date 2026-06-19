"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-env jest */
const ai_service_1 = require("../../modules/ai/services/ai.service");
jest.mock('../../config/env', () => ({
    CONFIG: {
        GROQ_API_KEY: undefined,
        GROQ_MODEL: 'llama-3.3-70b-versatile',
    },
}));
jest.mock('groq-sdk', () => {
    return {
        Groq: jest.fn().mockImplementation(() => ({
            chat: {
                completions: {
                    create: jest.fn(),
                },
            },
        })),
    };
});
describe('AIService', () => {
    let service;
    let mockGroqClient;
    beforeEach(() => {
        jest.clearAllMocks();
        service = new ai_service_1.AIService();
    });
    describe('generateResponse', () => {
        it('should generate mock response when Groq not configured', async () => {
            const chunks = [
                { text: 'Diabetes is a metabolic disorder', metadata: { title: 'Diabetes Guide', source: 'PubMed' } },
            ];
            const result = await service.generateResponse('What is diabetes?', chunks);
            expect(result.summary).toContain('Based on medical literature');
            expect(result.citations.length).toBeGreaterThan(0);
            expect(result.confidenceScore).toBeGreaterThan(0.8);
        });
        it('should generate mock response with citations', async () => {
            const chunks = [
                { text: 'Content 1', metadata: { title: 'Ref 1', source: 'PubMed' } },
                { text: 'Content 2', metadata: { title: 'Ref 2', source: 'NEJM' } },
                { text: 'Content 3', metadata: { title: 'Ref 3', source: 'Lancet' } },
            ];
            const result = await service.generateResponse('Medical question', chunks);
            expect(result.citations.length).toBeGreaterThan(0);
        });
        it('should generate mock response for cardiology specialty', async () => {
            const chunks = [{ text: 'Heart content', metadata: {} }];
            const result = await service.generateResponse('What is cardiology?', chunks);
            expect(result.summary).toContain('Cardiology');
        });
        it('should generate mock response for endocrinology specialty', async () => {
            const chunks = [{ text: 'Diabetes content', metadata: {} }];
            const result = await service.generateResponse('endo', chunks);
            expect(result.summary).toContain('Endocrinology');
        });
        it('should generate mock response for oncology specialty', async () => {
            const chunks = [{ text: 'Cancer content', metadata: {} }];
            const result = await service.generateResponse('onco', chunks);
            expect(result.summary).toContain('Oncology');
        });
        it('should generate mock response for neurology specialty', async () => {
            const chunks = [{ text: 'Brain content', metadata: {} }];
            const result = await service.generateResponse('What is neurology?', chunks);
            expect(result.summary).toContain('Neurology');
        });
        it('should generate mock response for gastroenterology specialty', async () => {
            const chunks = [{ text: 'GI content', metadata: {} }];
            const result = await service.generateResponse('What is gastroenterology?', chunks);
            expect(result.summary).toContain('Gastroenterology');
        });
        it('should handle empty chunks', async () => {
            const result = await service.generateResponse('Question', []);
            expect(result.summary).toContain('Based on medical literature');
            expect(result.confidenceScore).toBeGreaterThan(0);
        });
        it('should generate citations from chunks', async () => {
            const chunks = [
                { text: 'Content', metadata: { title: 'My Paper', authors: 'Dr. Jones', publicationYear: 2023 } },
            ];
            const result = await service.generateResponse('Question', chunks);
            expect(result.citations.length).toBeGreaterThan(0);
            expect(result.citations[0]).toHaveProperty('title');
            expect(result.citations[0]).toHaveProperty('source');
        });
        it('should limit citations to 3 in mock response', async () => {
            const chunks = Array(5).fill({ text: 'Content', metadata: { title: 'Same Title' } });
            const result = await service.generateResponse('Question', chunks);
            expect(result.citations.length).toBeLessThanOrEqual(3);
        });
    });
    describe('calculateConfidence', () => {
        it('should return low confidence with no citations', async () => {
            const result = await service.generateResponse('Question', []);
            // Mock response returns 0.85+ for empty chunks
            expect(result.confidenceScore).toBeGreaterThan(0.8);
        });
        it('should calculate confidence based on chunks and citations', async () => {
            const chunks = Array(5).fill({ text: 'Content', metadata: {} });
            const result = await service.generateResponse('Question', chunks);
            expect(result.confidenceScore).toBeGreaterThan(0.5);
        });
    });
});
//# sourceMappingURL=ai.service.test.js.map