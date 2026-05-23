"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_validator_1 = require("express-validator");
const auth_service_1 = require("../services/auth.service");
const logger_1 = require("../../../config/logger");
class AuthController {
    constructor() {
        this.authService = new auth_service_1.AuthService();
    }
    async register(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const result = await this.authService.register(req.body);
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in register controller:', error);
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const result = await this.authService.login(req.body);
            res.status(200).json({
                success: true,
                message: 'User logged in successfully',
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in login controller:', error);
            next(error);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const result = await this.authService.refreshToken(req.body);
            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in refreshToken controller:', error);
            next(error);
        }
    }
    async logout(req, res, next) {
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
        }
        catch (error) {
            logger_1.logger.error('Error in logout controller:', error);
            next(error);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map