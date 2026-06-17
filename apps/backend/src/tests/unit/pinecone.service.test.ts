/* eslint-env jest */
import { PineconeService } from '../../modules/rag/services/pinecone.service';

jest.mock('@pinecone-database/pinecone', () => ({
  Pinecone: jest.fn(),
}));

jest.mock('../../config/env', () => ({
  CONFIG: {
    PINECONE_API_KEY: undefined,
    PINECONE_INDEX_NAME: 'test-index',
  },
}));

describe('PineconeService', () => {
  it('should be instantiable', () => {
    expect(() => new PineconeService()).not.toThrow();
  });

  it('should have upsert method', () => {
    const service = new PineconeService();
    expect(typeof service.upsert).toBe('function');
  });

  it('should have query method', () => {
    const service = new PineconeService();
    expect(typeof service.query).toBe('function');
  });
});