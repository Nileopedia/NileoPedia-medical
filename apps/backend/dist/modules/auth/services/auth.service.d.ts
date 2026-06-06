export declare class AuthService {
    private authRepository;
    private jwtService;
    constructor();
    register(registerDto: {
        fullName: string;
        email: string;
        password: string;
        role: 'MEDICAL_USER' | 'VALIDATOR';
        institution?: string;
        specialization?: string;
    }): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            institution: string | null;
            specialization: string | null;
            accountStatus: import("@prisma/client").$Enums.AccountStatus;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(loginDto: {
        email: string;
        password: string;
    }): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            institution: string | null;
            specialization: string | null;
            accountStatus: import("@prisma/client").$Enums.AccountStatus;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(refreshTokenDto: {
        refreshToken: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<void>;
    requiresOtp(email: string): Promise<boolean>;
    verifyOtp(email: string, otp: string): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            institution: string | null;
            specialization: string | null;
            accountStatus: import("@prisma/client").$Enums.AccountStatus;
        };
        accessToken: string;
        refreshToken: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map