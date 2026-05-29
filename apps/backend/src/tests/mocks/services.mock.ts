export const mockPrismaClient = {
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $executeRawUnsafe: jest.fn().mockResolvedValue([]),
  $transaction: jest.fn().mockImplementation(async (fn: any) => fn(mockPrismaClient)),
  notification: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(({ data }: { data: any }) => Promise.resolve({ ...data, id: 'mock-notification-id', createdAt: new Date() })),
    update: jest.fn().mockImplementation(({ data }: { data: any }) => Promise.resolve({ ...data })),
    deleteMany: jest.fn().mockResolvedValue({}),
  },
  auditLog: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(({ data }: { data: any }) => Promise.resolve({ ...data, id: 'mock-audit-id', createdAt: new Date() })),
    deleteMany: jest.fn().mockResolvedValue({}),
  },
  citation: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(({ data }: { data: any }) => Promise.resolve({ ...data, id: 'mock-citation-id', createdAt: new Date() })),
    update: jest.fn().mockImplementation(({ data }: { data: any }) => Promise.resolve({ ...data })),
    delete: jest.fn().mockResolvedValue({}),
    deleteMany: jest.fn().mockResolvedValue({}),
  },
  aIResponse: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(({ data }: { data: any }) => Promise.resolve({ ...data, id: 'mock-response-id', createdAt: new Date(), updatedAt: new Date() })),
    update: jest.fn().mockImplementation(({ data }: { data: any }) => Promise.resolve({ ...data })),
    deleteMany: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
  },
  question: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(({ data }: { data: any }) => Promise.resolve({ ...data, id: 'mock-question-id', createdAt: new Date() })),
    update: jest.fn().mockImplementation(({ data }: { data: any }) => Promise.resolve({ ...data })),
    deleteMany: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
  },
  embeddingMetadata: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation(({ data }: { data: any }) => Promise.resolve({ ...data, id: 'mock-embedding-id', createdAt: new Date() })),
    deleteMany: jest.fn().mockResolvedValue({}),
  },
  medicalDocument: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(({ data }: { data: any }) => Promise.resolve({ ...data, id: 'mock-doc-id', createdAt: new Date(), updatedAt: new Date() })),
    update: jest.fn().mockImplementation(({ data }: { data: any }) => Promise.resolve({ ...data })),
    delete: jest.fn().mockResolvedValue({}),
    deleteMany: jest.fn().mockResolvedValue({}),
  },
  session: {
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(({ data }: { data: any }) => Promise.resolve({ ...data, id: 'mock-session-id', createdAt: new Date() })),
    deleteMany: jest.fn().mockResolvedValue({}),
  },
  user: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(({ data }: { data: any }) => Promise.resolve({ ...data, id: 'mock-user-id', createdAt: new Date(), updatedAt: new Date() })),
    update: jest.fn().mockImplementation(({ data }: { data: any }) => Promise.resolve({ ...data })),
    deleteMany: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
  },
  validationReview: {
    findMany: jest.fn().mockResolvedValue([]),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(({ data }: { data: any }) => Promise.resolve({ ...data, id: 'mock-review-id', reviewedAt: new Date() })),
    update: jest.fn().mockImplementation(({ data }: { data: any }) => Promise.resolve({ ...data })),
  },
};

export const mockOpenAI = {
  embeddings: {
    create: jest.fn().mockResolvedValue({
      data: [{ embedding: Array(1536).fill(0).map(() => Math.random()) }],
    }),
  },
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Mocked AI response for testing' } }],
      }),
    },
  },
};

export const mockPinecone = {
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

export const mockElasticsearch = {
  search: jest.fn().mockResolvedValue({
    hits: {
      hits: [{ _id: 'test-doc-1', _source: { title: 'Test Document' }, _score: 0.9 }],
    },
  }),
  index: jest.fn().mockResolvedValue({ result: 'created' }),
};