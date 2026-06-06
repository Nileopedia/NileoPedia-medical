import { AuthRepository } from '../repositories/auth.repository';
import { JwtService } from './jwt.service';
import bcrypt from 'bcryptjs';
import { logger } from '../../../config/logger';

export class AuthService {
  private authRepository: AuthRepository;
  private jwtService: JwtService;

  constructor() {
    this.authRepository = new AuthRepository();
    this.jwtService = new JwtService();
  }

  async register(registerDto: {
    fullName: string;
    email: string;
    password: string;
    role: 'MEDICAL_USER' | 'VALIDATOR';
    institution?: string;
    specialization?: string;
  }) {
    const { fullName, email, password, role, institution, specialization } = registerDto;

    const existingUser = await this.authRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.authRepository.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      institution,
      specialization,
    });

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

  async login(loginDto: { email: string; password: string }) {
    const { email, password } = loginDto;

    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
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

  async refreshToken(refreshTokenDto: { refreshToken: string }) {
    const { refreshToken } = refreshTokenDto;

    const payload = this.jwtService.verifyRefreshToken(refreshToken) as any;

    const user = await this.authRepository.findById(payload.id);
    if (!user) {
      throw new Error('Invalid refresh token');
    }

    if (user.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    const accessToken = this.jwtService.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = this.jwtService.generateRefreshToken({
      id: user.id,
    });

    await this.authRepository.setRefreshToken(user.id, newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string) {
    await this.authRepository.setRefreshToken(userId, null);
  }

  async requiresOtp(email: string): Promise<boolean> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    // Validators and admins require OTP verification
    return user.role === 'VALIDATOR' || user.role === 'ADMIN';
  }

  async verifyOtp(email: string, otp: string) {
    // In production, verify against stored OTP with expiry
    // For demo purposes, accept any 6-digit code
    if (!otp || otp.length !== 6) {
      throw new Error('Invalid OTP');
    }

    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
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

  async forgotPassword(email: string) {
    // In production, generate a reset token and send email
    // For demo, just log and return (prevents email enumeration)
    const user = await this.authRepository.findByEmail(email);
    if (user) {
      // In production: send email via Resend/SES/etc
      logger.info(`Password reset requested for ${email}`);
    }
    // Always return success to prevent email enumeration attacks
    return { success: true };
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    // In production, verify token matches and hasn't expired
    if (!token || token.length < 6) {
      throw new Error('Invalid or expired reset token');
    }

    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // For demo, accept any token

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.authRepository.updatePassword(user.id, hashedPassword);

    return { success: true };
  }
}