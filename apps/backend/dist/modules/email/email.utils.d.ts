import { z } from 'zod';
export declare const emailSchema: z.ZodObject<{
    to: z.ZodString;
    subject: z.ZodString;
    html: z.ZodString;
}, "strip", z.ZodTypeAny, {
    to: string;
    subject: string;
    html: string;
}, {
    to: string;
    subject: string;
    html: string;
}>;
export declare const validatorOtpSchema: z.ZodObject<{
    email: z.ZodString;
    fullName: z.ZodString;
    otpCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    email: string;
    otpCode: string;
}, {
    fullName: string;
    email: string;
    otpCode: string;
}>;
export declare const passwordResetSchema: z.ZodObject<{
    email: z.ZodString;
    fullName: z.ZodString;
    resetLink: z.ZodString;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    email: string;
    resetLink: string;
}, {
    fullName: string;
    email: string;
    resetLink: string;
}>;
export declare const welcomeSchema: z.ZodObject<{
    email: z.ZodString;
    fullName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    email: string;
}, {
    fullName: string;
    email: string;
}>;
export declare const accountStatusSchema: z.ZodObject<{
    email: z.ZodString;
    fullName: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    email: string;
    reason?: string | undefined;
}, {
    fullName: string;
    email: string;
    reason?: string | undefined;
}>;
export declare const securityAlertSchema: z.ZodObject<{
    email: z.ZodString;
    fullName: z.ZodString;
    alertType: z.ZodString;
    description: z.ZodString;
    ipAddress: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    email: string;
    description: string;
    alertType: string;
    ipAddress?: string | undefined;
}, {
    fullName: string;
    email: string;
    description: string;
    alertType: string;
    ipAddress?: string | undefined;
}>;
export declare const systemAnnouncementSchema: z.ZodObject<{
    recipients: z.ZodArray<z.ZodString, "many">;
    subject: z.ZodString;
    title: z.ZodString;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    message: string;
    subject: string;
    recipients: string[];
}, {
    title: string;
    message: string;
    subject: string;
    recipients: string[];
}>;
export declare function validateEmail(data: unknown): boolean;
//# sourceMappingURL=email.utils.d.ts.map