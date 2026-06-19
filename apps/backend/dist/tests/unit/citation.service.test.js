"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-env jest */
const citation_service_1 = require("../../modules/citations/citation.service");
jest.mock('../../config/prisma', () => ({
    citation: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({}),
    },
}));
jest.mock('../../jobs/queues', () => ({
    aiQueue: { add: jest.fn().mockResolvedValue({}) },
}));
describe('CitationService', () => {
    it('should exist', () => {
        const service = new citation_service_1.CitationService();
        expect(service).toBeDefined();
    });
    it('should have searchCitations method', () => {
        const service = new citation_service_1.CitationService();
        expect(typeof service.searchCitations).toBe('function');
    });
    it('should have createCitation method', () => {
        const service = new citation_service_1.CitationService();
        expect(typeof service.createCitation).toBe('function');
    });
});
//# sourceMappingURL=citation.service.test.js.map