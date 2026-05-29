import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nileopedia.test' },
    update: {},
    create: {
      email: 'admin@nileopedia.test',
      fullName: 'Admin User',
      password: '$2a$10$hashedpasswordhere',
      role: UserRole.ADMIN,
      isEmailVerified: true,
      accountStatus: 'ACTIVE',
    },
  });

  const validator = await prisma.user.upsert({
    where: { email: 'validator@nileopedia.test' },
    update: {},
    create: {
      email: 'validator@nileopedia.test',
      fullName: 'Medical Validator',
      password: '$2a$10$hashedpasswordhere',
      role: UserRole.VALIDATOR,
      specialization: 'Cardiology',
      institution: 'Test Hospital',
      isEmailVerified: true,
      accountStatus: 'ACTIVE',
    },
  });

  const medicalUser = await prisma.user.upsert({
    where: { email: 'user@nileopedia.test' },
    update: {},
    create: {
      email: 'user@nileopedia.test',
      fullName: 'Medical User',
      password: '$2a$10$hashedpasswordhere',
      role: UserRole.MEDICAL_USER,
      isEmailVerified: true,
      accountStatus: 'ACTIVE',
    },
  });

  console.log('Database seeded successfully');
  console.log({ admin, validator, medicalUser });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });