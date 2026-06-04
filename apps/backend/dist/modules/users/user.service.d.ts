import { UpdateProfileDto, ChangePasswordDto, GetUsersQuery, GetUsersResult } from './user.types';
export declare class UserService {
    getCurrentUser(userId: string): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        specialization: string | null;
        institution: string | null;
        profileImage: string | null;
        isEmailVerified: boolean;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
    }>;
    updateProfile(userId: string, data: UpdateProfileDto): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        specialization: string | null;
        institution: string | null;
        profileImage: string | null;
        isEmailVerified: boolean;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
    }>;
    changePassword(userId: string, data: ChangePasswordDto): Promise<void>;
    getUserById(userId: string): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        specialization: string | null;
        institution: string | null;
        profileImage: string | null;
        isEmailVerified: boolean;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
        createdAt: Date;
    }>;
    getUsers(query: GetUsersQuery): Promise<GetUsersResult>;
    deactivateUser(userId: string): Promise<void>;
    activateUser(userId: string): Promise<void>;
}
//# sourceMappingURL=user.service.d.ts.map