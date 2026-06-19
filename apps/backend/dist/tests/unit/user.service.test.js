"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-env jest */
const user_service_1 = require("../../modules/users/user.service");
jest.mock('../../config/prisma', () => ({
    user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
    },
}));
jest.mock('bcryptjs', () => ({
    compare: jest.fn().mockResolvedValue(true),
    genSalt: jest.fn().mockResolvedValue('salt'),
    hash: jest.fn().mockResolvedValue('hashed'),
}));
describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should exist', () => {
        const service = new user_service_1.UserService();
        expect(service).toBeDefined();
    });
    it('should have getCurrentUser method', () => {
        const service = new user_service_1.UserService();
        expect(typeof service.getCurrentUser).toBe('function');
    });
    it('should have updateProfile method', () => {
        const service = new user_service_1.UserService();
        expect(typeof service.updateProfile).toBe('function');
    });
    it('should have changePassword method', () => {
        const service = new user_service_1.UserService();
        expect(typeof service.changePassword).toBe('function');
    });
});
//# sourceMappingURL=user.service.test.js.map