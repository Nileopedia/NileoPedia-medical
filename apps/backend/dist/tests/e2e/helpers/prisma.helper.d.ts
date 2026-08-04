import { PrismaClient } from '@prisma/client';
export declare const prisma: PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare function cleanupDatabase(): Promise<void>;
export declare function disconnectPrisma(): Promise<void>;
//# sourceMappingURL=prisma.helper.d.ts.map