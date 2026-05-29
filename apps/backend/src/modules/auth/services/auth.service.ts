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
}