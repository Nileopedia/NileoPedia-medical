"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../../config/env");
// Helper function to convert time string to seconds
const parseTimeToSeconds = (timeStr) => {
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
class JwtService {
    generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_1.CONFIG.JWT_ACCESS_SECRET, {
            expiresIn: parseTimeToSeconds(env_1.CONFIG.JWT_ACCESS_EXPIRES_IN),
        });
    }
    generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_1.CONFIG.JWT_REFRESH_SECRET, {
            expiresIn: parseTimeToSeconds(env_1.CONFIG.JWT_REFRESH_EXPIRES_IN),
        });
    }
    verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, env_1.CONFIG.JWT_ACCESS_SECRET);
    }
    verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, env_1.CONFIG.JWT_REFRESH_SECRET);
    }
}
exports.JwtService = JwtService;
//# sourceMappingURL=jwt.service.js.map