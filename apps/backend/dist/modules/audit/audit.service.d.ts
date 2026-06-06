import { CreateAuditLogDto, GetAuditLogsQuery, GetAuditLogsResult, SecurityEventFilters } from './audit.types';
export declare class AuditService {
    createAuditLog(data: CreateAuditLogDto): Promise<{
        id: string;
        userId: string | null;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        action: string;
        entityType: string;
        entityId: string | null;
        description: string | null;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
    getAuditLogs(query: GetAuditLogsQuery): Promise<GetAuditLogsResult>;
    getAuditLogById(id: string): Promise<({
        user: {
            fullName: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            id: string;
        } | null;
    } & {
        id: string;
        userId: string | null;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        action: string;
        entityType: string;
        entityId: string | null;
        description: string | null;
        ipAddress: string | null;
        userAgent: string | null;
    }) | null>;
    getUserActivityLogs(userId: string, query: {
        page: number;
        limit: number;
    }): Promise<{
        logs: {
            id: string;
            userId: string | null;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            action: string;
            entityType: string;
            entityId: string | null;
            description: string | null;
            ipAddress: string | null;
            userAgent: string | null;
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
                fullName: string;
                email: string;
                role: import("@prisma/client").$Enums.UserRole;
                id: string;
            } | null;
        } & {
            id: string;
            userId: string | null;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            action: string;
            entityType: string;
            entityId: string | null;
            description: string | null;
            ipAddress: string | null;
            userAgent: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getSecurityEvents(query: SecurityEventFilters): Promise<{
        logs: ({
            user: {
                fullName: string;
                email: string;
                role: import("@prisma/client").$Enums.UserRole;
                id: string;
            } | null;
        } & {
            id: string;
            userId: string | null;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            action: string;
            entityType: string;
            entityId: string | null;
            description: string | null;
            ipAddress: string | null;
            userAgent: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
//# sourceMappingURL=audit.service.d.ts.map