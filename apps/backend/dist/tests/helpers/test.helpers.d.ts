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
    email: string;
    fullName: string;
    password: string;
    role: import("@prisma/client").$Enums.UserRole;
    refreshToken: string | null;
    id: string;
    createdAt: Date;
    specialization: string | null;
    institution: string | null;
    profileImage: string | null;
    isEmailVerified: boolean;
    accountStatus: import("@prisma/client").$Enums.AccountStatus;
    updatedAt: Date;
}>;
export declare const createTestAdmin: () => Promise<{
    email: string;
    fullName: string;
    password: string;
    role: import("@prisma/client").$Enums.UserRole;
    refreshToken: string | null;
    id: string;
    createdAt: Date;
    specialization: string | null;
    institution: string | null;
    profileImage: string | null;
    isEmailVerified: boolean;
    accountStatus: import("@prisma/client").$Enums.AccountStatus;
    updatedAt: Date;
}>;
export declare const createTestValidator: () => Promise<{
    email: string;
    fullName: string;
    password: string;
    role: import("@prisma/client").$Enums.UserRole;
    refreshToken: string | null;
    id: string;
    createdAt: Date;
    specialization: string | null;
    institution: string | null;
    profileImage: string | null;
    isEmailVerified: boolean;
    accountStatus: import("@prisma/client").$Enums.AccountStatus;
    updatedAt: Date;
}>;
export declare const createTestMedicalUser: () => Promise<{
    email: string;
    fullName: string;
    password: string;
    role: import("@prisma/client").$Enums.UserRole;
    refreshToken: string | null;
    id: string;
    createdAt: Date;
    specialization: string | null;
    institution: string | null;
    profileImage: string | null;
    isEmailVerified: boolean;
    accountStatus: import("@prisma/client").$Enums.AccountStatus;
    updatedAt: Date;
}>;
export declare const createAuthHeader: (token: string) => {
    Authorization: string;
};
export declare const cleanupDatabase: () => Promise<void>;
//# sourceMappingURL=test.helpers.d.ts.map