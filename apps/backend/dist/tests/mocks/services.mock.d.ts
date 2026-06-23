/// <reference types="jest" />
export declare const mockPrismaClient: any;
export declare const mockGroq: {
    chat: {
        completions: {
            create: jest.Mock<any, any, any>;
        };
    };
};
export declare const mockOpenAI: {
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