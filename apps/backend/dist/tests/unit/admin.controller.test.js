"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin_controller_1 = require("../../modules/admin/controllers/admin.controller");
const admin_service_1 = require("../../modules/admin/services/admin.service");
jest.mock('../../modules/admin/services/admin.service');
jest.mock('../../config/logger', () => ({
    logger: { error: jest.fn(), info: jest.fn() },
}));
jest.mock('../../modules/rag/services/embedding.service', () => ({
    EmbeddingService: jest.fn().mockImplementation(() => ({
        embeddingSource: 'local',
        generateEmbedding: jest.fn().mockResolvedValue(Array(384).fill(0)),
    })),
}));
jest.mock('../../modules/retrieval/retrieval.service', () => ({
    RetrievalService: jest.fn().mockImplementation(() => ({
        pineconeClient: { index: jest.fn() },
        hybridSearch: jest.fn().mockResolvedValue([]),
        embeddingService: { generateEmbedding: jest.fn() },
    })),
}));
jest.mock('../../config/env', () => ({
    CONFIG: { GROQ_API_KEY: 'test-key' },
}));
jest.mock('../../config/prisma', () => ({
    medicalDocument: { count: jest.fn().mockResolvedValue(100) },
    embeddingMetadata: { count: jest.fn().mockResolvedValue(500) },
}));
describe('AdminController', () => {
    let controller;
    let mockAdminService;
    let mockRequest;
    let mockResponse;
    let mockNext;
    const createMockResponse = () => ({
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    });
    beforeEach(() => {
        jest.clearAllMocks();
        mockAdminService = {
            getUsers: jest.fn(),
            suspendUser: jest.fn(),
            activateUser: jest.fn(),
            deleteUser: jest.fn(),
            getAnalytics: jest.fn(),
        };
        admin_service_1.AdminService.mockImplementation(() => mockAdminService);
        controller = new admin_controller_1.AdminController();
        mockRequest = { query: {} };
        mockResponse = createMockResponse();
        mockNext = jest.fn();
    });
    describe('getUsers', () => {
        it('should get all users successfully', async () => {
            mockAdminService.getUsers.mockResolvedValue([{ id: 'user-1', email: 'test@test.com' }]);
            await controller.getUsers(mockRequest, mockResponse, mockNext);
            expect(mockAdminService.getUsers).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
        });
        it('should handle error and call next', async () => {
            mockAdminService.getUsers.mockRejectedValue(new Error('Database error'));
            await controller.getUsers(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });
    });
    describe('suspendUser', () => {
        it('should suspend user successfully', async () => {
            mockAdminService.suspendUser.mockResolvedValue({ id: 'user-1' });
            mockRequest.params = { userId: 'user-1' };
            await controller.suspendUser(mockRequest, mockResponse, mockNext);
            expect(mockAdminService.suspendUser).toHaveBeenCalledWith('user-1');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
        });
        it('should handle error and call next', async () => {
            mockAdminService.suspendUser.mockRejectedValue(new Error('Error'));
            mockRequest.params = { userId: 'user-1' };
            await controller.suspendUser(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });
    });
    describe('activateUser', () => {
        it('should activate user successfully', async () => {
            mockAdminService.activateUser.mockResolvedValue({ id: 'user-1' });
            mockRequest.params = { userId: 'user-1' };
            await controller.activateUser(mockRequest, mockResponse, mockNext);
            expect(mockAdminService.activateUser).toHaveBeenCalledWith('user-1');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
        });
        it('should handle error and call next', async () => {
            mockAdminService.activateUser.mockRejectedValue(new Error('Error'));
            mockRequest.params = { userId: 'user-1' };
            await controller.activateUser(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });
    });
    describe('deleteUser', () => {
        it('should delete user successfully', async () => {
            mockAdminService.deleteUser.mockResolvedValue({ id: 'user-1' });
            mockRequest.params = { userId: 'user-1' };
            await controller.deleteUser(mockRequest, mockResponse, mockNext);
            expect(mockAdminService.deleteUser).toHaveBeenCalledWith('user-1');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
        });
        it('should handle error and call next', async () => {
            mockAdminService.deleteUser.mockRejectedValue(new Error('Error'));
            mockRequest.params = { userId: 'user-1' };
            await controller.deleteUser(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });
    });
    describe('getAnalytics', () => {
        it('should get analytics successfully', async () => {
            mockAdminService.getAnalytics.mockResolvedValue({ totalUsers: 100 });
            await controller.getAnalytics(mockRequest, mockResponse, mockNext);
            expect(mockAdminService.getAnalytics).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
        });
        it('should handle error and call next', async () => {
            mockAdminService.getAnalytics.mockRejectedValue(new Error('Error'));
            await controller.getAnalytics(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });
    });
    describe('testEmbeddings', () => {
        it('should return embedding test results', async () => {
            mockRequest = {};
            await controller.testEmbeddings(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
        });
        it('should handle embedding generation error', async () => {
            jest.resetModules();
            jest.doMock('../../modules/rag/services/embedding.service', () => ({
                EmbeddingService: jest.fn().mockImplementation(() => ({
                    embeddingSource: 'local',
                    generateEmbedding: jest.fn().mockRejectedValue(new Error('Embedding error')),
                })),
            }));
            controller = new admin_controller_1.AdminController();
            await controller.testEmbeddings(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
        });
    });
});
//# sourceMappingURL=admin.controller.test.js.map