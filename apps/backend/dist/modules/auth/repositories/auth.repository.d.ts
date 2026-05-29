export declare class AuthRepository {
    findByEmail(email: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        refreshToken: string | null;
        specialization: string | null;
        institution: string | null;
        profileImage: string | null;
        isEmailVerified: boolean;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
    } | null>;
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        refreshToken: string | null;
        specialization: string | null;
        institution: string | null;
        profileImage: string | null;
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
        fullName: string;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        refreshToken: string | null;
        specialization: string | null;
        institution: string | null;
        profileImage: string | null;
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
        fullName: string;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        refreshToken: string | null;
        specialization: string | null;
        institution: string | null;
        profileImage: string | null;
        isEmailVerified: boolean;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
    }>;
    setRefreshToken(id: string, refreshToken: string | null): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        refreshToken: string | null;
        specialization: string | null;
        institution: string | null;
        profileImage: string | null;
        isEmailVerified: boolean;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
    }>;
}
//# sourceMappingURL=auth.repository.d.ts.map