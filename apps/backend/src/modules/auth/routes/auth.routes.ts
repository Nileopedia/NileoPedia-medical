import { Router } from 'express';
import { validate } from '../../../shared/middleware';
import { registerValidation, loginValidation, verifyOtpValidation, refreshTokenValidation, forgotPasswordValidation, resetPasswordValidation } from '../validators/auth.validation';

// Export a function that takes the controller instance and returns the router
export default function authRoutes(authController: any) {
  const router: Router = Router();

  router.post('/register', registerValidation, validate, authController.register.bind(authController));
  router.post('/login', loginValidation, validate, authController.login.bind(authController));
  router.post('/verify', authController.verifyEmail.bind(authController));
  router.post('/verify-otp', verifyOtpValidation, validate, authController.verifyOtp.bind(authController));
  router.post('/forgot-password', forgotPasswordValidation, validate, authController.forgotPassword.bind(authController));
  router.post('/reset-password', resetPasswordValidation, validate, authController.resetPassword.bind(authController));
  router.post('/refresh-token', refreshTokenValidation, validate, authController.refreshToken.bind(authController));
  router.post('/logout', authController.logout.bind(authController));
  router.get('/google/login', authController.googleLogin.bind(authController));
  router.get('/google/callback', authController.googleCallback.bind(authController));

  return router;
}