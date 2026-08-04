"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../../app");
const prisma_1 = __importDefault(require("../../config/prisma"));
describe('E2E: Complete User Workflow', () => {
    const testEmail = `e2e-${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    let authToken;
    let userId;
    beforeAll(async () => {
        // Clean database
        await prisma_1.default.notification.deleteMany({});
        await prisma_1.default.auditLog.deleteMany({});
        await prisma_1.default.session.deleteMany({});
        await prisma_1.default.user.deleteMany({});
    });
    afterAll(async () => {
        await prisma_1.default.notification.deleteMany({});
        await prisma_1.default.auditLog.deleteMany({});
        await prisma_1.default.session.deleteMany({});
        await prisma_1.default.user.deleteMany({});
        await prisma_1.default.$disconnect();
    });
    it('should complete full user flow: login -> query -> search', async () => {
        // Step 1: Register user
        const registerResponse = await (0, supertest_1.default)(app_1.app)
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
        const loginResponse = await (0, supertest_1.default)(app_1.app)
            .post('/api/v1/auth/login')
            .send({ email: testEmail, password: testPassword });
        expect(loginResponse.status).toBe(200);
        authToken = loginResponse.body.data.accessToken;
        // Step 3: Get profile
        const profileResponse = await (0, supertest_1.default)(app_1.app)
            .get('/api/v1/users/me')
            .set('Authorization', `Bearer ${authToken}`);
        expect(profileResponse.status).toBe(200);
        expect(profileResponse.body.success).toBe(true);
        // Step 4: Perform search
        const searchResponse = await (0, supertest_1.default)(app_1.app)
            .get('/api/v1/search?q=diabetes&type=hybrid')
            .set('Authorization', `Bearer ${authToken}`);
        expect(searchResponse.status).toBe(200);
        expect(searchResponse.body.data.searchType).toBe('hybrid');
        // Step 5: Get documents
        const documentsResponse = await (0, supertest_1.default)(app_1.app)
            .get('/api/v1/documents')
            .set('Authorization', `Bearer ${authToken}`);
        expect(documentsResponse.status).toBe(200);
    });
});
//# sourceMappingURL=user.workflow.e2e.js.map