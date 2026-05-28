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
            role: string;
            organization: string | null | undefined;
            specialization: string | null | undefined;
            status: string;
            profilePicture: string | null | undefined;
        };
        accessToken: string;
        refreshToken: string;
    }>;
}
//# sourceMappingURL=google.service.d.ts.map