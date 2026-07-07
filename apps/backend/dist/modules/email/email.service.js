"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = exports.resetResendClient = void 0;
const email_types_1 = require("./email.types");
const email_templates_1 = require("./email.templates");
const email_utils_1 = require("./email.utils");
const prisma_1 = __importDefault(require("../../config/prisma"));
const logger_1 = require("../../config/logger");
const { RESEND_API_KEY } = process.env;
const { EMAIL_FROM } = process.env;
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'resend';
const getEmailFrom = () => process.env.EMAIL_FROM || '';
const getApiKey = () => process.env.RESEND_API_KEY;
let resendClient = null;
function resetResendClient() {
    resendClient = null;
}
exports.resetResendClient = resetResendClient;
async function getResendClient() {
    if (!resendClient) {
        const apiKey = getApiKey();
        if (!apiKey) {
            throw new Error('RESEND_API_KEY is not configured');
        }
        const { Resend } = await Promise.resolve().then(() => __importStar(require('resend')));
        resendClient = new Resend(apiKey);
    }
    return resendClient;
}
class EmailService {
    static async sendValidatorOtp(data) {
        const template = email_templates_1.emailTemplates.validatorOtp(data);
        await this.sendEmail(data.email, template.subject, template.html, 'otp');
    }
    static async sendOtp(data) {
        const template = email_templates_1.emailTemplates.otpLogin(data);
        await this.sendEmail(data.email, template.subject, template.html, 'otp');
    }
    static async sendPasswordReset(data) {
        const template = email_templates_1.emailTemplates.passwordReset(data);
        await this.sendEmail(data.email, template.subject, template.html, 'passwordReset');
    }
    static async sendWelcome(data) {
        const template = email_templates_1.emailTemplates.welcome(data);
        await this.sendEmail(data.email, template.subject, template.html, 'notification');
    }
    static async sendAccountActivated(data) {
        const template = email_templates_1.emailTemplates.accountActivated(data);
        await this.sendEmail(data.email, template.subject, template.html, 'notification');
    }
    static async sendAccountDeactivated(data) {
        const template = email_templates_1.emailTemplates.accountDeactivated(data);
        await this.sendEmail(data.email, template.subject, template.html, 'notification');
    }
    static async sendSecurityAlert(data) {
        const template = email_templates_1.emailTemplates.securityAlert({ ...data, ipAddress: data.ipAddress });
        await this.sendEmail(data.email, template.subject, template.html, 'notification');
    }
    static async sendSystemAnnouncement(recipients, subject, title, message) {
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${title}</h2>
        <p>${message}</p>
        <hr>
        <p style="font-size: 12px; color: #999;">NileoPedia Team</p>
      </div>
    `;
        for (const email of recipients) {
            await this.sendEmail(email, subject, html, 'notification');
        }
    }
    static async sendEmail(to, subject, html, template) {
        if (!(0, email_utils_1.validateEmail)({ to, subject, html })) {
            throw new Error('Invalid email data');
        }
        const pendingLog = await prisma_1.default.emailLog.create({
            data: {
                recipient: to,
                subject,
                status: email_types_1.EmailStatus.PENDING,
            },
        });
        try {
            await this.sendViaResend(to, subject, html);
            await prisma_1.default.emailLog.update({
                where: { id: pendingLog.id },
                data: { status: email_types_1.EmailStatus.SENT, sentAt: new Date() },
            });
            logger_1.logger.info(`Email sent successfully to ${to}`, { type: template, subject });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            await prisma_1.default.emailLog.update({
                where: { id: pendingLog.id },
                data: { status: email_types_1.EmailStatus.FAILED, error: errorMessage },
            });
            logger_1.logger.error(`Email sending failed to ${to}`, { type: template, subject, error: errorMessage });
            throw error;
        }
    }
    static async sendViaResend(to, subject, html) {
        const resend = await getResendClient();
        const result = await resend.emails.send({
            from: getEmailFrom(),
            to,
            subject,
            html,
        });
        logger_1.logger.info(`Resend API response for ${to}`, {
            id: result.data?.id,
            status: 'queued',
        });
    }
    static getEmailProvider() {
        return EMAIL_PROVIDER;
    }
    static isConfigured() {
        return !!getApiKey() && !!getEmailFrom();
    }
    static async checkConnection() {
        try {
            const resend = await getResendClient();
            const configured = this.isConfigured();
            return {
                provider: 'resend',
                configured,
                status: configured ? 'connected' : 'disconnected',
            };
        }
        catch (error) {
            logger_1.logger.error('Email connection check failed', error);
            return {
                provider: 'resend',
                configured: false,
                status: 'disconnected',
            };
        }
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=email.service.js.map