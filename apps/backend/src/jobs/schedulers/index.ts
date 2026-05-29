import { Queue } from 'bullmq';
import { cleanupQueue } from '../queues';
import { logger } from '../../config/logger';

export function setupSchedulers() {
  setInterval(async () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour === 2) {
      await cleanupQueue.add('cleanup-expired-tokens', { type: 'expired_tokens' }, {
        jobId: `cleanup-expired-${now.toISOString().split('T')[0]}`,
        removeOnComplete: true,
      });
    }

    if (hour === 3 && now.getDay() === 0) {
      await cleanupQueue.add('archive-audit-logs', { type: 'audit_logs' }, {
        jobId: `archive-audit-${now.toISOString().split('T')[0]}`,
        removeOnComplete: true,
      });
    }
  }, 60 * 60 * 1000);

  logger.info('Schedulers initialized');
}