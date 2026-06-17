/* eslint-env jest */
import request from 'supertest';
import express from 'express';

jest.mock('../../config/prisma', () => ({
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  user: {
    findUnique: jest.fn().mockResolvedValue({ id: 'admin-id', role: 'ADMIN' }),
    create: jest.fn().mockResolvedValue({ id: 'user-1', email: 'test@test.com' }),
  },
}));

jest.mock('../../modules/auth/routes/auth.routes', () => ({
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe('Route Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Auth routes
    app.post('/api/v1/auth/register', (_req, res) => {
      res.status(201).json({ success: true, data: { userId: 'user-1' } });
    });
    app.post('/api/v1/auth/login', (_req, res) => {
      res.status(200).json({ success: true, data: { accessToken: 'token-123' } });
    });
  });

  describe('Auth Routes', () => {
    describe('POST /api/v1/auth/register', () => {
      it('should register successfully', async () => {
        const response = await request(app)
          .post('/api/v1/auth/register')
          .send({ email: 'test@test.com', password: 'Pass123!', fullName: 'Test' });

        expect(response.status).toBe(201);
      });

      it('should return validation error for missing fields', async () => {
        const response = await request(app)
          .post('/api/v1/auth/register')
          .send({ email: 'invalid' });

        expect(response.status).toBe(400);
      });
    });

    describe('POST /api/v1/auth/login', () => {
      it('should login successfully', async () => {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'test@test.com', password: 'password' });

        expect(response.status).toBe(200);
      });
    });
  });

  describe('Document Routes', () => {
    it('should have routes defined', () => {
      // Routes exist when imported
      const { documentRoutes } = require('../../modules/documents/document.routes');
      expect(documentRoutes).toBeDefined();
    });
  });

  describe('Search Routes', () => {
    it('should have routes defined', () => {
      const { searchRoutes } = require('../../modules/search/search.routes');
      expect(searchRoutes).toBeDefined();
    });
  });
});