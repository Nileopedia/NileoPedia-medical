import { Request } from 'express';
export interface AuditLogInput {
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    description?: string;
    metadata?: Record<string, unknown>;
}
export declare class AuditLogger {
    static log(req: Request, input: AuditLogInput): Promise<void>;
}
//# sourceMappingURL=audit.logger.d.ts.map