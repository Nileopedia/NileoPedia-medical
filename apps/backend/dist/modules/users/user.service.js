"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
class UserService {
    async getCurrentUser(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                specialization: true,
                institution: true,
                profileImage: true,
                bio: true,
                isEmailVerified: true,
                accountStatus: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async updateProfile(userId, data) {
        const user = await prisma_1.default.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                specialization: true,
                institution: true,
                profileImage: true,
                bio: true,
                isEmailVerified: true,
                accountStatus: true,
                createdAt: true,
            },
        });
        return user;
    }
    async changePassword(userId, data) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(data.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid current password');
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(data.newPassword, salt);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }
    async getUserById(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                specialization: true,
                institution: true,
                profileImage: true,
                accountStatus: true,
                isEmailVerified: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async getUsers(query) {
        const { page, limit, search } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [users, total] = await Promise.all([
            prisma_1.default.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                    specialization: true,
                    institution: true,
                    profileImage: true,
                    bio: true,
                    isEmailVerified: true,
                    accountStatus: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            prisma_1.default.user.count({ where }),
        ]);
        return {
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async deactivateUser(userId) {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { accountStatus: client_1.AccountStatus.SUSPENDED },
        });
    }
    async activateUser(userId) {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { accountStatus: client_1.AccountStatus.ACTIVE },
        });
    }
    async getPreferences(userId) {
        const preferences = await prisma_1.default.userPreferences.findUnique({
            where: { userId },
        });
        if (!preferences) {
            return {
                theme: 'system',
                language: 'en',
                sidebarCollapsed: false,
                responseStyle: 'normal',
                citationEnabled: true,
                emailNotifications: true,
                systemNotifications: true,
                uploadNotifications: true,
                validationNotifications: true,
            };
        }
        return preferences;
    }
    async updatePreferences(userId, data) {
        const preferences = await prisma_1.default.userPreferences.upsert({
            where: { userId },
            update: data,
            create: {
                userId,
                theme: data.theme || 'system',
                language: data.language || 'en',
                sidebarCollapsed: data.sidebarCollapsed ?? false,
                responseStyle: data.responseStyle || 'normal',
                citationEnabled: data.citationEnabled ?? true,
                emailNotifications: data.emailNotifications ?? true,
                systemNotifications: data.systemNotifications ?? true,
                uploadNotifications: data.uploadNotifications ?? true,
                validationNotifications: data.validationNotifications ?? true,
            },
        });
        return preferences;
    }
    async createValidator(data) {
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new Error('Email already exists');
        }
        const defaultPassword = data.password || Math.random().toString(36).slice(-8);
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(defaultPassword, salt);
        const user = await prisma_1.default.user.create({
            data: {
                fullName: data.fullName,
                email: data.email,
                password: hashedPassword,
                role: 'VALIDATOR',
                specialization: data.specialization,
                institution: data.institution,
                isEmailVerified: true,
                accountStatus: 'ACTIVE',
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                specialization: true,
                institution: true,
                accountStatus: true,
                createdAt: true,
            },
        });
        return user;
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map