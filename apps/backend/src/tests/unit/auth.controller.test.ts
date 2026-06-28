/* eslint-env jest */
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthController } from '../../modules/auth/controllers/auth.controller';
import { AuthService } from '../../modules/auth/services/auth.service';
import { GoogleAuthService } from '../../modules/auth/services/google.service';

jest.mock('../../modules/auth/services/auth.service');
jest.mock('../../modules/auth/services/google.service');
jest.mock('../../config/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() },
}));
jest.mock('express-validator', () => ({
  validationResult: jest.fn(() => ({
    isEmpty: () => true,
    array: () => [],
  })),
}));

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: {
    register: jest.Mock;
    login: jest.Mock;
    refreshToken: jest.Mock;
    logout: jest.Mock;
    requiresOtp: jest.Mock;
    generateOtp: jest.Mock;
    verifyOtp: jest.Mock;
    forgotPassword: jest.Mock;
    resetPassword: jest.Mock;
  };
  let mockGoogleService: { getAuthUrl: jest.Mock; handleGoogleCallback: jest.Mock };
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const createMockResponse = (): Partial<Response> => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      refreshToken: jest.fn(),
      logout: jest.fn(),
      requiresOtp: jest.fn(),
      generateOtp: jest.fn(),
      verifyOtp: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    };

    mockGoogleService = {
      getAuthUrl: jest.fn(),
      handleGoogleCallback: jest.fn(),
    };

    (AuthService as jest.Mock).mockImplementation(() => mockAuthService);
    (GoogleAuthService as jest.Mock).mockImplementation(() => mockGoogleService);

    controller = new AuthController();

    mockRequest = { query: {}, params: {}, body: {} };
    mockResponse = createMockResponse();
    mockNext = jest.fn();

    (validationResult as unknown as jest.Mock).mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    });
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const mockResult = {
        user: { id: 'user-1', email: 'test@test.com' },
        accessToken: 'token-123',
        refreshToken: 'refresh-123',
      };
      mockAuthService.register.mockResolvedValue(mockResult);

      mockRequest.body = { email: 'test@test.com', password: 'password123', name: 'Test User' };

      await controller.register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAuthService.register).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should return 409 when user already exists', async () => {
      mockAuthService.register.mockRejectedValue(new Error('User already exists'));

      mockRequest.body = { email: 'exists@test.com' };

      await controller.register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(409);
    });

    it('should call next with error for other errors', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Database error'));

      mockRequest.body = { email: 'test@test.com' };

      await controller.register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockResult = {
        user: { id: 'user-1', email: 'test@test.com' },
        accessToken: 'token-123',
        refreshToken: 'refresh-123',
      };
      mockAuthService.login.mockResolvedValue(mockResult);

      mockRequest.body = { email: 'test@test.com', password: 'password123' };

      await controller.login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAuthService.login).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('googleLogin', () => {
    it('should redirect to Google auth URL', async () => {
      mockGoogleService.getAuthUrl.mockResolvedValue('https://accounts.google.com/auth');

      await controller.googleLogin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockGoogleService.getAuthUrl).toHaveBeenCalled();
      expect(mockResponse.redirect).toHaveBeenCalledWith('https://accounts.google.com/auth');
    });
  });

  describe('googleCallback', () => {
    it('should return 400 when no code provided', async () => {
      mockRequest.query = {};

      await controller.googleCallback(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should redirect with tokens on successful callback', async () => {
      mockGoogleService.handleGoogleCallback.mockResolvedValue({
        accessToken: 'access-123',
        refreshToken: 'refresh-123',
      });
      process.env.FRONTEND_URL = 'http://localhost:3000';
      mockRequest.query = { code: 'auth-code-123' };

      await controller.googleCallback(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockGoogleService.handleGoogleCallback).toHaveBeenCalledWith('auth-code-123');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockResult = { accessToken: 'new-token', refreshToken: 'refresh-123' };
      mockAuthService.refreshToken.mockResolvedValue(mockResult);

      mockRequest.body = { refreshToken: 'refresh-123' };

      await controller.refreshToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);
      mockRequest.user = { id: 'user-1' } as any;

      await controller.logout(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAuthService.logout).toHaveBeenCalledWith('user-1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return 401 when no user', async () => {
      mockRequest.user = undefined;

      await controller.logout(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });

  describe('verifyEmail', () => {
    it('should return 400 when email missing', async () => {
      mockRequest.body = {};

      await controller.verifyEmail(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should send OTP when required', async () => {
      mockAuthService.requiresOtp.mockResolvedValue(true);
      mockAuthService.generateOtp.mockResolvedValue(undefined);
      mockRequest.body = { email: 'test@test.com' };

      await controller.verifyEmail(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAuthService.requiresOtp).toHaveBeenCalledWith('test@test.com');
      expect(mockAuthService.generateOtp).toHaveBeenCalledWith('test@test.com');
    });

    it('should return success without OTP when not required', async () => {
      mockAuthService.requiresOtp.mockResolvedValue(false);
      mockRequest.body = { email: 'test@test.com' };

      await controller.verifyEmail(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAuthService.generateOtp).not.toHaveBeenCalled();
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP successfully', async () => {
      const mockResult = { accessToken: 'token-123' };
      mockAuthService.verifyOtp.mockResolvedValue(mockResult);
      mockRequest.body = { email: 'test@test.com', otp: '123456' };

      await controller.verifyOtp(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAuthService.verifyOtp).toHaveBeenCalledWith('test@test.com', '123456');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('forgotPassword', () => {
    it('should handle forgot password request', async () => {
      mockAuthService.forgotPassword.mockResolvedValue(undefined);
      mockRequest.body = { email: 'test@test.com' };

      await controller.forgotPassword(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockResult = { success: true };
      mockAuthService.resetPassword.mockResolvedValue(mockResult);
      mockRequest.body = { email: 'test@test.com', token: 'token-123', newPassword: 'newPassword123' };

      await controller.resetPassword(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAuthService.resetPassword).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});