"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationsQuerySchema = exports.createSystemNotificationSchema = void 0;
const zod_1 = require("zod");
exports.createSystemNotificationSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    message: zod_1.z.string().min(1, 'Message is required'),
    targetRoles: zod_1.z.array(zod_1.z.enum(['MEDICAL_USER', 'VALIDATOR', 'ADMIN'])).min(1, 'At least one target role is required'),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.getNotificationsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1, 'Page must be at least 1').default(1),
    limit: zod_1.z.coerce.number().min(1, 'Limit must be at least 1').max(50, 'Limit cannot exceed 50').default(20),
});
//# sourceMappingURL=notification.validation.js.map