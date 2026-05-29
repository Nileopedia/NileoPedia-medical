"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailConstants = exports.emailTemplates = void 0;
exports.emailTemplates = {
    validatorOtp: (data) => ({
        subject: 'Your NileoPedia Verification Code',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>NileoPedia Verification</h2>
        <p>Hello ${data.fullName},</p>
        <p>Your verification code is:</p>
        <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
          ${data.otpCode}
        </div>
        <p style="color: #666;">This code expires in 10 minutes.</p>
        <p>If you did not request this code, please ignore this email.</p>
        <hr>
        <p style="font-size: 12px; color: #999;">NileoPedia Security Team</p>
      </div>
    `,
    }),
    passwordReset: (data) => ({
        subject: 'Reset Your NileoPedia Password',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${data.fullName},</p>
        <p>Click below to reset your password:</p>
        <p><a href="${data.resetLink}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
        <p style="color: #666;">This link expires in 30 minutes.</p>
        <hr>
        <p style="font-size: 12px; color: #999;">NileoPedia Security</p>
      </div>
    `,
    }),
    welcome: (data) => ({
        subject: 'Welcome to NileoPedia',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to NileoPedia!</h2>
        <p>Hello ${data.fullName},</p>
        <p>Your account has been created successfully. You can now access the medical research platform.</p>
        <p><a href="${process.env.FRONTEND_URL}/login">Login to your account</a></p>
        <hr>
        <p style="font-size: 12px; color: #999;">NileoPedia Team</p>
      </div>
    `,
    }),
    accountActivated: (data) => ({
        subject: 'Your NileoPedia Account Has Been Activated',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Account Activated</h2>
        <p>Hello ${data.fullName},</p>
        <p>Your account has been activated by an administrator.</p>
        ${data.reason ? `<p>Reason: ${data.reason}</p>` : ''}
        <p>You can now <a href="${process.env.FRONTEND_URL}/login">login to your account</a>.</p>
        <hr>
        <p style="font-size: 12px; color: #999;">NileoPedia Team</p>
      </div>
    `,
    }),
    accountDeactivated: (data) => ({
        subject: 'Your NileoPedia Account Has Been Deactivated',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Account Deactivated</h2>
        <p>Hello ${data.fullName},</p>
        <p>Your account has been deactivated by an administrator.</p>
        ${data.reason ? `<p>Reason: ${data.reason}</p>` : ''}
        <p>If you believe this is an error, please contact support.</p>
        <hr>
        <p style="font-size: 12px; color: #999;">NileoPedia Team</p>
      </div>
    `,
    }),
    securityAlert: (data) => ({
        subject: `Security Alert: ${data.alertType}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border-left: 4px solid #dc3545;">
        <h2>Security Alert</h2>
        <p>Hello ${data.fullName},</p>
        <p><strong>${data.alertType}</strong></p>
        <p>${data.description}</p>
        ${data.ipAddress ? `<p>IP Address: ${data.ipAddress}</p>` : ''}
        <p style="color: #666;">If you did not perform this action, please contact support immediately.</p>
        <hr>
        <p style="font-size: 12px; color: #999;">NileoPedia Security Team</p>
      </div>
    `,
    }),
};
exports.emailConstants = {
    OTP_EXPIRY_MINUTES: 10,
    RESET_LINK_EXPIRY_MINUTES: 30,
    MAX_RETRY_ATTEMPTS: 3,
    BACKOFF_DELAY_MS: 2000,
};
//# sourceMappingURL=email.templates.js.map