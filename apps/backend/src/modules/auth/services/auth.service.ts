import bcrypt from 'bcryptjs';
import { AuthRepository } from '../repositories/auth.repository';
import { JwtService } from './jwt.service';
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
    const {
      fullName, email, password, role, institution, specialization,
    } = registerDto;

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
    return user.role === 'VALIDATOR' || user.role === 'ADMIN';
  }

  async generateOtp(email: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    await this.authRepository.createOtp(email, otp, expiresAt);

    try {
      const { EmailService } = await import('../../email/email.service');
      const user = await this.authRepository.findByEmail(email);
      await EmailService.sendOtp({ email, fullName: user?.fullName || 'User', otp });
      logger.info(`OTP email sent to ${email}`);
    } catch (error) {
      logger.info(`OTP for ${email}: ${otp}`);
    }

    return otp;
  }

  async verifyOtp(email: string, otp: string) {
    if (!otp || otp.length !== 6) {
      throw new Error('Invalid OTP');
    }

    const otpRecord = await this.authRepository.findOtp(email, otp);
    if (!otpRecord) {
      throw new Error('Invalid or expired OTP');
    }

    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    await this.authRepository.markOtpUsed(otpRecord.id);

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
    const user = await this.authRepository.findByEmail(email);
    if (user) {
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

      await this.authRepository.createPasswordReset(email, resetToken, expiresAt);

      const resetLink = `${process.env.FRONTEND_URL}/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}`;

      try {
        const { EmailService } = await import('../../email/email.service');
        await EmailService.sendPasswordReset({
          email,
          fullName: user.fullName,
          resetLink,
        });
        logger.info(`Password reset email sent to ${email}`);
      } catch (error) {
        logger.info(`Reset link for ${email}: ${resetLink}`);
      }
    }
    return { success: true };
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    if (!token || token.length < 6) {
      throw new Error('Invalid or expired reset token');
    }

    const resetRecord = await this.authRepository.findPasswordReset(token);
    if (!resetRecord) {
      throw new Error('Invalid or expired reset token');
    }

    if (resetRecord.email !== email) {
      throw new Error('Invalid or expired reset token');
    }

    if (resetRecord.expiresAt < new Date()) {
      throw new Error('Reset token has expired');
    }

    if (resetRecord.used) {
      throw new Error('Reset token has already been used');
    }

    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.authRepository.updatePassword(user.id, hashedPassword);
    await this.authRepository.markPasswordResetUsed(resetRecord.id);

    return { success: true };
  }
}
