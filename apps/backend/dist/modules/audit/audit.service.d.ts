import { CreateAuditLogDto, GetAuditLogsQuery, GetAuditLogsResult, SecurityEventFilters } from './audit.types';
export declare class AuditService {
    createAuditLog(data: CreateAuditLogDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        action: string;
        entityType: string;
        entityId: string | null;
        description: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getAuditLogs(query: GetAuditLogsQuery): Promise<GetAuditLogsResult>;
    getAuditLogById(id: string): Promise<({
        user: {
            id: string;
            fullName: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        action: string;
        entityType: string;
        entityId: string | null;
        description: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue;
    }) | null>;
    getUserActivityLogs(userId: string, query: {
        page: number;
        limit: number;
    }): Promise<{
        logs: {
            id: string;
            createdAt: Date;
            userId: string | null;
            action: string;
            entityType: string;
            entityId: string | null;
            description: string | null;
            ipAddress: string | null;
            userAgent: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getValidationActivity(query: {
        page: number;
        limit: number;
    }): Promise<{
        logs: ({
            user: {
                id: string;
                fullName: string;
                email: string;
                role: import("@prisma/client").$Enums.UserRole;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            userId: string | null;
            action: string;
            entityType: string;
            entityId: string | null;
            description: string | null;
            ipAddress: string | null;
            userAgent: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getSecurityEvents(query: SecurityEventFilters): Promise<{
        logs: ({
            user: {
                id: string;
                fullName: string;
                email: string;
                role: import("@prisma/client").$Enums.UserRole;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            userId: string | null;
            action: string;
            entityType: string;
            entityId: string | null;
            description: string | null;
            ipAddress: string | null;
            userAgent: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
//# sourceMappingURL=audit.service.d.ts.map