"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../../shared/middleware");
const auth_validation_1 = require("../validators/auth.validation");
// Export a function that takes the controller instance and returns the router
function authRoutes(authController) {
    const router = (0, express_1.Router)();
    router.post('/register', auth_validation_1.registerValidation, middleware_1.validate, authController.register.bind(authController));
    router.post('/login', auth_validation_1.loginValidation, middleware_1.validate, authController.login.bind(authController));
    router.post('/verify', authController.verifyEmail.bind(authController));
    router.post('/verify-otp', auth_validation_1.verifyOtpValidation, middleware_1.validate, authController.verifyOtp.bind(authController));
    router.post('/forgot-password', auth_validation_1.forgotPasswordValidation, middleware_1.validate, authController.forgotPassword.bind(authController));
    router.post('/reset-password', auth_validation_1.resetPasswordValidation, middleware_1.validate, authController.resetPassword.bind(authController));
    router.post('/refresh-token', auth_validation_1.refreshTokenValidation, middleware_1.validate, authController.refreshToken.bind(authController));
    router.post('/logout', authController.logout.bind(authController));
    router.get('/google/login', authController.googleLogin.bind(authController));
    router.get('/google/callback', authController.googleCallback.bind(authController));
    return router;
}
exports.default = authRoutes;
//# sourceMappingURL=auth.routes.js.map