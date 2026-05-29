"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuthService = void 0;
const google_auth_library_1 = require("google-auth-library");
const auth_repository_1 = require("../repositories/auth.repository");
const jwt_service_1 = require("./jwt.service");
const env_1 = require("../../../config/env");
const logger_1 = require("../../../config/logger");
class GoogleAuthService {
    constructor() {
        this.authRepository = new auth_repository_1.AuthRepository();
        this.jwtService = new jwt_service_1.JwtService();
        this.oAuth2Client = new google_auth_library_1.OAuth2Client(env_1.CONFIG.GOOGLE_CLIENT_ID, env_1.CONFIG.GOOGLE_CLIENT_SECRET, env_1.CONFIG.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/google/callback');
    }
    async getAuthUrl() {
        const authUrl = this.oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['profile', 'email'],
        });
        return authUrl;
    }
    async handleGoogleCallback(code) {
        try {
            const { tokens } = await this.oAuth2Client.getToken(code);
            this.oAuth2Client.setCredentials(tokens);
            const ticket = await this.oAuth2Client.verifyIdToken({
                idToken: tokens.id_token,
                audience: env_1.CONFIG.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new Error('Invalid Google token');
            }
            const { email, given_name, family_name, sub } = payload;
            const fullName = `${given_name || ''} ${family_name || ''}`.trim();
            if (!email) {
                throw new Error('Email not provided by Google');
            }
            let user = await this.authRepository.findByEmail(email);
            if (!user) {
                user = await this.authRepository.create({
                    fullName,
                    email,
                    password: '',
                    role: 'MEDICAL_USER',
                });
            }
            if (!user) {
                throw new Error('Failed to create or retrieve user');
            }
            const accessToken = this.jwtService.generateAccessToken({
                id: user.id,
                email: user.email,
                role: user.role,
            });
            const refreshToken = this.jwtService.generateRefreshToken({
                id: user.id,
            });
            await this.authRepository.setRefreshToken(user.id, refreshToken);
            return {
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                    institution: user.institution,
                    specialization: user.specialization,
                    accountStatus: user.accountStatus,
                },
                accessToken,
                refreshToken,
            };
        }
        catch (error) {
            logger_1.logger.error('Google OAuth callback error:', error);
            throw error;
        }
    }
}
exports.GoogleAuthService = GoogleAuthService;
//# sourceMappingURL=google.service.js.map