export declare class EmailService {
    static sendValidatorOtp(data: {
        email: string;
        fullName: string;
        otpCode: string;
    }): Promise<void>;
    static sendOtp(data: {
        email: string;
        fullName: string;
        otp: string;
    }): Promise<void>;
    static sendPasswordReset(data: {
        email: string;
        fullName: string;
        resetLink: string;
    }): Promise<void>;
    static sendWelcome(data: {
        email: string;
        fullName: string;
    }): Promise<void>;
    static sendAccountActivated(data: {
        email: string;
        fullName: string;
        reason?: string;
    }): Promise<void>;
    static sendAccountDeactivated(data: {
        email: string;
        fullName: string;
        reason?: string;
    }): Promise<void>;
    static sendSecurityAlert(data: {
        email: string;
        fullName: string;
        alertType: string;
        description: string;
        ipAddress?: string;
    }): Promise<void>;
    static sendSystemAnnouncement(recipients: string[], subject: string, title: string, message: string): Promise<void>;
    private static queueEmail;
    static sendEmail(to: string, subject: string, html: string): Promise<void>;
    private static sendViaResend;
    private static sendViaNodemailer;
}
//# sourceMappingURL=email.service.d.ts.map