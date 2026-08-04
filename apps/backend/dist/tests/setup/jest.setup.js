"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const createMockModel = () => {
    const model = {};
    ['create', 'createMany', 'update', 'updateMany', 'delete', 'deleteMany', 'findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy'].forEach((method) => {
        model[method] = jest.fn();
    });
    return model;
};
const mockPrisma = {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $executeRawUnsafe: jest.fn(),
    user: createMockModel(),
    question: createMockModel(),
    aIResponse: createMockModel(),
    citation: createMockModel(),
    validationReview: createMockModel(),
    medicalDocument: createMockModel(),
    documentMetadata: createMockModel(),
    embeddingMetadata: createMockModel(),
    notification: createMockModel(),
    session: createMockModel(),
    auditLog: createMockModel(),
    emailLog: createMockModel(),
    feedback: createMockModel(),
    userPreferences: createMockModel(),
    passwordReset: createMockModel(),
    otpVerification: createMockModel(),
};
exports.prisma = mockPrisma;
beforeAll(async () => {
    await mockPrisma.$connect();
});
afterAll(async () => {
    await mockPrisma.$disconnect();
});
afterEach(async () => {
    jest.clearAllMocks();
});
//# sourceMappingURL=jest.setup.js.map