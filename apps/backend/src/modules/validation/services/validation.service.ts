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

  async getHistory(validatorId: string, userRole?: string) {
    const where = userRole === 'ADMIN' ? {} : { validatorId };
    const reviews = await prisma.validationReview.findMany({
      where,
      include: { aiResponse: { include: { question: true } } },
      orderBy: { reviewedAt: 'desc' },
    });

    return reviews;
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
        where: { status: 'APPROVED' },
        skip,
        take: limit,
        orderBy: { reviewedAt: 'desc' },
        include: {
          aiResponse: { include: { question: true } },
          validator: { select: { fullName: true, email: true } },
        },
      }),
      prisma.validationReview.count({ where: { status: 'APPROVED' } }),
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
        where: { status: 'REJECTED' },
        skip,
        take: limit,
        orderBy: { reviewedAt: 'desc' },
        include: {
          aiResponse: { include: { question: true } },
          validator: { select: { fullName: true, email: true } },
        },
      }),
      prisma.validationReview.count({ where: { status: 'REJECTED' } }),
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
}