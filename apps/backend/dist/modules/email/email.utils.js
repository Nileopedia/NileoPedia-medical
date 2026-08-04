"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmail = exports.systemAnnouncementSchema = exports.securityAlertSchema = exports.accountStatusSchema = exports.welcomeSchema = exports.passwordResetSchema = exports.validatorOtpSchema = exports.emailSchema = void 0;
const zod_1 = require("zod");
exports.emailSchema = zod_1.z.object({
    to: zod_1.z.string().email(),
    subject: zod_1.z.string().min(1).max(200),
    html: zod_1.z.string().min(1),
});
exports.validatorOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    fullName: zod_1.z.string().min(1),
    otpCode: zod_1.z.string().length(6),
});
exports.passwordResetSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    fullName: zod_1.z.string().min(1),
    resetLink: zod_1.z.string().url(),
});
exports.welcomeSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    fullName: zod_1.z.string().min(1),
});
exports.accountStatusSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    fullName: zod_1.z.string().min(1),
    reason: zod_1.z.string().optional(),
});
exports.securityAlertSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    fullName: zod_1.z.string().min(1),
    alertType: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    ipAddress: zod_1.z.string().optional(),
});
exports.systemAnnouncementSchema = zod_1.z.object({
    recipients: zod_1.z.array(zod_1.z.string().email()),
    subject: zod_1.z.string().min(1).max(200),
    title: zod_1.z.string().min(1),
    message: zod_1.z.string().min(1),
});
function validateEmail(data) {
    try {
        exports.emailSchema.parse(data);
        return true;
    }
    catch {
        return false;
    }
}
exports.validateEmail = validateEmail;
//# sourceMappingURL=email.utils.js.map