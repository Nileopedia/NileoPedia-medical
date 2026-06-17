/* eslint-env jest */
import { searchQuerySchema } from '../../modules/search/search.validation';
import { registerSchema, loginSchema } from '../../modules/auth/validators/auth.validation';

describe('API Routes Integration', () => {
  describe('Search validation', () => {
    it('should validate search query with q parameter', () => {
      const result = searchQuerySchema.parse({ q: 'test query' });
      expect(result.q).toBe('test query');
    });

    it('should validate search with all parameters', () => {
      const result = searchQuerySchema.parse({
        q: 'diabetes',
        type: 'semantic',
        limit: '10',
        page: '1',
      });
      expect(result.q).toBe('diabetes');
    });

    it('should default type to hybrid', () => {
      const result = searchQuerySchema.parse({ q: 'test' });
      expect(result.type).toBe('hybrid');
    });
  });

  describe('Auth validation', () => {
    it('should validate registration schema', () => {
      const result = registerSchema.parse({
        email: 'test@test.com',
        password: 'Password123!',
        fullName: 'Test User',
        role: 'MEDICAL_USER',
      });
      expect(result.email).toBe('test@test.com');
    });

    it('should validate login schema', () => {
      const result = loginSchema.parse({
        email: 'test@test.com',
        password: 'Password123',
      });
      expect(result.email).toBe('test@test.com');
    });
  });
});