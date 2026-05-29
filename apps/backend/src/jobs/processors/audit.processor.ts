import prisma from '../../config/prisma';
import { AuditJob } from '../types';
import { logger } from '../../config/logger';

export async function processAudit(job: AuditJob) {
  const { userId, action, entityType, entityId, description, ipAddress, userAgent, metadata } = job;

  try {
    const audit = await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        description,
        ipAddress,
        userAgent,
        metadata: metadata as any,
      },
    });

    logger.info(`Audit log created: ${action} on ${entityType}`);
    return { success: true, auditId: audit.id };

  } catch (error) {
    logger.error('Audit log creation failed', error);
    throw error;
  }
}