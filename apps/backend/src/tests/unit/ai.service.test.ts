/* eslint-env jest */
import { AIService } from '../../modules/ai/services/ai.service';
import { CONFIG } from '../../config/env';

// Mock the Groq SDK
const mockCreate = jest.fn();
jest.mock('groq-sdk', () => {
  return {
    Groq: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
  };
});

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateResponse', () => {
    it('should throw error when Groq unavailable', async () => {
      // Temporarily remove the Groq API key
      const originalApiKey = CONFIG.GROQ_API_KEY;
      Object.defineProperty(CONFIG, 'GROQ_API_KEY', { value: undefined, writable: true, configurable: true });

      const service = new AIService();
      const chunks = [{ text: 'Diabetes is a metabolic disorder', metadata: { title: 'Diabetes Guide', source: 'PubMed' } }];

      await expect(service.generateResponse('What is diabetes?', chunks)).rejects.toThrow('Groq API unavailable');

      // Restore the API key
      Object.defineProperty(CONFIG, 'GROQ_API_KEY', { value: originalApiKey, writable: true, configurable: true });
    });

    it('should return real summary with real citations when Groq configured', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'Real medical summary content' } }],
      });

      const service = new AIService();
      const chunks = [
        { text: 'Diabetes is a metabolic disorder', metadata: { title: 'Diabetes Guide', source: 'PubMed', authors: 'Dr. Smith' } },
      ];

      const result = await service.generateResponse('What is diabetes?', chunks);

      expect(result.summary).toBe('Real medical summary content');
      expect(result.citations.length).toBeGreaterThan(0);
      expect(result.citations[0].title).toBe('Diabetes Guide');
    });

    it('should generate citations from chunks', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'Test summary' } }],
      });

      const service = new AIService();
      const chunks = [
        { text: 'Content', metadata: { title: 'My Paper', authors: 'Dr. Jones', publicationYear: 2023 } },
      ];

      const result = await service.generateResponse('Question', chunks);

      expect(result.citations.length).toBeGreaterThan(0);
      expect(result.citations[0]).toHaveProperty('title');
      expect(result.citations[0]).toHaveProperty('source');
    });
  });
});