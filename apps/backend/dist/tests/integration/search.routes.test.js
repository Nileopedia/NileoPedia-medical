"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../../app");
const test_helpers_1 = require("../helpers/test.helpers");
describe('Search Routes', () => {
    const authToken = (0, test_helpers_1.generateTestJWT)({ id: 'test-user-id', email: 'test@example.com', role: 'MEDICAL_USER' });
    describe('GET /api/v1/search', () => {
        it('should require authentication', async () => {
            const response = await (0, supertest_1.default)(app_1.app).get('/api/v1/search?q=diabetes');
            expect(response.status).toBe(401);
        });
        it('should return search results with valid token', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/api/v1/search?q=diabetes&type=hybrid')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('query');
            expect(response.body.data).toHaveProperty('results');
            expect(response.body.data).toHaveProperty('searchType');
        });
        it('should validate query parameter', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/api/v1/search')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(400);
        });
    });
    describe('GET /api/v1/search/semantic', () => {
        it('should return semantic search results', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/api/v1/search/semantic?q=diabetes&topK=5')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
    describe('GET /api/v1/search/documents', () => {
        it('should return document search results', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/api/v1/search/documents?q=diabetes&limit=10')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
//# sourceMappingURL=search.routes.test.js.map