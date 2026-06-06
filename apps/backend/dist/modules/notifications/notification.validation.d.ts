import { z } from 'zod';
export declare const createSystemNotificationSchema: z.ZodObject<{
    title: z.ZodString;
    message: z.ZodString;
    targetRoles: z.ZodArray<z.ZodEnum<["MEDICAL_USER", "VALIDATOR", "ADMIN"]>, "many">;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    title: string;
    targetRoles: ("VALIDATOR" | "ADMIN" | "MEDICAL_USER")[];
    metadata?: Record<string, unknown> | undefined;
}, {
    message: string;
    title: string;
    targetRoles: ("VALIDATOR" | "ADMIN" | "MEDICAL_USER")[];
    metadata?: Record<string, unknown> | undefined;
}>;
export declare const getNotificationsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
//# sourceMappingURL=notification.validation.d.ts.map