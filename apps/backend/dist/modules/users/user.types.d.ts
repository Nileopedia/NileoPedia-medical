import { User } from '@prisma/client';
export type UserProfile = Omit<User, 'password' | 'refreshToken'>;
export interface UpdateProfileDto {
    fullName?: string;
    specialization?: string;
    institution?: string;
    profileImage?: string;
}
export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export interface GetUsersQuery {
    page: number;
    limit: number;
    search?: string;
}
export interface GetUsersResult {
    users: UserProfile[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
//# sourceMappingURL=user.types.d.ts.map