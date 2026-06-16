"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
class AdminService {
    async getUsers() {
        const users = await prisma_1.default.user.findMany({
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                accountStatus: true,
                createdAt: true,
            },
        });
        return users;
    }
    async suspendUser(userId) {
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { accountStatus: 'SUSPENDED' },
        });
    }
    async activateUser(userId) {
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { accountStatus: 'ACTIVE' },
        });
    }
    async deleteUser(userId) {
        await prisma_1.default.user.delete({ where: { id: userId } });
    }
    async getAnalytics() {
        const [totalUsers, totalResponses, pendingReviews, approvedResponses] = await Promise.all([
            prisma_1.default.user.count(),
            prisma_1.default.aIResponse.count(),
            prisma_1.default.aIResponse.count({ where: { validationStatus: 'PENDING' } }),
            prisma_1.default.aIResponse.count({ where: { validationStatus: 'APPROVED' } }),
        ]);
        return {
            totalUsers,
            totalResponses,
            pendingReviews,
            approvedResponses,
        };
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=admin.service.js.map