"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const logger_1 = require("../../config/logger");
const user_validation_1 = require("./user.validation");
class UserController {
    constructor() {
        this.userService = new user_service_1.UserService();
    }
    async getCurrentUser(req, res, next) {
        try {
            const userId = req.user.id;
            const user = await this.userService.getCurrentUser(userId);
            res.status(200).json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getCurrentUser controller:', error);
            next(error);
        }
    }
    async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const validatedData = user_validation_1.updateProfileSchema.parse(req.body);
            const user = await this.userService.updateProfile(userId, validatedData);
            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: user,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in updateProfile controller:', error);
            next(error);
        }
    }
    async changePassword(req, res, next) {
        try {
            const userId = req.user.id;
            const validatedData = user_validation_1.changePasswordSchema.parse(req.body);
            await this.userService.changePassword(userId, validatedData);
            res.status(200).json({
                success: true,
                message: 'Password changed successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in changePassword controller:', error);
            next(error);
        }
    }
    async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await this.userService.getUserById(id);
            res.status(200).json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getUserById controller:', error);
            next(error);
        }
    }
    async getUsers(req, res, next) {
        try {
            const query = user_validation_1.getUsersQuerySchema.parse(req.query);
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
        }
        catch (error) {
            logger_1.logger.error('Error in getUsers controller:', error);
            next(error);
        }
    }
    async deactivateUser(req, res, next) {
        try {
            const { id } = req.params;
            await this.userService.deactivateUser(id);
            res.status(200).json({
                success: true,
                message: 'User deactivated successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in deactivateUser controller:', error);
            next(error);
        }
    }
    async activateUser(req, res, next) {
        try {
            const { id } = req.params;
            await this.userService.activateUser(id);
            res.status(200).json({
                success: true,
                message: 'User activated successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in activateUser controller:', error);
            next(error);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map