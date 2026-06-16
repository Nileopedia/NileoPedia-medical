"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const audit_service_1 = require("./audit.service");
const logger_1 = require("../../config/logger");
class AuditController {
    constructor() {
        this.auditService = new audit_service_1.AuditService();
    }
    async getAuditLogs(req, res, next) {
        try {
            const query = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
                action: req.query.action,
                entityType: req.query.entityType,
                userId: req.query.userId,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            };
            const result = await this.auditService.getAuditLogs(query);
            res.status(200).json({
                success: true,
                data: {
                    logs: result.logs,
                    pagination: {
                        total: result.total,
                        page: result.page,
                        limit: result.limit,
                        totalPages: result.totalPages,
                    },
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getAuditLogs controller:', error);
            next(error);
        }
    }
    async getAuditLogById(req, res, next) {
        try {
            const { id } = req.params;
            const log = await this.auditService.getAuditLogById(id);
            if (!log) {
                return res.status(404).json({
                    success: false,
                    message: 'Audit log not found',
                });
            }
            res.status(200).json({
                success: true,
                data: log,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getAuditLogById controller:', error);
            next(error);
        }
    }
    async getUserActivityLogs(req, res, next) {
        try {
            const { userId } = req.params;
            const query = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
            };
            const result = await this.auditService.getUserActivityLogs(userId, query);
            res.status(200).json({
                success: true,
                data: {
                    logs: result.logs,
                    pagination: {
                        total: result.total,
                        page: result.page,
                        limit: result.limit,
                        totalPages: result.totalPages,
                    },
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getUserActivityLogs controller:', error);
            next(error);
        }
    }
    async getValidationActivity(req, res, next) {
        try {
            const query = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
            };
            const result = await this.auditService.getValidationActivity(query);
            res.status(200).json({
                success: true,
                data: {
                    logs: result.logs,
                    pagination: {
                        total: result.total,
                        page: result.page,
                        limit: result.limit,
                        totalPages: result.totalPages,
                    },
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getValidationActivity controller:', error);
            next(error);
        }
    }
    async getSecurityEvents(req, res, next) {
        try {
            const query = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
            };
            const result = await this.auditService.getSecurityEvents(query);
            res.status(200).json({
                success: true,
                data: {
                    logs: result.logs,
                    pagination: {
                        total: result.total,
                        page: result.page,
                        limit: result.limit,
                        totalPages: result.totalPages,
                    },
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getSecurityEvents controller:', error);
            next(error);
        }
    }
}
exports.AuditController = AuditController;
//# sourceMappingURL=audit.controller.js.map