"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const auth_repository_1 = require("../repositories/auth.repository");
const jwt_service_1 = require("./jwt.service");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class AuthService {
    constructor() {
        this.authRepository = new auth_repository_1.AuthRepository();
        this.jwtService = new jwt_service_1.JwtService();
    }
    async register(registerDto) {
        const { fullName, email, password, role, organization, specialization } = registerDto;
        // Check if user already exists
        const existingUser = await this.authRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        // Create user
        const user = await this.authRepository.create({
            fullName,
            email,
            passwordHash,
            roleId: role, // Assuming role is passed as roleId UUID
            organization,
            specialization,
            status: 'ACTIVE',
        });
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
            },
            accessToken,
            refreshToken,
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        // Find user by email
        const user = await this.authRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        // Check password
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new Error('Invalid credentials');
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
            },
            accessToken,
            refreshToken,
        };
    }
    async refreshToken(refreshTokenDto) {
        const { refreshToken } = refreshTokenDto;
        // Verify refresh token
        const payload = this.jwtService.verifyRefreshToken(refreshToken);
        // Find user by id
        const user = await this.authRepository.findById(payload.id);
        if (!user) {
            throw new Error('Invalid refresh token');
        }
        // Check if stored refresh token matches
        if (user.refreshToken !== refreshToken) {
            throw new Error('Invalid refresh token');
        }
        // Generate new tokens
        const accessToken = this.jwtService.generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.roleId,
        });
        const newRefreshToken = this.jwtService.generateRefreshToken({
            id: user.id,
        });
        // Store new refresh token
        await this.authRepository.setRefreshToken(user.id, newRefreshToken);
        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
    async logout(userId) {
        // Clear refresh token
        await this.authRepository.setRefreshToken(userId, null);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map