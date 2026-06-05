"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSchedulers = void 0;
const queues_1 = require("../queues");
const logger_1 = require("../../config/logger");
function setupSchedulers() {
    setInterval(async () => {
        const now = new Date();
        const hour = now.getHours();
        if (hour === 2) {
            await queues_1.cleanupQueue.add('cleanup-expired-tokens', { type: 'expired_tokens' }, {
                jobId: `cleanup-expired-${now.toISOString().split('T')[0]}`,
                removeOnComplete: true,
            });
        }
        if (hour === 3 && now.getDay() === 0) {
            await queues_1.cleanupQueue.add('archive-audit-logs', { type: 'audit_logs' }, {
                jobId: `archive-audit-${now.toISOString().split('T')[0]}`,
                removeOnComplete: true,
            });
        }
    }, 60 * 60 * 1000);
    logger_1.logger.info('Schedulers initialized');
}
exports.setupSchedulers = setupSchedulers;
//# sourceMappingURL=index.js.map