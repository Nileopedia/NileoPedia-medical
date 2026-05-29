export declare const mockPrismaClient: {
    $connect: jest.Mock<any, any, any>;
    $disconnect: jest.Mock<any, any, any>;
    $executeRawUnsafe: jest.Mock<any, any, any>;
    $transaction: jest.Mock<any, any, any>;
    notification: {
        findMany: jest.Mock<any, any, any>;
        findUnique: jest.Mock<any, any, any>;
        create: jest.Mock<any, any, any>;
        update: jest.Mock<any, any, any>;
        deleteMany: jest.Mock<any, any, any>;
    };
    auditLog: {
        findMany: jest.Mock<any, any, any>;
        findUnique: jest.Mock<any, any, any>;
        create: jest.Mock<any, any, any>;
        deleteMany: jest.Mock<any, any, any>;
    };
    citation: {
        findMany: jest.Mock<any, any, any>;
        findUnique: jest.Mock<any, any, any>;
        create: jest.Mock<any, any, any>;
        update: jest.Mock<any, any, any>;
        delete: jest.Mock<any, any, any>;
        deleteMany: jest.Mock<any, any, any>;
    };
    aIResponse: {
        findMany: jest.Mock<any, any, any>;
        findUnique: jest.Mock<any, any, any>;
        create: jest.Mock<any, any, any>;
        update: jest.Mock<any, any, any>;
        deleteMany: jest.Mock<any, any, any>;
        count: jest.Mock<any, any, any>;
    };
    question: {
        findMany: jest.Mock<any, any, any>;
        findUnique: jest.Mock<any, any, any>;
        create: jest.Mock<any, any, any>;
        update: jest.Mock<any, any, any>;
        deleteMany: jest.Mock<any, any, any>;
        count: jest.Mock<any, any, any>;
    };
    embeddingMetadata: {
        findMany: jest.Mock<any, any, any>;
        create: jest.Mock<any, any, any>;
        deleteMany: jest.Mock<any, any, any>;
    };
    medicalDocument: {
        findMany: jest.Mock<any, any, any>;
        findUnique: jest.Mock<any, any, any>;
        create: jest.Mock<any, any, any>;
        update: jest.Mock<any, any, any>;
        delete: jest.Mock<any, any, any>;
        deleteMany: jest.Mock<any, any, any>;
    };
    session: {
        findFirst: jest.Mock<any, any, any>;
        create: jest.Mock<any, any, any>;
        deleteMany: jest.Mock<any, any, any>;
    };
    user: {
        findMany: jest.Mock<any, any, any>;
        findUnique: jest.Mock<any, any, any>;
        findFirst: jest.Mock<any, any, any>;
        create: jest.Mock<any, any, any>;
        update: jest.Mock<any, any, any>;
        deleteMany: jest.Mock<any, any, any>;
        count: jest.Mock<any, any, any>;
    };
    validationReview: {
        findMany: jest.Mock<any, any, any>;
        findFirst: jest.Mock<any, any, any>;
        create: jest.Mock<any, any, any>;
        update: jest.Mock<any, any, any>;
    };
};
export declare const mockOpenAI: {
    embeddings: {
        create: jest.Mock<any, any, any>;
    };
    chat: {
        completions: {
            create: jest.Mock<any, any, any>;
        };
    };
};
export declare const mockPinecone: {
    index: jest.Mock<any, any, any>;
};
export declare const mockElasticsearch: {
    search: jest.Mock<any, any, any>;
    index: jest.Mock<any, any, any>;
};
//# sourceMappingURL=services.mock.d.ts.map