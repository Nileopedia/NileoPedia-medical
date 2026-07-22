const createMockModel = () => {
  const model: any = {};
  ['create', 'createMany', 'update', 'updateMany', 'delete', 'deleteMany', 'findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy'].forEach((method) => {
    model[method] = jest.fn();
  });
  return model;
};

const mockPrisma: any = {
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
