import { AuthRepository } from '../repositories/auth.repository';
import { JwtService } from './jwt.service';
import bcrypt from 'bcryptjs';
import { CONFIG } from '../../../config/env';
import { logger } from '../../../config/logger';

export class AuthService {
  private authRepository: AuthRepository;
  private jwtService: JwtService;

  constructor() {
    this.authRepository = new AuthRepository();
    this.jwtService = new JwtService();
  }

  async register(registerDto: any) {
    const { fullName, email, password, role, organization, specialization } = registerDto;

    // Check if user already exists
    const existingUser = await this.authRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

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

  async login(loginDto: any) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
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

  async refreshToken(refreshTokenDto: any) {
    const { refreshToken } = refreshTokenDto;

    // Verify refresh token
    const payload = this.jwtService.verifyRefreshToken(refreshToken) as any;

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

  async logout(userId: string) {
    // Clear refresh token
    await this.authRepository.setRefreshToken(userId, null);
  }
}