import { UpdateProfileDto, ChangePasswordDto, GetUsersQuery, GetUsersResult } from './user.types';
export declare class UserService {
    getCurrentUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        specialization: string | null;
        institution: string | null;
        profileImage: string | null;
        bio: string | null;
        isEmailVerified: boolean;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
    }>;
    updateProfile(userId: string, data: UpdateProfileDto): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        specialization: string | null;
        institution: string | null;
        profileImage: string | null;
        bio: string | null;
        isEmailVerified: boolean;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
    }>;
    changePassword(userId: string, data: ChangePasswordDto): Promise<void>;
    getUserById(userId: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        specialization: string | null;
        institution: string | null;
        profileImage: string | null;
        isEmailVerified: boolean;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
    }>;
    getUsers(query: GetUsersQuery): Promise<GetUsersResult>;
    deactivateUser(userId: string): Promise<void>;
    activateUser(userId: string): Promise<void>;
    getPreferences(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        theme: string;
        language: string;
        sidebarCollapsed: boolean;
        responseStyle: string;
        citationEnabled: boolean;
        emailNotifications: boolean;
        systemNotifications: boolean;
        uploadNotifications: boolean;
        validationNotifications: boolean;
    } | {
        theme: string;
        language: string;
        sidebarCollapsed: boolean;
        responseStyle: string;
        citationEnabled: boolean;
        emailNotifications: boolean;
        systemNotifications: boolean;
        uploadNotifications: boolean;
        validationNotifications: boolean;
    }>;
    updatePreferences(userId: string, data: {
        theme?: string;
        language?: string;
        sidebarCollapsed?: boolean;
        responseStyle?: string;
        citationEnabled?: boolean;
        emailNotifications?: boolean;
        systemNotifications?: boolean;
        uploadNotifications?: boolean;
        validationNotifications?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        theme: string;
        language: string;
        sidebarCollapsed: boolean;
        responseStyle: string;
        citationEnabled: boolean;
        emailNotifications: boolean;
        systemNotifications: boolean;
        uploadNotifications: boolean;
        validationNotifications: boolean;
    }>;
    createValidator(data: {
        fullName: string;
        email: string;
        password?: string;
        specialization?: string;
        institution?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        specialization: string | null;
        institution: string | null;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
    }>;
}
//# sourceMappingURL=user.service.d.ts.map