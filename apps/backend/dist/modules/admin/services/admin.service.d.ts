export declare class AdminService {
    getUsers(page?: number, limit?: number, search?: string): Promise<{
        users: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fullName: string;
            email: string;
            password: string;
            role: import("@prisma/client").$Enums.UserRole;
            specialization: string | null;
            institution: string | null;
            profileImage: string | null;
            isEmailVerified: boolean;
            accountStatus: import("@prisma/client").$Enums.AccountStatus;
            refreshToken: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    suspendUser(userId: string, adminId?: string): Promise<void>;
    activateUser(userId: string): Promise<void>;
    deleteUser(userId: string): Promise<void>;
    resetPassword(userId: string): Promise<{
        success: boolean;
    }>;
    getValidators(page?: number, limit?: number, search?: string): Promise<{
        validators: {
            reviewsCompleted: number;
            approvalRate: number;
            id: string;
            fullName: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            specialization: string | null;
            institution: string | null;
            accountStatus: import("@prisma/client").$Enums.AccountStatus;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    addValidator(data: {
        fullName: string;
        email: string;
        password?: string;
        specialization?: string;
        institution?: string;
    }): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    removeValidator(validatorId: string): Promise<void>;
    getAnalytics(): Promise<{
        totalUsers: number;
        totalValidators: number;
        totalDocuments: number;
        totalResponses: number;
        pendingReviews: number;
        approvedResponses: number;
        rejectedResponses: number;
        totalVectors: number;
        queriesPerDay: Record<string, number>;
        documentsPerDay: Record<string, number>;
        validationTrends: Record<string, {
            approved: number;
            rejected: number;
        }>;
    }>;
    getRecentValidations(limit?: number): Promise<{
        id: string;
        question: string;
        response: string;
        validator: string;
        decision: string;
        comments: string | null;
        date: string;
    }[]>;
    getSettings(): Promise<{
        systemNotifications: string;
        emailAlerts: string;
        autoBackup: string;
        maintenanceMode: string;
    }>;
    updateSettings(settings: Record<string, any>): Promise<Record<string, any>>;
    getAiActivity(page?: number, limit?: number, search?: string, status?: string): Promise<{
        activities: {
            id: string;
            question: string;
            model: string;
            responseTime: number;
            documentsUsed: number;
            status: string;
            date: string;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
//# sourceMappingURL=admin.service.d.ts.map