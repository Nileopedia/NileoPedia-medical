import { UserRole } from '@prisma/client';
export declare const generateTestJWT: (payload: {
    id: string;
    email: string;
    role: string;
}) => string;
export declare const createTestUser: (data: {
    email?: string;
    fullName?: string;
    role?: UserRole;
    password?: string;
}) => Promise<{
    id: string;
    createdAt: Date;
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
    updatedAt: Date;
}>;
export declare const createTestAdmin: () => Promise<{
    id: string;
    createdAt: Date;
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
    updatedAt: Date;
}>;
export declare const createTestValidator: () => Promise<{
    id: string;
    createdAt: Date;
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
    updatedAt: Date;
}>;
export declare const createTestMedicalUser: () => Promise<{
    id: string;
    createdAt: Date;
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
    updatedAt: Date;
}>;
export declare const createAuthHeader: (token: string) => {
    Authorization: string;
};
export declare const cleanupDatabase: () => Promise<void>;
//# sourceMappingURL=test.helpers.d.ts.map