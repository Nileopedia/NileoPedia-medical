"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersQuerySchema = exports.changePasswordSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1, 'Full name is required').optional(),
    specialization: zod_1.z.string().optional(),
    institution: zod_1.z.string().optional(),
    profileImage: zod_1.z.string().url('Invalid URL format').optional().or(zod_1.z.literal('')),
    bio: zod_1.z.string().optional(),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z.string().min(8, 'New password must be at least 8 characters long'),
});
exports.getUsersQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1, 'Page must be at least 1').default(1),
    limit: zod_1.z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
    search: zod_1.z.string().optional(),
});
//# sourceMappingURL=user.validation.js.map