import { OAuth2Client } from 'google-auth-library';
import { AuthRepository } from '../repositories/auth.repository';
import { JwtService } from './jwt.service';
import { CONFIG } from '../../../config/env';
import { logger } from '../../../config/logger';

export class GoogleAuthService {
  private authRepository: AuthRepository;
  private jwtService: JwtService;
  private oAuth2Client: OAuth2Client;

  constructor() {
    this.authRepository = new AuthRepository();
    this.jwtService = new JwtService();
    this.oAuth2Client = new OAuth2Client(
      CONFIG.GOOGLE_CLIENT_ID,
      CONFIG.GOOGLE_CLIENT_SECRET,
      CONFIG.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/google/callback'
    );
  }

  async getAuthUrl(): Promise<string> {
    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email'],
    });
    return authUrl;
  }

  async handleGoogleCallback(code: string) {
    try {
      const { tokens } = await this.oAuth2Client.getToken(code);
      this.oAuth2Client.setCredentials(tokens);

      const ticket = await this.oAuth2Client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: CONFIG.GOOGLE_CLIENT_ID,
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
    } catch (error) {
      logger.error('Google OAuth callback error:', error);
      throw error;
    }
  }
}