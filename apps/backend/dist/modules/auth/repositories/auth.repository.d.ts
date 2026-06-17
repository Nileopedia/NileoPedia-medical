export declare class AuthRepository {
    findByEmail(email: string): Promise<{
        fullName: string;
        email: string;
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
    } | null>;
    findById(id: string): Promise<{
        fullName: string;
        email: string;
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
    } | null>;
    create(userData: {
        fullName: string;
        email: string;
        password: string;
        role: 'MEDICAL_USER' | 'VALIDATOR' | 'ADMIN';
        specialization?: string;
        institution?: string;
    }): Promise<{
        fullName: string;
        email: string;
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
    update(id: string, userData: Partial<{
        fullName: string;
        email: string;
        password: string;
        specialization: string;
        institution: string;
        profileImage: string;
        isEmailVerified: boolean;
        accountStatus: 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
    }>): Promise<{
        fullName: string;
        email: string;
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
    setRefreshToken(id: string, refreshToken: string | null): Promise<{
        fullName: string;
        email: string;
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
    updatePassword(id: string, password: string): Promise<{
        fullName: string;
        email: string;
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
    createPasswordReset(email: string, token: string, expiresAt: Date): Promise<{
        email: string;
        token: string;
        id: string;
        createdAt: Date;
        expiresAt: Date;
        used: boolean;
    }>;
    findPasswordReset(token: string): Promise<{
        email: string;
        token: string;
        id: string;
        createdAt: Date;
        expiresAt: Date;
        used: boolean;
    } | null>;
    markPasswordResetUsed(id: string): Promise<{
        email: string;
        token: string;
        id: string;
        createdAt: Date;
        expiresAt: Date;
        used: boolean;
    }>;
    deleteExpiredPasswordResets(): Promise<import("@prisma/client").Prisma.BatchPayload>;
    createOtp(email: string, otp: string, expiresAt: Date): Promise<{
        email: string;
        otp: string;
        id: string;
        createdAt: Date;
        expiresAt: Date;
        used: boolean;
    }>;
    findOtp(email: string, otp: string): Promise<{
        email: string;
        otp: string;
        id: string;
        createdAt: Date;
        expiresAt: Date;
        used: boolean;
    } | null>;
    markOtpUsed(id: string): Promise<{
        email: string;
        otp: string;
        id: string;
        createdAt: Date;
        expiresAt: Date;
        used: boolean;
    }>;
    deleteExpiredOtps(): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
//# sourceMappingURL=auth.repository.d.ts.map