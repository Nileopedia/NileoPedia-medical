import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import { UpdateProfileDto, ChangePasswordDto, GetUsersQuery, GetUsersResult } from './user.types';
import { AccountStatus } from '@prisma/client';

export class UserService {
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        specialization: true,
        institution: true,
        profileImage: true,
        isEmailVerified: true,
        accountStatus: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    const user = await prisma.user.update({
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
        isEmailVerified: true,
        accountStatus: true,
      },
    });

    return user;
  }

  async changePassword(userId: string, data: ChangePasswordDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid current password');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
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

  async getUsers(query: GetUsersQuery): Promise<GetUsersResult> {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where: {
      OR?: Array<{ fullName?: { contains: string; mode: 'insensitive' }; email?: { contains: string; mode: 'insensitive' } }>;
    } = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
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
          isEmailVerified: true,
          accountStatus: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deactivateUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: AccountStatus.SUSPENDED },
    });
  }

  async activateUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: AccountStatus.ACTIVE },
    });
  }

  async getPreferences(userId: string) {
    const preferences = await prisma.userPreferences.findUnique({
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

  async updatePreferences(userId: string, data: {
    theme?: string;
    language?: string;
    sidebarCollapsed?: boolean;
    responseStyle?: string;
    citationEnabled?: boolean;
    emailNotifications?: boolean;
    systemNotifications?: boolean;
    uploadNotifications?: boolean;
    validationNotifications?: boolean;
  }) {
    const preferences = await prisma.userPreferences.upsert({
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

  async createValidator(data: {
    fullName: string;
    email: string;
    password?: string;
    specialization?: string;
    institution?: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email already exists');
    }

    const defaultPassword = data.password || Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const user = await prisma.user.create({
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