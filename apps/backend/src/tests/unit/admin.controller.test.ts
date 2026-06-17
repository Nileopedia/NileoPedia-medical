/* eslint-env jest */
import { Request, Response, NextFunction } from 'express';
import { AdminController } from '../../modules/admin/controllers/admin.controller';
import { AdminService } from '../../modules/admin/services/admin.service';

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

describe('AdminController', () => {
  let controller: AdminController;
  let mockAdminService: {
    getUsers: jest.Mock;
    suspendUser: jest.Mock;
    activateUser: jest.Mock;
    deleteUser: jest.Mock;
    getAnalytics: jest.Mock;
  };
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const createMockResponse = (): Partial<Response> => ({
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

    (AdminService as jest.Mock).mockImplementation(() => mockAdminService);

    controller = new AdminController();

    mockRequest = { query: {} };
    mockResponse = createMockResponse();
    mockNext = jest.fn();
  });

  describe('getUsers', () => {
    it('should get all users successfully', async () => {
      mockAdminService.getUsers.mockResolvedValue([{ id: 'user-1', email: 'test@test.com' }]);

      await controller.getUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAdminService.getUsers).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should handle error and call next', async () => {
      mockAdminService.getUsers.mockRejectedValue(new Error('Database error'));

      await controller.getUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('suspendUser', () => {
    it('should suspend user successfully', async () => {
      mockAdminService.suspendUser.mockResolvedValue({ id: 'user-1' });

      mockRequest.params = { userId: 'user-1' };

      await controller.suspendUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAdminService.suspendUser).toHaveBeenCalledWith('user-1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should handle error and call next', async () => {
      mockAdminService.suspendUser.mockRejectedValue(new Error('Error'));

      mockRequest.params = { userId: 'user-1' };

      await controller.suspendUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('activateUser', () => {
    it('should activate user successfully', async () => {
      mockAdminService.activateUser.mockResolvedValue({ id: 'user-1' });

      mockRequest.params = { userId: 'user-1' };

      await controller.activateUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAdminService.activateUser).toHaveBeenCalledWith('user-1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should handle error and call next', async () => {
      mockAdminService.activateUser.mockRejectedValue(new Error('Error'));

      mockRequest.params = { userId: 'user-1' };

      await controller.activateUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockAdminService.deleteUser.mockResolvedValue({ id: 'user-1' });

      mockRequest.params = { userId: 'user-1' };

      await controller.deleteUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAdminService.deleteUser).toHaveBeenCalledWith('user-1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should handle error and call next', async () => {
      mockAdminService.deleteUser.mockRejectedValue(new Error('Error'));

      mockRequest.params = { userId: 'user-1' };

      await controller.deleteUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('getAnalytics', () => {
    it('should get analytics successfully', async () => {
      mockAdminService.getAnalytics.mockResolvedValue({ totalUsers: 100 });

      await controller.getAnalytics(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAdminService.getAnalytics).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should handle error and call next', async () => {
      mockAdminService.getAnalytics.mockRejectedValue(new Error('Error'));

      await controller.getAnalytics(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('testEmbeddings', () => {
    it('should return embedding test results', async () => {
      mockRequest = {};

      await controller.testEmbeddings(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

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

      controller = new AdminController();

      await controller.testEmbeddings(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});