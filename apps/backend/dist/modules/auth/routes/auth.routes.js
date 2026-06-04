"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../../shared/middleware");
const auth_validation_1 = require("../validators/auth.validation");
// Export a function that takes the controller instance and returns the router
function authRoutes(authController) {
    const router = (0, express_1.Router)();
    router.post('/register', auth_validation_1.registerValidation, middleware_1.validate, authController.register);
    router.post('/login', auth_validation_1.loginValidation, middleware_1.validate, authController.login);
    router.post('/refresh-token', auth_validation_1.refreshTokenValidation, middleware_1.validate, authController.refreshToken);
    router.post('/logout', authController.logout);
    router.get('/google/login', authController.googleLogin);
    router.get('/google/callback', authController.googleCallback);
    return router;
}
exports.default = authRoutes;
//# sourceMappingURL=auth.routes.js.map