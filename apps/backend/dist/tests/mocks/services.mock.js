"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockElasticsearch = exports.mockPinecone = exports.mockOpenAI = exports.mockGroq = exports.mockPrismaClient = void 0;
exports.mockPrismaClient = {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $executeRawUnsafe: jest.fn().mockResolvedValue([]),
    $transaction: jest.fn().mockImplementation(async (fn) => fn(exports.mockPrismaClient)),
    notification: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...data, id: 'mock-notification-id', createdAt: new Date() })),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...data })),
        deleteMany: jest.fn().mockResolvedValue({}),
    },
    auditLog: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...data, id: 'mock-audit-id', createdAt: new Date() })),
        deleteMany: jest.fn().mockResolvedValue({}),
    },
    citation: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...data, id: 'mock-citation-id', createdAt: new Date() })),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...data })),
        delete: jest.fn().mockResolvedValue({}),
        deleteMany: jest.fn().mockResolvedValue({}),
    },
    aIResponse: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...data, id: 'mock-response-id', createdAt: new Date(), updatedAt: new Date() })),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...data })),
        deleteMany: jest.fn().mockResolvedValue({}),
        count: jest.fn().mockResolvedValue(0),
    },
    question: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...data, id: 'mock-question-id', createdAt: new Date() })),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...data })),
        deleteMany: jest.fn().mockResolvedValue({}),
        count: jest.fn().mockResolvedValue(0),
    },
    embeddingMetadata: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...data, id: 'mock-embedding-id', createdAt: new Date() })),
        deleteMany: jest.fn().mockResolvedValue({}),
    },
    medicalDocument: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...data, id: 'mock-doc-id', createdAt: new Date(), updatedAt: new Date() })),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...data })),
        delete: jest.fn().mockResolvedValue({}),
        deleteMany: jest.fn().mockResolvedValue({}),
    },
    session: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...data, id: 'mock-session-id', createdAt: new Date() })),
        deleteMany: jest.fn().mockResolvedValue({}),
    },
    user: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...data, id: 'mock-user-id', createdAt: new Date(), updatedAt: new Date() })),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...data })),
        deleteMany: jest.fn().mockResolvedValue({}),
        count: jest.fn().mockResolvedValue(0),
    },
    validationReview: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...data, id: 'mock-review-id', reviewedAt: new Date() })),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...data })),
        count: jest.fn().mockResolvedValue(0),
    },
};
exports.mockGroq = {
    chat: {
        completions: {
            create: jest.fn().mockResolvedValue({
                choices: [{ message: { content: 'Mocked AI response for testing' } }],
            }),
        },
    },
};
exports.mockOpenAI = exports.mockGroq; // Legacy alias
exports.mockPinecone = {
    index: jest.fn().mockReturnValue({
        upsert: jest.fn().mockResolvedValue({}),
        query: jest.fn().mockResolvedValue({
            matches: [
                {
                    id: 'test-chunk-1',
                    score: 0.95,
                    metadata: {
                        documentId: 'test-doc-1',
                        textPreview: 'Test medical content preview...',
                        source: 'Test Journal',
                    },
                },
            ],
        }),
        delete: jest.fn().mockResolvedValue({}),
    }),
};
exports.mockElasticsearch = {
    search: jest.fn().mockResolvedValue({
        hits: {
            hits: [{ _id: 'test-doc-1', _source: { title: 'Test Document' }, _score: 0.9 }],
        },
    }),
    index: jest.fn().mockResolvedValue({ result: 'created' }),
};
//# sourceMappingURL=services.mock.js.map