"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const middleware_1 = require("../../../shared/middleware");
const auth_validation_1 = require("../validators/auth.validation");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
router.post('/register', auth_validation_1.registerValidation, middleware_1.validate, authController.register);
router.post('/login', auth_validation_1.loginValidation, middleware_1.validate, authController.login);
router.post('/refresh-token', auth_validation_1.refreshTokenValidation, middleware_1.validate, authController.refreshToken);
router.post('/logout', authController.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map