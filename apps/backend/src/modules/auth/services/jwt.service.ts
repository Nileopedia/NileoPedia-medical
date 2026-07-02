import jwt from 'jsonwebtoken';
import { CONFIG } from '../../../config/env';

// Helper function to convert time string to seconds
const parseTimeToSeconds = (timeStr: string): number => {
  const unit = timeStr.slice(-1);
  const value = parseInt(timeStr.slice(0, -1), 10);

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return value; // Assume seconds if no unit
  }
};

export class JwtService {
  generateAccessToken(payload: object) {
    return jwt.sign(payload, CONFIG.JWT_ACCESS_SECRET, {
      expiresIn: parseTimeToSeconds(CONFIG.JWT_ACCESS_EXPIRES_IN),
    });
  }

  generateRefreshToken(payload: object) {
    return jwt.sign(payload, CONFIG.JWT_REFRESH_SECRET, {
      expiresIn: parseTimeToSeconds(CONFIG.JWT_REFRESH_EXPIRES_IN),
    });
  }

  verifyAccessToken(token: string) {
    return jwt.verify(token, CONFIG.JWT_ACCESS_SECRET);
  }

  verifyRefreshToken(token: string) {
    return jwt.verify(token, CONFIG.JWT_REFRESH_SECRET);
  }
}
