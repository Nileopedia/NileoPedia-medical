"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Override for test environment
process.env.USE_MOCK_EMBEDDINGS = 'true';
process.env.USE_MOCK_AI = 'false';
process.env.PINECONE_API_KEY = '';
// Mock external services
jest.mock('node-fetch', () => jest.fn());
jest.mock('@xenova/transformers', () => ({
    pipeline: jest.fn().mockResolvedValue((text) => Array(384).fill(Math.random())),
}));
jest.mock('groq-sdk', () => ({
    Groq: jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: 'Mock response' } }],
                }),
            },
        },
    })),
}));
jest.mock('@pinecone-database/pinecone', () => ({
    Pinecone: jest.fn().mockImplementation(() => ({
        index: jest.fn().mockReturnValue({
            upsert: jest.fn().mockResolvedValue({ upsertedCount: 1 }),
            query: jest.fn().mockResolvedValue({ matches: [] }),
            delete: jest.fn().mockResolvedValue({}),
        }),
    })),
}));
//# sourceMappingURL=test-env.js.map