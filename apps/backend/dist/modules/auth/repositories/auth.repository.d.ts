export declare class AuthRepository {
    findByEmail(email: string): Promise<{
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findById(id: string): Promise<{
        id: string;
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
        createdAt: Date;
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
        id: string;
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
        createdAt: Date;
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
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    setRefreshToken(id: string, refreshToken: string | null): Promise<{
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    updatePassword(id: string, password: string): Promise<{
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    createPasswordReset(email: string, token: string, expiresAt: Date): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        token: string;
        expiresAt: Date;
        used: boolean;
    }>;
    findPasswordReset(token: string): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        token: string;
        expiresAt: Date;
        used: boolean;
    } | null>;
    markPasswordResetUsed(id: string): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        token: string;
        expiresAt: Date;
        used: boolean;
    }>;
    deleteExpiredPasswordResets(): Promise<import("@prisma/client").Prisma.BatchPayload>;
    createOtp(email: string, otp: string, expiresAt: Date): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        otp: string;
        expiresAt: Date;
        used: boolean;
    }>;
    findOtp(email: string, otp: string): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        otp: string;
        expiresAt: Date;
        used: boolean;
    } | null>;
    markOtpUsed(id: string): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        otp: string;
        expiresAt: Date;
        used: boolean;
    }>;
    deleteExpiredOtps(): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
//# sourceMappingURL=auth.repository.d.ts.map