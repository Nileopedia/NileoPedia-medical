import prisma from '../../../config/prisma';
import { AuditLogger } from '../../audit/audit.logger';

export class AdminService {
  async getUsers(page = 1, limit = 20, search = '') {
    const skip = (page - 1) * limit;
    const where: any = search
      ? { OR: [{ fullName: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }
      : {};
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          accountStatus: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async suspendUser(userId: string, adminId?: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: 'SUSPENDED' as any },
    });
  }

  async activateUser(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: 'ACTIVE' as any },
    });
  }

  async deleteUser(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
  }

  async resetPassword(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    // In production, this would trigger an email with a reset token
    // For now, just return success
    return { success: true };
  }

  async getValidators(page = 1, limit = 20, search = '') {
    const skip = (page - 1) * limit;
    const where: any = { role: 'VALIDATOR' as any };
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const [validators, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          specialization: true,
          institution: true,
          accountStatus: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    const validatorsWithStats = await Promise.all(
      validators.map(async (v) => {
        const reviews = await prisma.validationReview.findMany({
          where: { validatorId: v.id },
        });
        const reviewsCompleted = reviews.length;
        const approved = reviews.filter(r => r.status === 'APPROVED').length;
        const approvalRate = reviews.length > 0 ? Math.round((approved / reviews.length) * 100) : 0;
        
        return {
          ...v,
          reviewsCompleted,
          approvalRate,
        };
      })
    );

    return { validators: validatorsWithStats, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async addValidator(data: { fullName: string; email: string; password?: string; specialization?: string; institution?: string }) {
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new Error('Email already exists');

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: data.password || Math.random().toString(36).substring(2, 15),
        role: 'VALIDATOR' as any,
        specialization: data.specialization,
        institution: data.institution,
        accountStatus: 'ACTIVE' as any,
      },
    });

    return { id: user.id, fullName: user.fullName, email: user.email, role: user.role };
  }

  async removeValidator(validatorId: string) {
    const user = await prisma.user.findUnique({ where: { id: validatorId } });
    if (!user || user.role !== 'VALIDATOR') throw new Error('Validator not found');
    
    await prisma.user.update({
      where: { id: validatorId },
      data: { role: 'MEDICAL_USER' as any, accountStatus: 'SUSPENDED' as any },
    });
  }

  async getAnalytics() {
    const [totalUsers, totalValidators, totalDocuments, totalResponses, pendingReviews, approvedResponses, rejectedResponses, vectorsCount] = await Promise.all([
      prisma.user.count({ where: { role: 'MEDICAL_USER' as any } }),
      prisma.user.count({ where: { role: 'VALIDATOR' as any } }),
      prisma.medicalDocument.count(),
      prisma.aIResponse.count(),
      prisma.aIResponse.count({ where: { validationStatus: 'PENDING' as any } }),
      prisma.aIResponse.count({ where: { validationStatus: 'APPROVED' as any } }),
      prisma.aIResponse.count({ where: { validationStatus: 'REJECTED' as any } }),
      prisma.embeddingMetadata.count(),
    ]);

    // Get queries per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const questions = await prisma.question.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: true,
    });

    const queriesPerDay = questions.reduce((acc: Record<string, number>, q) => {
      const date = q.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + q._count;
      return acc;
    }, {});

    // Get documents per day
    const documentsPerDay = await prisma.medicalDocument.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: true,
    });

    const docsPerDayMap = documentsPerDay.reduce((acc: Record<string, number>, d) => {
      const date = d.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + d._count;
      return acc;
    }, {});

    // Get validation trends
    const validations = await prisma.validationReview.groupBy({
      by: ['reviewedAt', 'status'],
      where: { reviewedAt: { gte: sevenDaysAgo } },
      _count: true,
    });

    const validationTrends = validations.reduce((acc: Record<string, { approved: number; rejected: number }>, v) => {
      const date = v.reviewedAt.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = { approved: 0, rejected: 0 };
      if (v.status === 'APPROVED') acc[date].approved += v._count;
      else acc[date].rejected += v._count;
      return acc;
    }, {});

    return {
      totalUsers,
      totalValidators,
      totalDocuments,
      totalResponses,
      pendingReviews,
      approvedResponses,
      rejectedResponses,
      totalVectors: vectorsCount,
      queriesPerDay,
      documentsPerDay: docsPerDayMap,
      validationTrends,
    };
  }

  async getRecentValidations(limit = 50) {
    const validations = await prisma.validationReview.findMany({
      take: limit,
      orderBy: { reviewedAt: 'desc' },
      include: {
        aiResponse: { include: { question: true } },
        validator: { select: { id: true, fullName: true, email: true } },
      },
    });

    return validations.map(v => ({
      id: v.id,
      question: v.aiResponse?.question?.questionText || 'Unknown',
      response: v.aiResponse?.summary?.substring(0, 100) || 'No response',
      validator: v.validator?.fullName || 'Unknown',
      decision: v.status.toLowerCase(),
      comments: v.feedback,
      date: v.reviewedAt.toISOString(),
    }));
  }

  async getSettings() {
    // Return default settings since there's no systemSettings table
    return {
      systemNotifications: 'true',
      emailAlerts: 'true',
      autoBackup: 'true',
      maintenanceMode: 'false',
    };
  }

  async updateSettings(settings: Record<string, any>) {
    // In a real implementation, this would persist to a systemSettings table
    // For now, just log the update
    await AuditLogger.log({ session: { userId: null, userRole: 'ADMIN' } } as any, {
      action: 'ADMIN_UPDATE_SETTINGS',
      entityType: 'Settings',
      description: 'Admin updated system settings',
      metadata: settings,
    });
    return settings;
  }

  async getAiActivity(page = 1, limit = 20, search = '', status = '') {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { question: { questionText: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.validationStatus = status.toUpperCase() as any;
    }

    const [activities, total] = await Promise.all([
      prisma.aIResponse.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          question: true,
          citations: true,
        },
      }),
      prisma.aIResponse.count({ where }),
    ]);

    return {
      activities: activities.map(a => ({
        id: a.id,
        question: a.question?.questionText || 'Unknown',
        model: a.generatedBy || 'Unknown',
        responseTime: a.confidenceScore ? 0 : 0,
        documentsUsed: a.citations?.length ?? 0,
        status: a.validationStatus?.toLowerCase() ?? 'pending',
        date: a.createdAt.toISOString(),
      })),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}