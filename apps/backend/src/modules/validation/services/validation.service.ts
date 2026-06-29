import prisma from '../../../config/prisma';

export class ValidationService {
  async getPending() {
    const responses = await prisma.aIResponse.findMany({
      where: { validationStatus: 'PENDING' },
      include: { question: true },
    });

    return responses;
  }

  async approve(responseId: string, validatorId: string, score: number, feedback: string) {
    await prisma.$transaction(async (tx: any) => {
      await tx.aIResponse.update({
        where: { id: responseId },
        data: { validationStatus: 'APPROVED' },
      });

      await tx.validationReview.create({
        data: {
          aiResponseId: responseId,
          validatorId,
          status: 'APPROVED',
          score,
          feedback,
        },
      });
    });
  }

  async reject(responseId: string, validatorId: string, feedback: string) {
    await prisma.$transaction(async (tx: any) => {
      await tx.aIResponse.update({
        where: { id: responseId },
        data: { validationStatus: 'REJECTED' },
      });

      await tx.validationReview.create({
        data: {
          aiResponseId: responseId,
          validatorId,
          status: 'REJECTED',
          feedback,
        },
      });
    });
  }

  async getHistory(validatorId: string, userRole?: string, page = 1, limit = 20, search?: string, startDate?: string) {
    const skip = (page - 1) * limit;
    const where: any = userRole === 'ADMIN' ? {} : { validatorId };

    if (search) {
      where.aiResponse = {
        question: {
          questionText: { contains: search, mode: 'insensitive' },
        },
      };
    }

    if (startDate) {
      where.reviewedAt = { gte: new Date(startDate) };
    }

    const [reviews, total] = await Promise.all([
      prisma.validationReview.findMany({
        where,
        include: { aiResponse: { include: { question: true } } },
        orderBy: { reviewedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.validationReview.count({ where }),
    ]);

    return {
      reviews,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getReview(responseId: string) {
    const review = await prisma.validationReview.findFirst({
      where: { aiResponseId: responseId },
    });

    return review;
  }

  async getApproved(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      prisma.validationReview.findMany({
        where: { status: 'APPROVED' as any },
        skip,
        take: limit,
        orderBy: { reviewedAt: 'desc' },
        include: {
          aiResponse: { include: { question: true } },
          validator: { select: { fullName: true, email: true } },
        },
      }),
      prisma.validationReview.count({ where: { status: 'APPROVED' as any } }),
    ]);

    return {
      reviews: reviews.map(r => ({
        id: r.id,
        question: r.aiResponse?.question?.questionText || 'Unknown',
        response: r.aiResponse?.summary || '',
        validator: r.validator?.fullName || 'Unknown',
        date: r.reviewedAt.toISOString(),
        score: r.score,
      })),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getRejected(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      prisma.validationReview.findMany({
        where: { status: 'REJECTED' as any },
        skip,
        take: limit,
        orderBy: { reviewedAt: 'desc' },
        include: {
          aiResponse: { include: { question: true } },
          validator: { select: { fullName: true, email: true } },
        },
      }),
      prisma.validationReview.count({ where: { status: 'REJECTED' as any } }),
    ]);

    return {
      reviews: reviews.map(r => ({
        id: r.id,
        question: r.aiResponse?.question?.questionText || 'Unknown',
        reason: r.feedback || 'No reason provided',
        validator: r.validator?.fullName || 'Unknown',
        date: r.reviewedAt.toISOString(),
      })),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getFeedbackReports(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          aiResponse: { include: { question: true } },
        },
      }),
      prisma.feedback.count(),
    ]);

    return {
      reports: feedbacks.map(f => ({
        id: f.id,
        question: f.aiResponse?.question?.questionText || 'Unknown question',
        userFeedback: f.comment,
        rating: 5,
        reportedIssue: 'General feedback',
        date: f.createdAt.toISOString(),
        severity: 'medium' as const,
        status: 'open' as const,
      })),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateFeedbackReport(reportId: string, severity: string, status: string) {
    await prisma.feedback.update({
      where: { id: reportId },
      data: {},
    });
  }

  async getProfile(validatorId: string) {
    const user = await prisma.user.findUnique({
      where: { id: validatorId },
    });

    if (!user) throw new Error('User not found');

    const reviews = await prisma.validationReview.findMany({
      where: { validatorId },
    });

    const approved = reviews.filter(r => r.status === 'APPROVED').length;
    const reviewsCompleted = reviews.length;
    const approvalRate = reviews.length > 0 ? Math.round((approved / reviews.length) * 100) : 0;

    const timestamps = reviews.map(r => new Date(r.reviewedAt).getTime());
    const avgReviewTime = timestamps.length > 1
      ? Math.round((timestamps[timestamps.length - 1] - timestamps[0]) / timestamps.length / 1000)
      : 0;

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      specialization: user.specialization,
      institution: user.institution,
      reviewsCompleted,
      approvalRate,
      averageReviewTime: avgReviewTime,
    };
  }

  async updateProfile(validatorId: string, data: { specialization?: string; institution?: string }) {
    const user = await prisma.user.update({
      where: { id: validatorId },
      data,
    });

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    };
  }

  async getSettings(validatorId: string) {
    const prefs = await prisma.userPreferences.findUnique({
      where: { userId: validatorId },
    });

    return {
      reviewAlerts: prefs?.validationNotifications ?? true,
      feedbackAlerts: true,
      emailNotifications: prefs?.emailNotifications ?? true,
      autoSortByPriority: false,
      citationDisplay: 'inline',
    };
  }

  async updateSettings(validatorId: string, settings: Record<string, any>) {
    const existing = await prisma.userPreferences.findUnique({ where: { userId: validatorId } });
    
    if (existing) {
      await prisma.userPreferences.update({
        where: { userId: validatorId },
        data: {
          validationNotifications: settings.reviewAlerts,
          emailNotifications: settings.emailNotifications,
        },
      });
    } else {
      await prisma.userPreferences.create({
        data: {
          userId: validatorId,
          validationNotifications: settings.reviewAlerts ?? true,
          emailNotifications: settings.emailNotifications ?? true,
        },
      });
    }

    return settings;
  }
}