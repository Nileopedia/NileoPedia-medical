"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Use SQLite in-memory database for integration tests
const prisma = global.prismaTest || new client_1.PrismaClient({
    datasources: {
        db: {
            url: 'file:./test.db',
        },
    },
});
if (process.env.NODE_ENV !== 'production') {
    global.prismaTest = prisma;
}
exports.default = prisma;
//# sourceMappingURL=prisma.test.js.map