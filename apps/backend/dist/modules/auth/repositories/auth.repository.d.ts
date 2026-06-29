export declare class AuthRepository {
    findByEmail(email: string): Promise<{
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
    } | null>;
    findById(id: string): Promise<{
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
    } | null>;
    create(userData: {
        fullName: string;
        email: string;
        password: string;
        role: 'MEDICAL_USER' | 'VALIDATOR' | 'ADMIN';
        specialization?: string;
        institution?: string;
    }): Promise<{
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
    }>;
    setRefreshToken(id: string, refreshToken: string | null): Promise<{
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
    }>;
    updatePassword(id: string, password: string): Promise<{
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
    }>;
    createPasswordReset(email: string, token: string, expiresAt: Date): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        token: string;
        expiresAt: Date;
        used: boolean;
    }>;
    findPasswordReset(token: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        token: string;
        expiresAt: Date;
        used: boolean;
    } | null>;
    markPasswordResetUsed(id: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        token: string;
        expiresAt: Date;
        used: boolean;
    }>;
    deleteExpiredPasswordResets(): Promise<import("@prisma/client").Prisma.BatchPayload>;
    createOtp(email: string, otp: string, expiresAt: Date): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        otp: string;
        expiresAt: Date;
        used: boolean;
    }>;
    findOtp(email: string, otp: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        otp: string;
        expiresAt: Date;
        used: boolean;
    } | null>;
    markOtpUsed(id: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        otp: string;
        expiresAt: Date;
        used: boolean;
    }>;
    deleteExpiredOtps(): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
//# sourceMappingURL=auth.repository.d.ts.map