/* eslint-env jest */
// Test environment configuration - ensures all external services are mocked
import { CONFIG } from '../../config/env';

// Override for test environment
(process.env as any).USE_MOCK_EMBEDDINGS = 'true';
(process.env as any).USE_MOCK_AI = 'false';
(process.env as any).PINECONE_API_KEY = '';

// Mock external services
jest.mock('node-fetch', () => jest.fn());
jest.mock('@xenova/transformers', () => ({
  pipeline: jest.fn().mockResolvedValue((text: string) => Array(384).fill(Math.random())),
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

export {};