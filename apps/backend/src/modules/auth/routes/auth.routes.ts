import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../../../shared/middleware';
import { registerValidation, loginValidation, verifyOtpValidation, refreshTokenValidation } from '../validators/auth.validation';

const router = Router();
const authController = new AuthController();

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh-token', refreshTokenValidation, validate, authController.refreshToken);
router.post('/logout', authController.logout);

export default router;