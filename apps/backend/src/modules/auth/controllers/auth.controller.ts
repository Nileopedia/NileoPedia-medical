import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';
import { GoogleAuthService } from '../services/google.service';
import { AuditLogger } from '../../audit/audit.logger';
import { logger } from '../../../config/logger';

export class AuthController {
  private authService: AuthService;
  private googleAuthService: GoogleAuthService;

  constructor() {
    this.authService = new AuthService();
    this.googleAuthService = new GoogleAuthService();
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await this.authService.register(req.body);
      await AuditLogger.log(req, {
        action: 'USER_REGISTERED',
        entityType: 'User',
        entityId: result.user.id,
        description: 'New user registered',
        metadata: { email: result.user.email },
      });
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Error in register controller:', error);
      if (error instanceof Error && error.message === 'User already exists') {
        return res.status(409).json({ success: false, message: 'Email already exists' });
      }
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
      await AuditLogger.log(req, {
        action: 'LOGIN_SUCCESS',
        entityType: 'Auth',
        entityId: result.user.id,
        description: 'User logged in successfully',
        metadata: { email: result.user.email },
      });
      res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        data: result,
      });
    } catch (error) {
      await AuditLogger.log(req, {
        action: 'LOGIN_FAILED',
        entityType: 'Auth',
        description: 'Failed login attempt',
        metadata: { email: req.body.email, error: (error as Error).message },
      });
      logger.error('Error in login controller:', error);
      next(error);
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const authUrl = await this.googleAuthService.getAuthUrl();
      res.redirect(authUrl);
    } catch (error) {
      logger.error('Error generating Google auth URL:', error);
      next(error);
    }
  }

  async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.query.code as string;
      if (!code) {
        return res.status(400).json({ 
          success: false, 
          message: 'Authorization code not provided' 
        });
      }

      const result = await this.googleAuthService.handleGoogleCallback(code);
      
      // Redirect to frontend with tokens (you might want to use a different approach)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/google/callback?access_token=${result.accessToken}&refresh_token=${result.refreshToken}`);
    } catch (error) {
      logger.error('Error in Google callback:', error);
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
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      await this.authService.logout(userId);
      await AuditLogger.log(req, {
        action: 'LOGOUT',
        entityType: 'Auth',
        entityId: userId,
        description: 'User logged out',
      });
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      logger.error('Error in logout controller:', error);
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
        });
      }

      const requiresOtp = await this.authService.requiresOtp(email);
      
      if (requiresOtp) {
        await this.authService.generateOtp(email);
      }
      
      res.status(200).json({
        success: true,
        message: requiresOtp ? 'OTP sent to your email' : 'Verification check complete',
        data: { requiresOtp },
      });
    } catch (error) {
      logger.error('Error in verifyEmail controller:', error);
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      
      const result = await this.authService.verifyOtp(email, otp);
      res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Error in verifyOtp controller:', error);
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await this.authService.forgotPassword(email);
      await AuditLogger.log(req, {
        action: 'PASSWORD_RESET_REQUESTED',
        entityType: 'Auth',
        description: 'Password reset requested',
        metadata: { email },
      });
      res.status(200).json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
      });
    } catch (error) {
      logger.error('Error in forgotPassword controller:', error);
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, token, newPassword } = req.body;
      await this.authService.resetPassword(email, token, newPassword);
      await AuditLogger.log(req, {
        action: 'PASSWORD_RESET_COMPLETED',
        entityType: 'Auth',
        description: 'Password reset completed',
        metadata: { email },
      });
      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      logger.error('Error in resetPassword controller:', error);
      next(error);
    }
  }
}