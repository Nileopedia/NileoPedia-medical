import { CreateAuditLogDto, GetAuditLogsQuery, GetAuditLogsResult, SecurityEventFilters } from './audit.types';
export declare class AuditService {
    createAuditLog(data: CreateAuditLogDto): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        ipAddress: string | null;
        userId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        action: string;
        entityType: string;
        entityId: string | null;
        userAgent: string | null;
    }>;
    getAuditLogs(query: GetAuditLogsQuery): Promise<GetAuditLogsResult>;
    getAuditLogById(id: string): Promise<({
        user: {
            id: string;
            email: string;
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
        } | null;
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        ipAddress: string | null;
        userId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        action: string;
        entityType: string;
        entityId: string | null;
        userAgent: string | null;
    }) | null>;
    getUserActivityLogs(userId: string, query: {
        page: number;
        limit: number;
    }): Promise<{
        logs: {
            description: string | null;
            id: string;
            createdAt: Date;
            ipAddress: string | null;
            userId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            action: string;
            entityType: string;
            entityId: string | null;
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
                id: string;
                email: string;
                fullName: string;
                role: import("@prisma/client").$Enums.UserRole;
            } | null;
        } & {
            description: string | null;
            id: string;
            createdAt: Date;
            ipAddress: string | null;
            userId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            action: string;
            entityType: string;
            entityId: string | null;
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
                id: string;
                email: string;
                fullName: string;
                role: import("@prisma/client").$Enums.UserRole;
            } | null;
        } & {
            description: string | null;
            id: string;
            createdAt: Date;
            ipAddress: string | null;
            userId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            action: string;
            entityType: string;
            entityId: string | null;
            userAgent: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
//# sourceMappingURL=audit.service.d.ts.map