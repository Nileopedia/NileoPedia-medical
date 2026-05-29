import request from 'supertest';
import { app } from '../../app';
import { generateTestJWT, createTestUser } from '../helpers/test.helpers';
import prisma from '../../config/prisma';

describe('E2E: Complete User Workflow', () => {
  const testEmail = `e2e-${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Clean database
    await prisma.notification.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  it('should complete full user flow: login -> query -> search', async () => {
    // Step 1: Register user
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'E2E Test User',
        email: testEmail,
        password: testPassword,
        role: 'MEDICAL_USER',
      });

    expect(registerResponse.status).toBe(201);
    userId = registerResponse.body.data.user.id;

    // Step 2: Login
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(loginResponse.status).toBe(200);
    authToken = loginResponse.body.data.accessToken;

    // Step 3: Get profile
    const profileResponse = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.success).toBe(true);

    // Step 4: Perform search
    const searchResponse = await request(app)
      .get('/api/v1/search?q=diabetes&type=hybrid')
      .set('Authorization', `Bearer ${authToken}`);

    expect(searchResponse.status).toBe(200);
    expect(searchResponse.body.data.searchType).toBe('hybrid');

    // Step 5: Get documents
    const documentsResponse = await request(app)
      .get('/api/v1/documents')
      .set('Authorization', `Bearer ${authToken}`);

    expect(documentsResponse.status).toBe(200);
  });
});