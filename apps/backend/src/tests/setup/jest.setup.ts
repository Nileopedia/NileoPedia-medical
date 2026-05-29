// Mock Prisma for tests - use in-memory mock instead of real DB
const mockPrisma = {
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $executeRawUnsafe: jest.fn(),
  notification: { deleteMany: jest.fn().mockResolvedValue({}) },
  auditLog: { deleteMany: jest.fn().mockResolvedValue({}) },
  citation: { deleteMany: jest.fn().mockResolvedValue({}) },
  aIResponse: { deleteMany: jest.fn().mockResolvedValue({}) },
  question: { deleteMany: jest.fn().mockResolvedValue({}) },
  embeddingMetadata: { deleteMany: jest.fn().mockResolvedValue({}) },
  medicalDocument: { deleteMany: jest.fn().mockResolvedValue({}) },
  session: { deleteMany: jest.fn().mockResolvedValue({}) },
  user: { deleteMany: jest.fn().mockResolvedValue({}) },
};

beforeAll(async () => {
  await mockPrisma.$connect();
});

afterAll(async () => {
  await mockPrisma.$disconnect();
});

afterEach(async () => {
  jest.clearAllMocks();
});

export { mockPrisma as prisma };