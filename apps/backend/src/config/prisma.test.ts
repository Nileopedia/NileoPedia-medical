import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaTest: PrismaClient | undefined;
}

// Use SQLite in-memory database for integration tests
const prisma = global.prismaTest || new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db',
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  global.prismaTest = prisma;
}

export default prisma;
