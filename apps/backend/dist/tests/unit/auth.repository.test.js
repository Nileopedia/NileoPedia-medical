"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-env jest */
const auth_repository_1 = require("../../modules/auth/repositories/auth.repository");
const prisma_1 = __importDefault(require("../../config/prisma"));
jest.mock('../../config/prisma', () => ({
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    otp: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
    },
    passwordReset: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
    },
}));
describe('AuthRepository', () => {
    let repo;
    beforeEach(() => {
        jest.clearAllMocks();
        repo = new auth_repository_1.AuthRepository();
    });
    describe('findByEmail', () => {
        it('should find user by email', async () => {
            const mockPrisma = prisma_1.default;
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'test@test.com' });
            const result = await repo.findByEmail('test@test.com');
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
        });
    });
    describe('create', () => {
        it('should create user', async () => {
            const mockPrisma = prisma_1.default;
            mockPrisma.user.create.mockResolvedValue({ id: 'user-1' });
            const result = await repo.create({
                email: 'test@test.com',
                fullName: 'Test',
                password: 'hashed',
                role: 'MEDICAL_USER',
            });
            expect(mockPrisma.user.create).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=auth.repository.test.js.map