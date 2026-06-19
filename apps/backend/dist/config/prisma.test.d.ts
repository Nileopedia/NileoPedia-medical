import { PrismaClient } from '@prisma/client';
declare global {
    var prismaTest: PrismaClient | undefined;
}
declare const prisma: PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export default prisma;
//# sourceMappingURL=prisma.test.d.ts.map