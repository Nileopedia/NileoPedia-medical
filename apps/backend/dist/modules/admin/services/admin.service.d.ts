export declare class AdminService {
    getUsers(): Promise<{
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        id: string;
        createdAt: Date;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
    }[]>;
    suspendUser(userId: string): Promise<void>;
    activateUser(userId: string): Promise<void>;
    deleteUser(userId: string): Promise<void>;
    getAnalytics(): Promise<{
        totalUsers: number;
        totalResponses: number;
        pendingReviews: number;
        approvedResponses: number;
    }>;
}
//# sourceMappingURL=admin.service.d.ts.map