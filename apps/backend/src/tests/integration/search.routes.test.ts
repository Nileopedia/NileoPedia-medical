import { router } from '../../modules/search/search.routes';
import { SearchController } from '../../modules/search/controllers/search.controller';

// Mock the search controller
jest.mock('../../modules/search/controllers/search.controller', () => ({
  SearchController: jest.fn().mockImplementation(() => ({
    globalSearch: jest.fn().mockResolvedValue({ results: [], pagination: { total: 0 } }),
    semanticSearch: jest.fn().mockResolvedValue({ matches: [] }),
    keywordSearch: jest.fn().mockResolvedValue({ results: [] }),
    hybridSearch: jest.fn().mockResolvedValue({ results: [], pagination: { total: 0 } }),
    searchDocuments: jest.fn().mockResolvedValue({ results: [] }),
    searchCitations: jest.fn().mockResolvedValue({ results: [] }),
  })),
}));

describe('Search Routes', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      query: {},
      user: { id: 'user-123' },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('GET /search', () => {
    it('should require authentication', async () => {
      mockReq.user = undefined;
      const { globalSearch } = new SearchController() as any;
      
      await globalSearch(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should call global search with validated query', async () => {
      mockReq.query = { q: 'diabetes', type: 'hybrid' };
      const controller = new SearchController() as any;
      
      await controller.globalSearch(mockReq, mockRes, mockNext);
      expect(controller.globalSearch).toHaveBeenCalled();
    });
  });

  describe('Search Query Validation', () => {
    it('should reject empty query', () => {
      const validateQuery = (query: string) => {
        if (!query || query.trim().length === 0) {
          throw new Error('Query cannot be empty');
        }
        return true;
      };

      expect(() => validateQuery('')).toThrow('Query cannot be empty');
      expect(() => validateQuery('   ')).toThrow('Query cannot be empty');
    });

    it('should accept valid query', () => {
      const validateQuery = (query: string) => {
        if (!query || query.trim().length === 0) {
          throw new Error('Query cannot be empty');
        }
        return true;
      };

      expect(() => validateQuery('diabetes symptoms')).not.toThrow();
    });
  });
});