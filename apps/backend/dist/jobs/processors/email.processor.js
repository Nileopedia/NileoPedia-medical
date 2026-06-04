"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("../../config/logger");
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025'),
    secure: false,
});
async function processEmail(job) {
    const { to, subject, template, data } = job;
    try {
        const html = await renderTemplate(template, data || {});
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'noreply@nileopedia.test',
            to,
            subject,
            html,
        });
        logger_1.logger.info(`Email sent to ${to} with template ${template}`);
        return { success: true };
    }
    catch (error) {
        logger_1.logger.error(`Email sending failed to ${to}`, error);
        throw error;
    }
}
exports.processEmail = processEmail;
async function renderTemplate(template, data) {
    const templates = {
        otp: `<p>Your verification code: <strong>${data.code}</strong></p>`,
        passwordReset: `<p>Click to reset: <a href="${data.resetLink}">Reset Password</a></p>`,
        notification: `<h2>${data.title}</h2><p>${data.message}</p>`,
    };
    return templates[template] || `<p>${JSON.stringify(data)}</p>`;
}
//# sourceMappingURL=email.processor.js.map