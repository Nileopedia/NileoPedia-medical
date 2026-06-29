export declare class AuthRepository {
    findByEmail(email: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        fullName: string;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        refreshToken: string | null;
        specialization: string | null;
        institution: string | null;
        profileImage: string | null;
        bio: string | null;
        isEmailVerified: boolean;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
    } | null>;
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        fullName: string;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        refreshToken: string | null;
        specialization: string | null;
        institution: string | null;
        profileImage: string | null;
        bio: string | null;
        isEmailVerified: boolean;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
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
        email: string;
        fullName: string;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        refreshToken: string | null;
        specialization: string | null;
        institution: string | null;
        profileImage: string | null;
        bio: string | null;
        isEmailVerified: boolean;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
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
        email: string;
        fullName: string;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        refreshToken: string | null;
        specialization: string | null;
        institution: string | null;
        profileImage: string | null;
        bio: string | null;
        isEmailVerified: boolean;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
    }>;
    setRefreshToken(id: string, refreshToken: string | null): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        fullName: string;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        refreshToken: string | null;
        specialization: string | null;
        institution: string | null;
        profileImage: string | null;
        bio: string | null;
        isEmailVerified: boolean;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
    }>;
    updatePassword(id: string, password: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        fullName: string;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        refreshToken: string | null;
        specialization: string | null;
        institution: string | null;
        profileImage: string | null;
        bio: string | null;
        isEmailVerified: boolean;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
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