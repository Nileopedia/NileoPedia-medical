"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEmail = void 0;
const email_service_1 = require("../../modules/email/email.service");
const logger_1 = require("../../config/logger");
async function processEmail(job) {
    const { to, subject, html, template, data } = job;
    try {
        const emailHtml = html || (template ? renderTemplate(template, data || {}) : '');
        await email_service_1.EmailService.sendViaResend(to, subject, emailHtml);
        logger_1.logger.info(`Email sent to ${to} via Resend`, { template, subject });
        return { success: true };
    }
    catch (error) {
        logger_1.logger.error(`Email sending failed to ${to}`, { template, subject, error });
        throw error;
    }
}
exports.processEmail = processEmail;
function renderTemplate(template, data) {
    const templates = {
        otp: `<p>Your verification code: <strong>${data.code || data.otp || '------'}</strong></p>`,
        passwordReset: `<p>Click to reset: <a href="${data.resetLink || '#'}">Reset Password</a></p>`,
        notification: `<h2>${data.title || ''}</h2><p>${data.message || ''}</p>`,
    };
    return templates[template] || `<p>${JSON.stringify(data)}</p>`;
}
//# sourceMappingURL=email.processor.js.map