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
        this.oAuth2Client = new google_auth_library_1.OAuth2Client(env_1.CONFIG.GOOGLE_CLIENT_ID, env_1.CONFIG.GOOGLE_CLIENT_SECRET, env_1.CONFIG.GOOGLE_REDIRECT_URI);
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
            // Get user info from Google
            const ticket = await this.oAuth2Client.verifyIdToken({
                idToken: tokens.id_token,
                audience: env_1.CONFIG.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new Error('Invalid Google token');
            }
            const { email, given_name, family_name, picture, sub } = payload;
            const fullName = `${given_name || ''} ${family_name || ''}`.trim();
            if (!email) {
                throw new Error('Email not provided by Google');
            }
            // Check if user already exists
            let user = await this.authRepository.findByEmail(email);
            if (!user) {
                // Create new user
                user = await this.authRepository.create({
                    fullName,
                    email,
                    passwordHash: '', // No password for Google users initially
                    roleId: '00000000-0000-0000-0000-000000000001', // Default role - should be fetched properly
                    organization: '',
                    specialization: '',
                    status: 'ACTIVE',
                    profilePicture: picture,
                    isGoogleUser: true,
                    googleId: sub
                });
            }
            else {
                // Update existing user's Google info if needed
                await this.authRepository.update(user.id, {
                    profilePicture: picture,
                    isGoogleUser: true,
                    googleId: sub
                });
                // Fetch updated user
                const updatedUser = await this.authRepository.findById(user.id);
                if (updatedUser) {
                    user = updatedUser;
                }
            }
            if (!user) {
                throw new Error('Failed to create or retrieve user');
            }
            // Generate tokens
            const accessToken = this.jwtService.generateAccessToken({
                id: user.id,
                email: user.email,
                role: user.roleId,
            });
            const refreshToken = this.jwtService.generateRefreshToken({
                id: user.id,
            });
            // Store refresh token
            await this.authRepository.setRefreshToken(user.id, refreshToken);
            return {
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.roleId,
                    organization: user.organization,
                    specialization: user.specialization,
                    status: user.status,
                    profilePicture: user.profilePicture,
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