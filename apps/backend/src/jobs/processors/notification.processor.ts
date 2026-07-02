import { NotificationType } from '@prisma/client';
import prisma from '../../config/prisma';
import { NotificationJob } from '../types';
import { logger } from '../../config/logger';

export async function processNotification(job: NotificationJob) {
  const {
    userId, title, message, type, metadata,
  } = job;

  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type as NotificationType,
        metadata: metadata as any,
      },
    });

    logger.info(`Notification created for user ${userId}: ${title}`);
    return { success: true, notificationId: notification.id };
  } catch (error) {
    logger.error(`Notification creation failed for user ${userId}`, error);
    throw error;
  }
}

export async function processBulkNotifications(
  jobs: NotificationJob[],
) {
  const count = await prisma.notification.createMany({
    data: jobs.map((job) => ({
      userId: job.userId,
      title: job.title,
      message: job.message,
      type: job.type as NotificationType,
      metadata: job.metadata as any,
    })),
  });

  return { success: true, count: count.count };
}
