/* eslint-env jest */
import { CitationService } from '../../modules/citations/citation.service';
import prisma from '../../config/prisma';

jest.mock('../../config/prisma', () => ({
  citation: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../jobs/queues', () => ({
  aiQueue: { add: jest.fn() },
}));

describe('CitationService', () => {
  let service: CitationService;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = prisma as jest.Mocked<typeof prisma>;
    service = new CitationService();
  });

  describe('searchCitations', () => {
    it('should search citations', async () => {
      mockPrisma.citation.findMany.mockResolvedValue([
        { id: 'c-1', title: 'Test Citation' },
      ]);

      const result = await service.searchCitations('test query');

      expect(result.citations).toHaveLength(1);
    });
  });

  describe('createCitation', () => {
    it('should create citation', async () => {
      mockPrisma.citation.create.mockResolvedValue({ id: 'c-1', title: 'Test' });

      const result = await service.createCitation({
        title: 'Test',
        source: 'PubMed',
      });

      expect(result?.title).toBe('Test');
    });
  });
});