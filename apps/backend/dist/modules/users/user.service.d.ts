import { UpdateProfileDto, ChangePasswordDto, GetUsersQuery, GetUsersResult } from './user.types';
export declare class UserService {
    getCurrentUser(userId: string): Promise<{
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        id: string;
        specialization: string | null;
        institution: string | null;
        profileImage: string | null;
        isEmailVerified: boolean;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
    }>;
    updateProfile(userId: string, data: UpdateProfileDto): Promise<{
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        id: string;
        specialization: string | null;
        institution: string | null;
        profileImage: string | null;
        isEmailVerified: boolean;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
    }>;
    changePassword(userId: string, data: ChangePasswordDto): Promise<void>;
    getUserById(userId: string): Promise<{
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        id: string;
        createdAt: Date;
        specialization: string | null;
        institution: string | null;
        profileImage: string | null;
        isEmailVerified: boolean;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
    }>;
    getUsers(query: GetUsersQuery): Promise<GetUsersResult>;
    deactivateUser(userId: string): Promise<void>;
    activateUser(userId: string): Promise<void>;
}
//# sourceMappingURL=user.service.d.ts.map