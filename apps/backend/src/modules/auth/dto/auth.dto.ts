export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  role: string;
  organization?: string;
  specialization?: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}