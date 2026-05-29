export declare enum EmailType {
    VALIDATOR_OTP = "VALIDATOR_OTP",
    PASSWORD_RESET = "PASSWORD_RESET",
    WELCOME = "WELCOME",
    ACCOUNT_ACTIVATED = "ACCOUNT_ACTIVATED",
    ACCOUNT_DEACTIVATED = "ACCOUNT_DEACTIVATED",
    SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT",
    SECURITY_ALERT = "SECURITY_ALERT"
}
export declare enum EmailStatus {
    PENDING = "PENDING",
    SENT = "SENT",
    FAILED = "FAILED"
}
export interface ValidatorOtpEmailData {
    email: string;
    fullName: string;
    otpCode: string;
}
export interface PasswordResetEmailData {
    email: string;
    fullName: string;
    resetLink: string;
}
export interface WelcomeEmailData {
    email: string;
    fullName: string;
}
export interface AccountStatusEmailData {
    email: string;
    fullName: string;
    reason?: string;
}
export interface SecurityAlertEmailData {
    email: string;
    fullName: string;
    alertType: string;
    description: string;
    ipAddress?: string;
    timestamp?: Date;
}
export interface SystemAnnouncementData {
    recipients: string[];
    subject: string;
    title: string;
    message: string;
}
export interface EmailJobData {
    to: string;
    subject: string;
    html: string;
    type: EmailType;
}
//# sourceMappingURL=email.types.d.ts.map