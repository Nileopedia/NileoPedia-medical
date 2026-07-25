import { Router } from 'express';
import { deploymentHardeningService } from '../deployment/deployment-hardening.service';
import { backupService } from '../backup/backup.service';
import { securityAuditService } from '../security/security-audit.service';
import { logger } from '../../config/logger';

const router = Router();

router.get('/health', async (req: any, res: any) => {
  try {
    const health = await deploymentHardeningService.runHealthCheck();
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 503 : 503;
    res.status(statusCode).json({
      success: true,
      data: health,
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      success: false,
      message: 'Service unhealthy',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

router.get('/readiness', async (req: any, res: any) => {
  try {
    const readiness = await deploymentHardeningService.runReadinessCheck();
    const statusCode = readiness.ready ? 200 : 503;
    res.status(statusCode).json({
      success: readiness.ready,
      data: readiness,
      message: readiness.ready ? 'Ready to serve traffic' : 'Not ready',
    });
  } catch (error) {
    logger.error('Readiness check failed', error);
    res.status(503).json({
      success: false,
      message: 'Not ready',
    });
  }
});

router.get('/liveness', (req: any, res: any) => {
  try {
    const liveness = deploymentHardeningService.runLivenessCheck();
    res.status(200).json({
      success: true,
      data: liveness,
    });
  } catch (error) {
    logger.error('Liveness check failed', error);
    res.status(503).json({
      success: false,
      message: 'Not alive',
    });
  }
});

router.get('/startup', async (req: any, res: any) => {
  try {
    const diagnostics = await deploymentHardeningService.runStartupDiagnostics();
    res.status(200).json({
      success: true,
      data: diagnostics,
    });
  } catch (error) {
    logger.error('Startup diagnostics failed', error);
    res.status(500).json({
      success: false,
      message: 'Startup diagnostics failed',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

router.get('/backups', async (req: any, res: any) => {
  try {
    const backups = await backupService.listBackups();
    res.status(200).json({
      success: true,
      data: backups,
    });
  } catch (error) {
    logger.error('Failed to list backups', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list backups',
    });
  }
});

router.post('/backup', async (req: any, res: any) => {
  try {
    const manifest = await backupService.createFullBackup();
    res.status(200).json({
      success: true,
      data: manifest,
      message: 'Backup completed successfully',
    });
  } catch (error) {
    logger.error('Backup creation failed', error);
    res.status(500).json({
      success: false,
      message: 'Backup creation failed',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

export const healthRoutes = router;
