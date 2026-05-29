"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
class AuthRepository {
    async findByEmail(email) {
        return prisma_1.default.user.findUnique({ where: { email } });
    }
    async findById(id) {
        return prisma_1.default.user.findUnique({ where: { id } });
    }
    async create(userData) {
        return prisma_1.default.user.create({ data: userData });
    }
    async update(id, userData) {
        return prisma_1.default.user.update({ where: { id }, data: userData });
    }
    async setRefreshToken(id, refreshToken) {
        return prisma_1.default.user.update({ where: { id }, data: { refreshToken: refreshToken || undefined } });
    }
}
exports.AuthRepository = AuthRepository;
//# sourceMappingURL=auth.repository.js.map