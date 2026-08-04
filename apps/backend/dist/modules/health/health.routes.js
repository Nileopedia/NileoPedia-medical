"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = void 0;
const express_1 = require("express");
const deployment_hardening_service_1 = require("../deployment/deployment-hardening.service");
const backup_service_1 = require("../backup/backup.service");
const logger_1 = require("../../config/logger");
const router = (0, express_1.Router)();
router.get('/health', async (req, res) => {
    try {
        const health = await deployment_hardening_service_1.deploymentHardeningService.runHealthCheck();
        const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 503 : 503;
        res.status(statusCode).json({
            success: true,
            data: health,
        });
    }
    catch (error) {
        logger_1.logger.error('Health check failed', error);
        res.status(503).json({
            success: false,
            message: 'Service unhealthy',
            error: error instanceof Error ? error.message : String(error),
        });
    }
});
router.get('/readiness', async (req, res) => {
    try {
        const readiness = await deployment_hardening_service_1.deploymentHardeningService.runReadinessCheck();
        const statusCode = readiness.ready ? 200 : 503;
        res.status(statusCode).json({
            success: readiness.ready,
            data: readiness,
            message: readiness.ready ? 'Ready to serve traffic' : 'Not ready',
        });
    }
    catch (error) {
        logger_1.logger.error('Readiness check failed', error);
        res.status(503).json({
            success: false,
            message: 'Not ready',
        });
    }
});
router.get('/liveness', (req, res) => {
    try {
        const liveness = deployment_hardening_service_1.deploymentHardeningService.runLivenessCheck();
        res.status(200).json({
            success: true,
            data: liveness,
        });
    }
    catch (error) {
        logger_1.logger.error('Liveness check failed', error);
        res.status(503).json({
            success: false,
            message: 'Not alive',
        });
    }
});
router.get('/startup', async (req, res) => {
    try {
        const diagnostics = await deployment_hardening_service_1.deploymentHardeningService.runStartupDiagnostics();
        res.status(200).json({
            success: true,
            data: diagnostics,
        });
    }
    catch (error) {
        logger_1.logger.error('Startup diagnostics failed', error);
        res.status(500).json({
            success: false,
            message: 'Startup diagnostics failed',
            error: error instanceof Error ? error.message : String(error),
        });
    }
});
router.get('/backups', async (req, res) => {
    try {
        const backups = await backup_service_1.backupService.listBackups();
        res.status(200).json({
            success: true,
            data: backups,
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to list backups', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list backups',
        });
    }
});
router.post('/backup', async (req, res) => {
    try {
        const manifest = await backup_service_1.backupService.createFullBackup();
        res.status(200).json({
            success: true,
            data: manifest,
            message: 'Backup completed successfully',
        });
    }
    catch (error) {
        logger_1.logger.error('Backup creation failed', error);
        res.status(500).json({
            success: false,
            message: 'Backup creation failed',
            error: error instanceof Error ? error.message : String(error),
        });
    }
});
exports.healthRoutes = router;
//# sourceMappingURL=health.routes.js.map