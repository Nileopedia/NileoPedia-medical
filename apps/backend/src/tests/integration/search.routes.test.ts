import request from 'supertest';
import { app } from '../../app';
import prisma from '../../config/prisma';
import { generateTestJWT, createTestUser } from '../helpers/test.helpers';
import { UserRole } from '@prisma/client';

describe('Search Routes', () => {
  const authToken = generateTestJWT({ id: 'test-user-id', email: 'test@example.com', role: 'MEDICAL_USER' });

  describe('GET /api/v1/search', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/api/v1/search?q=diabetes');
      expect(response.status).toBe(401);
    });

    it('should return search results with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/search?q=diabetes&type=hybrid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('query');
      expect(response.body.data).toHaveProperty('results');
      expect(response.body.data).toHaveProperty('searchType');
    });

    it('should validate query parameter', async () => {
      const response = await request(app)
        .get('/api/v1/search')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/search/semantic', () => {
    it('should return semantic search results', async () => {
      const response = await request(app)
        .get('/api/v1/search/semantic?q=diabetes&topK=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/search/documents', () => {
    it('should return document search results', async () => {
      const response = await request(app)
        .get('/api/v1/search/documents?q=diabetes&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});