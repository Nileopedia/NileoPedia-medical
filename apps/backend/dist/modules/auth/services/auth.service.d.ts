export declare class AuthService {
    private authRepository;
    private jwtService;
    constructor();
    register(registerDto: any): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            role: string;
            organization: string | null | undefined;
            specialization: string | null | undefined;
            status: string;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(loginDto: any): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            role: string;
            organization: string | null | undefined;
            specialization: string | null | undefined;
            status: string;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(refreshTokenDto: any): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map