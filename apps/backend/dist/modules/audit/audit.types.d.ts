import { AuditLog } from '@prisma/client';
export interface CreateAuditLogDto {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
}
export interface GetAuditLogsQuery {
    page: number;
    limit: number;
    action?: string;
    entityType?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
}
export interface GetAuditLogsResult {
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface SecurityEventFilters {
    page: number;
    limit: number;
}
//# sourceMappingURL=audit.types.d.ts.map