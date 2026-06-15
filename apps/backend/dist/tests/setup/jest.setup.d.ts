/// <reference types="jest" />
declare const mockPrisma: {
    $connect: jest.Mock<any, any, any>;
    $disconnect: jest.Mock<any, any, any>;
    $executeRawUnsafe: jest.Mock<any, any, any>;
    notification: {
        deleteMany: jest.Mock<any, any, any>;
    };
    auditLog: {
        deleteMany: jest.Mock<any, any, any>;
    };
    citation: {
        deleteMany: jest.Mock<any, any, any>;
    };
    aIResponse: {
        deleteMany: jest.Mock<any, any, any>;
    };
    question: {
        deleteMany: jest.Mock<any, any, any>;
    };
    embeddingMetadata: {
        deleteMany: jest.Mock<any, any, any>;
    };
    medicalDocument: {
        deleteMany: jest.Mock<any, any, any>;
    };
    session: {
        deleteMany: jest.Mock<any, any, any>;
    };
    user: {
        deleteMany: jest.Mock<any, any, any>;
    };
};
export { mockPrisma as prisma };
//# sourceMappingURL=jest.setup.d.ts.map