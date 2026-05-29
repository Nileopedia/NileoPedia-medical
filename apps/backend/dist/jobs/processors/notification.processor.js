"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processNotification = processNotification;
exports.processBulkNotifications = processBulkNotifications;
const prisma_1 = __importDefault(require("../../config/prisma"));
const logger_1 = require("../../config/logger");
async function processNotification(job) {
    const { userId, title, message, type, metadata } = job;
    try {
        const notification = await prisma_1.default.notification.create({
            data: {
                userId,
                title,
                message,
                type: type,
                metadata: metadata,
            },
        });
        logger_1.logger.info(`Notification created for user ${userId}: ${title}`);
        return { success: true, notificationId: notification.id };
    }
    catch (error) {
        logger_1.logger.error(`Notification creation failed for user ${userId}`, error);
        throw error;
    }
}
async function processBulkNotifications(jobs) {
    const count = await prisma_1.default.notification.createMany({
        data: jobs.map((job) => ({
            userId: job.userId,
            title: job.title,
            message: job.message,
            type: job.type,
            metadata: job.metadata,
        })),
    });
    return { success: true, count: count.count };
}
//# sourceMappingURL=notification.processor.js.map