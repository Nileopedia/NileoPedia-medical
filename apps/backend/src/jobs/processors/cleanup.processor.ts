import prisma from '../../config/prisma';
import { CleanupJob } from '../types';
import { logger } from '../../config/logger';
import fs from 'fs';
import path from 'path';

export async function processCleanup(job: CleanupJob) {
  const { type } = job;

  try {
    switch (type) {
      case 'expired_tokens':
        return await cleanupExpiredTokens();
      case 'failed_jobs':
        return await cleanupFailedJobs();
      case 'temp_files':
        return await cleanupTempFiles();
      case 'audit_logs':
        return await archiveOldAuditLogs();
      default:
        throw new Error(`Unknown cleanup type: ${type}`);
    }
  } catch (error) {
    logger.error(`Cleanup job failed: ${type}`, error);
    throw error;
  }
}

async function cleanupExpiredTokens() {
  const result = await prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  logger.info(`Cleaned up ${result.count} expired sessions`);
  return { success: true, cleaned: result.count };
}

async function cleanupFailedJobs() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const result = await prisma.auditLog.deleteMany({
    where: { createdAt: { lt: oneWeekAgo }, action: 'JOB_FAILED' },
  });
  logger.info(`Cleaned up ${result.count} old audit logs`);
  return { success: true, cleaned: result.count };
}

async function cleanupTempFiles() {
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  let cleaned = 0;
  
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir);
    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const stat = fs.statSync(filePath);
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      
      if (stat.mtime.getTime() < oneDayAgo) {
        fs.unlinkSync(filePath);
        cleaned++;
      }
    }
  }
  
  logger.info(`Cleaned up ${cleaned} temp files`);
  return { success: true, cleaned };
}

async function archiveOldAuditLogs() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const result = await prisma.auditLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  logger.info(`Archived ${result.count} old audit logs`);
  return { success: true, archived: result.count };
}