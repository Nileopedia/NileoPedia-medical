"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("../services/analytics.service");
const logger_1 = require("../../../config/logger");
class AnalyticsController {
    constructor() {
        this.analyticsService = new analytics_service_1.AnalyticsService();
    }
    async getDashboard(req, res, next) {
        try {
            const analytics = await this.analyticsService.getDashboard();
            res.status(200).json({ success: true, data: analytics });
        }
        catch (error) {
            logger_1.logger.error('Error in getDashboard controller:', error);
            next(error);
        }
    }
    async getValidationMetrics(req, res, next) {
        try {
            const metrics = await this.analyticsService.getValidationMetrics();
            res.status(200).json({ success: true, data: metrics });
        }
        catch (error) {
            logger_1.logger.error('Error in getValidationMetrics controller:', error);
            next(error);
        }
    }
}
exports.AnalyticsController = AnalyticsController;
//# sourceMappingURL=analytics.controller.js.map