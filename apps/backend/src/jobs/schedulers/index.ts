import { Queue } from 'bullmq';
import { documentQueue } from '../queues';
import { logger } from '../../config/logger';

const JOURNAL_SOURCES = [
  { name: 'PubMed Central', specialty: 'general' },
  { name: 'NEJM', specialty: 'general' },
  { name: 'The Lancet', specialty: 'general' },
  { name: 'JAMA', specialty: 'general' },
  { name: 'Circulation', specialty: 'cardiology' },
  { name: 'Diabetes Care', specialty: 'endocrinology' },
  { name: 'Journal of Clinical Oncology', specialty: 'oncology' },
  { name: 'Neurology', specialty: 'neurology' },
  { name: 'Gastroenterology', specialty: 'gastroenterology' },
];

export function setupSchedulers() {
  // Daily full ingestion at 2 AM UTC
  setInterval(async () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour === 2) {
      if (documentQueue) {
        for (const source of JOURNAL_SOURCES) {
          await documentQueue.add('scheduled-ingest', {
            source,
            type: 'scheduled',
          });
        }
        logger.info('Scheduled ingestion jobs added to queue');
      }
    }

    // Weekly incremental refresh at 3 AM UTC on Sundays
    if (hour === 3 && now.getDay() === 0) {
      if (documentQueue) {
        for (const source of JOURNAL_SOURCES) {
          await documentQueue.add('incremental-refresh', {
            source,
            type: 'scheduled',
          });
        }
        logger.info('Incremental KB refresh jobs added to queue');
      }
    }
  }, 60 * 60 * 1000);

  logger.info('Schedulers initialized');
}
        logger.info('Scheduled ingestion jobs added to queue');
      }
    }

    if (hour === 3 && now.getDay() === 0) {
      // Archive audit logs on Sunday at 3 AM
      await documentQueue.add('archive-audit-logs', { type: 'audit_logs' }, {
        jobId: `archive-audit-${now.toISOString().split('T')[0]}`,
        removeOnComplete: true,
      });
    }
  }, 60 * 60 * 1000);

  logger.info('Schedulers initialized');
}