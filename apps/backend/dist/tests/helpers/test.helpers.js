"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupDatabase = exports.createAuthHeader = exports.createTestMedicalUser = exports.createTestValidator = exports.createTestAdmin = exports.createTestUser = exports.generateTestJWT = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../../config/prisma"));
const generateTestJWT = (payload) => {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_ACCESS_SECRET || 'test-access-secret-key', {
        expiresIn: '15m',
    });
};
exports.generateTestJWT = generateTestJWT;
const createTestUser = async (data) => {
    const user = await prisma_1.default.user.create({
        data: {
            email: data.email || `test-${Date.now()}@example.com`,
            fullName: data.fullName || 'Test User',
            role: data.role || 'MEDICAL_USER',
            password: data.password || '$2a$10$testhashedpassword',
            accountStatus: client_1.AccountStatus.ACTIVE,
        },
    });
    return user;
};
exports.createTestUser = createTestUser;
const createTestAdmin = async () => {
    return (0, exports.createTestUser)({ role: 'ADMIN' });
};
exports.createTestAdmin = createTestAdmin;
const createTestValidator = async () => {
    return (0, exports.createTestUser)({ role: 'VALIDATOR' });
};
exports.createTestValidator = createTestValidator;
const createTestMedicalUser = async () => {
    return (0, exports.createTestUser)({ role: 'MEDICAL_USER' });
};
exports.createTestMedicalUser = createTestMedicalUser;
const createAuthHeader = (token) => ({
    Authorization: `Bearer ${token}`,
});
exports.createAuthHeader = createAuthHeader;
const cleanupDatabase = async () => {
    await prisma_1.default.notification.deleteMany({});
    await prisma_1.default.auditLog.deleteMany({});
    await prisma_1.default.citation.deleteMany({});
    await prisma_1.default.aIResponse.deleteMany({});
    await prisma_1.default.question.deleteMany({});
    await prisma_1.default.embeddingMetadata.deleteMany({});
    await prisma_1.default.medicalDocument.deleteMany({});
    await prisma_1.default.session.deleteMany({});
    await prisma_1.default.user.deleteMany({});
};
exports.cleanupDatabase = cleanupDatabase;
jest.mock('../../config/prisma', () => require('../mocks/services.mock').mockPrismaClient);
//# sourceMappingURL=test.helpers.js.map