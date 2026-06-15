export declare const emailTemplates: {
    validatorOtp: (data: {
        fullName: string;
        otpCode: string;
    }) => {
        subject: string;
        html: string;
    };
    otpLogin: (data: {
        fullName: string;
        otp: string;
    }) => {
        subject: string;
        html: string;
    };
    passwordReset: (data: {
        fullName: string;
        resetLink: string;
    }) => {
        subject: string;
        html: string;
    };
    welcome: (data: {
        fullName: string;
    }) => {
        subject: string;
        html: string;
    };
    accountActivated: (data: {
        fullName: string;
        reason?: string;
    }) => {
        subject: string;
        html: string;
    };
    accountDeactivated: (data: {
        fullName: string;
        reason?: string;
    }) => {
        subject: string;
        html: string;
    };
    securityAlert: (data: {
        fullName: string;
        alertType: string;
        description: string;
        ipAddress?: string;
    }) => {
        subject: string;
        html: string;
    };
};
export declare const emailConstants: {
    OTP_EXPIRY_MINUTES: number;
    RESET_LINK_EXPIRY_MINUTES: number;
    MAX_RETRY_ATTEMPTS: number;
    BACKOFF_DELAY_MS: number;
};
//# sourceMappingURL=email.templates.d.ts.map