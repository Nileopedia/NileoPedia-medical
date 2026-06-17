/* eslint-env jest */
import { ChunkingService } from '../../modules/rag/services/chunking.service';

describe('ChunkingService', () => {
  let service: ChunkingService;

  beforeEach(() => {
    service = new ChunkingService();
  });

  describe('chunkDocument', () => {
    it('should chunk text into segments', () => {
      const text = 'This is a test document. It has multiple sentences. We need to split it.';
      const chunks = service.chunkDocument(text);
      
      expect(Array.isArray(chunks)).toBe(true);
      expect(chunks.length).toBeGreaterThan(0);
    });

    it('should handle empty text', () => {
      const chunks = service.chunkDocument('');
      expect(chunks).toHaveLength(0);
    });

    it('should split long text into multiple chunks', () => {
      const text = 'Test '.repeat(500);
      const chunks = service.chunkDocument(text);
      
      expect(chunks.length).toBeGreaterThan(1);
    });
  });
});