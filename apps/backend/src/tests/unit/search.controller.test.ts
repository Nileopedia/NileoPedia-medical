/* eslint-env jest */
import { Request, Response, NextFunction } from 'express';

jest.mock('../../config/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() },
}));

describe('SearchController', () => {
  let controller: any;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock service
    const mockService = {
      globalSearch: jest.fn().mockResolvedValue({
        documents: [], total: 0, page: 1, limit: 20, totalPages: 0,
      }),
      semanticSearch: jest.fn().mockResolvedValue([]),
      keywordSearch: jest.fn().mockResolvedValue([]),
      hybridSearch: jest.fn().mockResolvedValue([]),
      searchDocuments: jest.fn().mockResolvedValue({ documents: [], total: 0 }),
      searchCitations: jest.fn().mockResolvedValue({ citations: [], total: 0 }),
    };

    // Mock SearchService constructor
    jest.mock('../../modules/search/search.service', () => ({
      SearchService: jest.fn().mockImplementation(() => mockService),
    }));

    jest.mock('../../modules/search/search.validation', () => ({
      searchQuerySchema: { parse: jest.fn((input) => input) },
      semanticSearchSchema: { parse: jest.fn((input) => input) },
      keywordSearchSchema: { parse: jest.fn((input) => input) },
    }));

    mockRequest = { query: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should have globalSearch method', () => {
    const { SearchController } = require('../../modules/search/search.controller');
    expect(typeof (new SearchController()).globalSearch).toBe('function');
  });

  it('should have semanticSearch method', () => {
    const { SearchController } = require('../../modules/search/search.controller');
    expect(typeof (new SearchController()).semanticSearch).toBe('function');
  });

  it('should have keywordSearch method', () => {
    const { SearchController } = require('../../modules/search/search.controller');
    expect(typeof (new SearchController()).keywordSearch).toBe('function');
  });
});
