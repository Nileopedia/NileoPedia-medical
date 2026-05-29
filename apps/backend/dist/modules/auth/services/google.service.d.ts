export declare class GoogleAuthService {
    private authRepository;
    private jwtService;
    private oAuth2Client;
    constructor();
    getAuthUrl(): Promise<string>;
    handleGoogleCallback(code: string): Promise<{
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
//# sourceMappingURL=google.service.d.ts.map