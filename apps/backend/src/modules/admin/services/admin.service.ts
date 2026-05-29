import prisma from '../../../config/prisma';

export class AdminService {
  async getUsers() {
    const users = await prisma.user.findMany({
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

  async suspendUser(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: 'SUSPENDED' },
    });
  }

  async activateUser(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: 'ACTIVE' },
    });
  }

  async deleteUser(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
  }

  async getAnalytics() {
    const [totalUsers, totalResponses, pendingReviews, approvedResponses] = await Promise.all([
      prisma.user.count(),
      prisma.aIResponse.count(),
      prisma.aIResponse.count({ where: { validationStatus: 'PENDING' } }),
      prisma.aIResponse.count({ where: { validationStatus: 'APPROVED' } }),
    ]);

    return {
      totalUsers,
      totalResponses,
      pendingReviews,
      approvedResponses,
    };
  }
}