import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { logger } from '../../config/logger';
import { updateProfileSchema, changePasswordSchema, getUsersQuerySchema } from './user.validation';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await this.userService.getCurrentUser(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('Error in getCurrentUser controller:', error);
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const validatedData = updateProfileSchema.parse(req.body);

      const user = await this.userService.updateProfile(userId, validatedData);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      logger.error('Error in updateProfile controller:', error);
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const validatedData = changePasswordSchema.parse(req.body);

      await this.userService.changePassword(userId, validatedData);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      logger.error('Error in changePassword controller:', error);
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('Error in getUserById controller:', error);
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getUsersQuerySchema.parse(req.query);
      const result = await this.userService.getUsers(query);

      res.status(200).json({
        success: true,
        data: result.users,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      logger.error('Error in getUsers controller:', error);
      next(error);
    }
  }

  async deactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this.userService.deactivateUser(id);

      res.status(200).json({
        success: true,
        message: 'User deactivated successfully',
      });
    } catch (error) {
      logger.error('Error in deactivateUser controller:', error);
      next(error);
    }
  }

  async activateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this.userService.activateUser(id);

      res.status(200).json({
        success: true,
        message: 'User activated successfully',
      });
    } catch (error) {
      logger.error('Error in activateUser controller:', error);
      next(error);
    }
  }

  async getPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const preferences = await this.userService.getPreferences(userId);

      res.status(200).json({
        success: true,
        data: preferences,
      });
    } catch (error) {
      logger.error('Error in getPreferences controller:', error);
      next(error);
    }
  }

  async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const preferences = await this.userService.updatePreferences(userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Preferences updated successfully',
        data: preferences,
      });
    } catch (error) {
      logger.error('Error in updatePreferences controller:', error);
      next(error);
    }
  }

  async createValidator(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.createValidator(req.body);

      res.status(201).json({
        success: true,
        message: 'Validator created successfully',
        data: user,
      });
    } catch (error) {
      logger.error('Error in createValidator controller:', error);
      next(error);
    }
  }
}