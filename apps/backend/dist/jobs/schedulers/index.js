"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSchedulers = void 0;
const queues_1 = require("../queues");
const logger_1 = require("../../config/logger");
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
function setupSchedulers() {
    // Daily full ingestion at 2 AM UTC
    setInterval(async () => {
        const now = new Date();
        const hour = now.getHours();
        if (hour === 2) {
            if (queues_1.documentQueue) {
                for (const source of JOURNAL_SOURCES) {
                    await queues_1.documentQueue.add('scheduled-ingest', {
                        source,
                        type: 'scheduled',
                    });
                }
                logger_1.logger.info('Scheduled ingestion jobs added to queue');
            }
        }
        // Weekly incremental refresh at 3 AM UTC on Sundays
        if (hour === 3 && now.getDay() === 0) {
            if (queues_1.documentQueue) {
                for (const source of JOURNAL_SOURCES) {
                    await queues_1.documentQueue.add('incremental-refresh', {
                        source,
                        type: 'scheduled',
                    });
                }
                logger_1.logger.info('Incremental KB refresh jobs added to queue');
            }
            // Archive audit logs on Sunday at 3 AM
            await queues_1.documentQueue.add('archive-audit-logs', { type: 'audit_logs' }, {
                jobId: `archive-audit-${now.toISOString().split('T')[0]}`,
                removeOnComplete: true,
            });
        }
    }, 60 * 60 * 1000);
    logger_1.logger.info('Schedulers initialized');
}
exports.setupSchedulers = setupSchedulers;
//# sourceMappingURL=index.js.map