"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectPrisma = exports.cleanupDatabase = exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
async function cleanupDatabase() {
    await exports.prisma.citation.deleteMany({});
    await exports.prisma.validationReview.deleteMany({});
    await exports.prisma.feedback.deleteMany({});
    await exports.prisma.aIResponse.deleteMany({});
    await exports.prisma.embeddingMetadata.deleteMany({});
    await exports.prisma.documentMetadata.deleteMany({});
    await exports.prisma.medicalDocument.deleteMany({});
    await exports.prisma.question.deleteMany({});
    await exports.prisma.notification.deleteMany({});
    await exports.prisma.auditLog.deleteMany({});
    await exports.prisma.session.deleteMany({});
    await exports.prisma.user.deleteMany({});
}
exports.cleanupDatabase = cleanupDatabase;
async function disconnectPrisma() {
    await exports.prisma.$disconnect();
}
exports.disconnectPrisma = disconnectPrisma;
//# sourceMappingURL=prisma.helper.js.map