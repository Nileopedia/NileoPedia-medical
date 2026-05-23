import { Router } from 'express';
import { validate } from '../../../shared/middleware';
import { registerValidation, loginValidation, verifyOtpValidation, refreshTokenValidation } from '../validators/auth.validation';

// Export a function that takes the controller instance and returns the router
export default function authRoutes(authController: any) {
  const router = Router();

  router.post('/register', registerValidation, validate, authController.register);
  router.post('/login', loginValidation, validate, authController.login);
  router.post('/refresh-token', refreshTokenValidation, validate, authController.refreshToken);
  router.post('/logout', authController.logout);
  router.get('/google/login', authController.googleLogin);
  router.get('/google/callback', authController.googleCallback);

  return router;
}