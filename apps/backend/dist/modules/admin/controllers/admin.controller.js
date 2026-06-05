"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("../services/admin.service");
const logger_1 = require("../../../config/logger");
class AdminController {
    constructor() {
        this.adminService = new admin_service_1.AdminService();
    }
    async getUsers(req, res, next) {
        try {
            const users = await this.adminService.getUsers();
            res.status(200).json({ success: true, data: users });
        }
        catch (error) {
            logger_1.logger.error('Error in getUsers controller:', error);
            next(error);
        }
    }
    async suspendUser(req, res, next) {
        try {
            const { userId } = req.params;
            await this.adminService.suspendUser(userId);
            res.status(200).json({ success: true, message: 'User suspended' });
        }
        catch (error) {
            logger_1.logger.error('Error in suspendUser controller:', error);
            next(error);
        }
    }
    async activateUser(req, res, next) {
        try {
            const { userId } = req.params;
            await this.adminService.activateUser(userId);
            res.status(200).json({ success: true, message: 'User activated' });
        }
        catch (error) {
            logger_1.logger.error('Error in activateUser controller:', error);
            next(error);
        }
    }
    async deleteUser(req, res, next) {
        try {
            const { userId } = req.params;
            await this.adminService.deleteUser(userId);
            res.status(200).json({ success: true, message: 'User deleted' });
        }
        catch (error) {
            logger_1.logger.error('Error in deleteUser controller:', error);
            next(error);
        }
    }
    async getAnalytics(req, res, next) {
        try {
            const analytics = await this.adminService.getAnalytics();
            res.status(200).json({ success: true, data: analytics });
        }
        catch (error) {
            logger_1.logger.error('Error in getAnalytics controller:', error);
            next(error);
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map