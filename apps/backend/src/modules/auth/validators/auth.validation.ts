import { body } from 'express-validator';

export const registerValidation = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .custom((value) => {
      if (value === 'ADMIN') {
        throw new Error('ADMIN registration is not allowed through this endpoint');
      }
      return true;
    }),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const verifyOtpValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits'),
];

export const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

export const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
];

export const resetPasswordValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];
