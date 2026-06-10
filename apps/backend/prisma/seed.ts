import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@nileopedia.com';
  const adminPassword = 'Admin123456!';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  
  if (existingAdmin) {
    console.log('Admin account already exists');
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        fullName: 'Administrator',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isEmailVerified: true,
        accountStatus: 'ACTIVE',
      },
    });
    console.log('Admin account created');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });