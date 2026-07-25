import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function cleanupDatabase(): Promise<void> {
  await prisma.citation.deleteMany({});
  await prisma.validationReview.deleteMany({});
  await prisma.feedback.deleteMany({});
  await prisma.aIResponse.deleteMany({});
  await prisma.embeddingMetadata.deleteMany({});
  await prisma.documentMetadata.deleteMany({});
  await prisma.medicalDocument.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
