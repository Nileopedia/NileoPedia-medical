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

  async getHistory(validatorId: string) {
    const reviews = await prisma.validationReview.findMany({
      where: { validatorId },
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
}