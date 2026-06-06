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
exports.EmailService = void 0;
const email_types_1 = require("./email.types");
const email_templates_1 = require("./email.templates");
const email_utils_1 = require("./email.utils");
const prisma_1 = __importDefault(require("../../config/prisma"));
const logger_1 = require("../../config/logger");
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@nileopedia.com';
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'resend';
let resendClient = null;
async function getResendClient() {
    if (!resendClient && RESEND_API_KEY) {
        const { Resend } = await Promise.resolve().then(() => __importStar(require('resend')));
        resendClient = new Resend(RESEND_API_KEY);
    }
    return resendClient;
}
class EmailService {
    static async sendValidatorOtp(data) {
        const template = email_templates_1.emailTemplates.validatorOtp(data);
        await this.queueEmail(data.email, template.subject, template.html, 'otp');
    }
    static async sendPasswordReset(data) {
        const template = email_templates_1.emailTemplates.passwordReset(data);
        await this.queueEmail(data.email, template.subject, template.html, 'passwordReset');
    }
    static async sendWelcome(data) {
        const template = email_templates_1.emailTemplates.welcome(data);
        await this.queueEmail(data.email, template.subject, template.html, 'notification');
    }
    static async sendAccountActivated(data) {
        const template = email_templates_1.emailTemplates.accountActivated(data);
        await this.queueEmail(data.email, template.subject, template.html, 'notification');
    }
    static async sendAccountDeactivated(data) {
        const template = email_templates_1.emailTemplates.accountDeactivated(data);
        await this.queueEmail(data.email, template.subject, template.html, 'notification');
    }
    static async sendSecurityAlert(data) {
        const template = email_templates_1.emailTemplates.securityAlert({ ...data, ipAddress: data.ipAddress });
        await this.queueEmail(data.email, template.subject, template.html, 'notification');
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
        const { emailQueue } = await Promise.resolve().then(() => __importStar(require('../../jobs/queues')));
        const jobs = recipients.map((email) => ({
            name: 'announcement',
            data: { to: email, subject, html, template: 'notification', data: { title, message } },
        }));
        await emailQueue.addBulk(jobs);
    }
    static async queueEmail(to, subject, html, template) {
        if (!(0, email_utils_1.validateEmail)({ to, subject, html })) {
            throw new Error('Invalid email data');
        }
        await prisma_1.default.emailLog.create({
            data: {
                recipient: to,
                subject,
                status: email_types_1.EmailStatus.PENDING,
            },
        });
        const { emailQueue } = await Promise.resolve().then(() => __importStar(require('../../jobs/queues')));
        const jobData = { to, subject, template, html };
        await emailQueue.add('send', jobData);
    }
    static async sendEmail(to, subject, html) {
        if (EMAIL_PROVIDER === 'resend') {
            await this.sendViaResend(to, subject, html);
        }
        else {
            await this.sendViaNodemailer(to, subject, html);
        }
    }
    static async sendViaResend(to, subject, html) {
        try {
            const resend = await getResendClient();
            if (!resend) {
                throw new Error('Resend client not configured');
            }
            await resend.emails.send({
                from: EMAIL_FROM,
                to,
                subject,
                html,
            });
        }
        catch (error) {
            logger_1.logger.error('Resend email failed, falling back to Nodemailer', error);
            await this.sendViaNodemailer(to, subject, html);
        }
    }
    static async sendViaNodemailer(to, subject, html) {
        const nodemailer = await Promise.resolve().then(() => __importStar(require('nodemailer')));
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'localhost',
            port: parseInt(process.env.SMTP_PORT || '1025'),
        });
        await transporter.sendMail({
            from: EMAIL_FROM,
            to,
            subject,
            html,
        });
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=email.service.js.map