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
      CONFIG.GOOGLE_REDIRECT_URI
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

      // Get user info from Google
      const ticket = await this.oAuth2Client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: CONFIG.GOOGLE_CLIENT_ID,
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
       } else {
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
    } catch (error) {
      logger.error('Google OAuth callback error:', error);
      throw error;
    }
  }
}