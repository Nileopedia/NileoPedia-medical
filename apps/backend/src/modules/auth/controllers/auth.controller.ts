import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';
import { logger } from '../../../config/logger';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await this.authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Error in register controller:', error);
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await this.authService.login(req.body);
      res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Error in login controller:', error);
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await this.authService.refreshToken(req.body);
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Error in refreshToken controller:', error);
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Assuming user ID is available from auth middleware
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      await this.authService.logout(userId);
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      logger.error('Error in logout controller:', error);
      next(error);
    }
  }
}