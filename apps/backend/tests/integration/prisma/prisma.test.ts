import prisma from '../../../src/config/prisma';
import { hash } from 'bcryptjs';
import { AccountStatus, Role } from '@prisma/client';

describe('Prisma Integration Tests', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.aIResponse.deleteMany();
    await prisma.question.deleteMany();
    await prisma.medicalDocument.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('User CRUD', () => {
    it('should create user', async () => {
      const user = await prisma.user.create({
        data: {
          fullName: 'Test User',
          email: 'test-user-prisma@test.com',
          password: await hash('password123', 10),
          role: Role.MEDICAL_USER,
          accountStatus: AccountStatus.ACTIVE,
        },
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe('test-user-prisma@test.com');
    });

    it('should create and retrieve user', async () => {
      const created = await prisma.user.create({
        data: {
          fullName: 'Retrieve User',
          email: 'retrieve@test.com',
          password: await hash('password', 10),
          role: Role.VALIDATOR,
        },
      });

      const found = await prisma.user.findUnique({
        where: { id: created.id },
      });

      expect(found?.id).toBe(created.id);
      expect(found?.email).toBe('retrieve@test.com');
    });

    it('should update user', async () => {
      const user = await prisma.user.create({
        data: {
          fullName: 'Update Test',
          email: 'update@test.com',
          password: await hash('password', 10),
          role: Role.MEDICAL_USER,
        },
      });

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { fullName: 'Updated Name' },
      });

      expect(updated.fullName).toBe('Updated Name');
    });

    it('should delete user', async () => {
      const user = await prisma.user.create({
        data: {
          fullName: 'Delete Test',
          email: 'delete@test.com',
          password: await hash('password', 10),
          role: Role.MEDICAL_USER,
        },
      });

      await prisma.user.delete({ where: { id: user.id } });

      const found = await prisma.user.findUnique({ where: { id: user.id } });
      expect(found).toBeNull();
    });
  });

  describe('MedicalDocument CRUD', () => {
    it('should create document', async () => {
      const user = await prisma.user.create({
        data: {
          fullName: 'Doc Owner',
          email: 'docowner@test.com',
          password: await hash('password', 10),
          role: Role.MEDICAL_USER,
        },
      });

      const doc = await prisma.medicalDocument.create({
        data: {
          title: 'Test Document',
          fileName: 'test.pdf',
          fileUrl: '/uploads/test.pdf',
          fileType: 'application/pdf',
          fileSize: 1024,
          uploadedById: user.id,
        },
      });

      expect(doc.id).toBeDefined();
      expect(doc.title).toBe('Test Document');
    });

    it('should retrieve document with embeddings', async () => {
      const user = await prisma.user.create({
        data: {
          fullName: 'Doc User',
          email: 'docuser@test.com',
          password: await hash('password', 10),
          role: Role.MEDICAL_USER,
        },
      });

      const doc = await prisma.medicalDocument.create({
        data: {
          title: 'Document With Embeddings',
          fileName: 'test.pdf',
          fileUrl: '/uploads/test.pdf',
          fileType: 'application/pdf',
          fileSize: 1024,
          uploadedById: user.id,
        },
      });

      const found = await prisma.medicalDocument.findUnique({
        where: { id: doc.id },
        include: { embeddingMetadata: true },
      });

      expect(found?.id).toBe(doc.id);
    });
  });

  describe('Question CRUD', () => {
    it('should create question', async () => {
      const user = await prisma.user.create({
        data: {
          fullName: 'Question User',
          email: 'questionuser@test.com',
          password: await hash('password', 10),
          role: Role.MEDICAL_USER,
        },
      });

      const question = await prisma.question.create({
        data: {
          userId: user.id,
          questionText: 'What is diabetes?',
        },
      });

      expect(question.id).toBeDefined();
      expect(question.questionText).toBe('What is diabetes?');
    });

    it('should retrieve question with response', async () => {
      const user = await prisma.user.create({
        data: {
          fullName: 'Q User',
          email: 'quser@test.com',
          password: await hash('password', 10),
          role: Role.MEDICAL_USER,
        },
      });

      const question = await prisma.question.create({
        data: {
          userId: user.id,
          questionText: 'What is hypertension?',
        },
      });

      const found = await prisma.question.findUnique({
        where: { id: question.id },
        include: { aiResponse: { include: { citations: true } } },
      });

      expect(found?.id).toBe(question.id);
    });
  });
});