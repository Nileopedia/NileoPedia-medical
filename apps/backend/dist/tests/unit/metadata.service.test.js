"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-env jest */
const metadata_service_1 = require("../../modules/documents/metadata.service");
jest.mock('../../config/prisma', () => ({
    medicalDocument: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
    },
    documentMetadata: {
        upsert: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        deleteMany: jest.fn().mockResolvedValue({}),
    },
    embeddingMetadata: {
        create: jest.fn().mockResolvedValue({}),
    },
}));
describe('DocumentMetadataService', () => {
    let service;
    beforeEach(() => {
        jest.clearAllMocks();
        service = new metadata_service_1.DocumentMetadataService();
    });
    describe('extractFromPDF', () => {
        it('should extract title from PDF text', () => {
            const rawText = `Management of Type 2 Diabetes in Elderly Patients\n\nJohn Smith, Jane Doe\nDiabetes Care\n2024\n10.1000/diabetes.2024.001`;
            const result = service.extractFromPDF(rawText);
            expect(result.authors).toEqual(['John Smith', 'Jane Doe']);
            expect(result.publicationYear).toBe(2024);
            expect(result.doi).toBe('10.1000/diabetes.2024.001');
        });
        it('should extract DOI from first page', () => {
            const rawText = `Some document\nDOI: 10.1234/test.2023.001\nPublished 2023`;
            const result = service.extractFromPDF(rawText);
            expect(result.doi).toBe('10.1234/test.2023.001');
            expect(result.publicationYear).toBe(2023);
        });
    });
    describe('extractFromHTML', () => {
        it('should extract metadata from meta tags', () => {
            const rawText = `
        <head>
          <meta name="citation_title" content="Effects of Metformin in Elderly Patients">
          <meta name="citation_author" content="John Smith">
          <meta name="citation_author" content="Jane Doe">
          <meta name="citation_journal_title" content="Journal of Endocrinology">
          <meta name="citation_publication_date" content="2024/03/15">
          <meta name="citation_doi" content="10.1234/endo.2024.001">
          <title>Effects of Metformin</title>
        </head>
      `;
            const result = service.extractFromHTML(rawText);
            expect(result.title).toBe('Effects of Metformin in Elderly Patients');
            expect(result.authors).toEqual(['John Smith', 'Jane Doe']);
            expect(result.journal).toBe('Journal of Endocrinology');
            expect(result.publicationYear).toBe(2024);
            expect(result.doi).toBe('10.1234/endo.2024.001');
        });
    });
    describe('extractFromPubMed', () => {
        it('should extract PubMed article metadata', () => {
            const rawText = `
        <PubmedArticle>
          <ArticleTitle>Metformin and Cardiovascular Outcomes in Type 2 Diabetes</ArticleTitle>
          <Author>
            <LastName>Smith</LastName>
            <ForeName>John</ForeName>
          </Author>
          <Author>
            <LastName>Doe</LastName>
            <ForeName>Jane</ForeName>
          </Author>
          <Journal>
            <Title>Diabetes Care</Title>
          </Journal>
          <PubDate>
            <Year>2024</Year>
          </PubDate>
          <ELocationID EIdType="doi">10.1234/dc.2024.001</ELocationID>
          <PublisherName>American Diabetes Association</PublisherName>
        </PubmedArticle>
      `;
            const result = service.extractFromPubMed(rawText);
            expect(result.title).toBe('Metformin and Cardiovascular Outcomes in Type 2 Diabetes');
            expect(result.authors).toEqual(['John Smith', 'Jane Doe']);
            expect(result.journal).toBe('Diabetes Care');
            expect(result.publicationYear).toBe(2024);
            expect(result.doi).toBe('10.1234/dc.2024.001');
            expect(result.publisher).toBe('American Diabetes Association');
        });
        it('should handle CollectiveName authors', () => {
            const rawText = `
        <PubmedArticle>
          <ArticleTitle>Guidelines for Diabetes Care</ArticleTitle>
          <CollectiveName>American Diabetes Association</CollectiveName>
          <Journal>
            <Title>Diabetes Care</Title>
          </Journal>
          <PubDate>
            <Year>2024</Year>
          </PubDate>
        </PubmedArticle>
      `;
            const result = service.extractFromPubMed(rawText);
            expect(result.authors).toEqual(['American Diabetes Association']);
        });
    });
    describe('extractFromDocx', () => {
        it('should extract basic metadata from docx raw text', () => {
            const rawText = `Title: Clinical Guidelines for Diabetes Management 2024

Authors: John Smith, Jane Doe, Robert Brown

Published in 2024. DOI: 10.1234/guidelines.2024`;
            const result = service.extractFromDocx(rawText);
            expect(result.title).toBe('Clinical Guidelines for Diabetes Management 2024');
            expect(result.authors).toEqual(['John Smith', 'Jane Doe', 'Robert Brown']);
            expect(result.doi).toBe('10.1234/guidelines.2024');
            expect(result.publicationYear).toBe(2024);
        });
    });
    describe('extractMetadata routing', () => {
        it('should route PDF files to extractFromPDF', async () => {
            const spy = jest.spyOn(service, 'extractFromPDF').mockReturnValue({ authors: [], title: 'PDF Title' });
            await service.extractMetadata({
                rawText: 'pdf content',
                fileName: 'test.pdf',
                fileType: 'application/pdf',
            });
            expect(spy).toHaveBeenCalledWith('pdf content');
            spy.mockRestore();
        });
        it('should route HTML files to extractFromHTML', async () => {
            const spy = jest.spyOn(service, 'extractFromHTML').mockReturnValue({ authors: [], title: 'HTML Title' });
            await service.extractMetadata({
                rawText: '<html>content</html>',
                fileName: 'test.html',
                fileType: 'text/html',
            });
            expect(spy).toHaveBeenCalledWith('<html>content</html>');
            spy.mockRestore();
        });
        it('should route XML/PubMed files to extractFromPubMed', async () => {
            const spy = jest.spyOn(service, 'extractFromPubMed').mockReturnValue({ authors: [], title: 'PubMed Title' });
            await service.extractMetadata({
                rawText: '<PubmedArticle></PubmedArticle>',
                fileName: 'test.xml',
                fileType: 'application/xml',
            });
            expect(spy).toHaveBeenCalledWith('<PubmedArticle></PubmedArticle>');
            spy.mockRestore();
        });
    });
    describe('saveMetadata', () => {
        it('should create metadata when it does not exist', async () => {
            const mockUpsert = require('../../config/prisma').documentMetadata.upsert;
            mockUpsert.mockResolvedValue({ id: 'meta-1' });
            await service.saveMetadata({
                documentId: 'doc-1',
                title: 'Test',
                authors: ['John Smith'],
                journal: 'Test Journal',
                publicationYear: 2024,
            });
            expect(mockUpsert).toHaveBeenCalledWith({
                where: { documentId: 'doc-1' },
                create: expect.objectContaining({
                    documentId: 'doc-1',
                    title: 'Test',
                    authors: ['John Smith'],
                    journal: 'Test Journal',
                    publicationYear: 2024,
                }),
                update: expect.any(Object),
            });
        });
    });
    describe('getMetadata', () => {
        it('should return metadata for a document', async () => {
            const mockFindUnique = require('../../config/prisma').documentMetadata.findUnique;
            mockFindUnique.mockResolvedValue({ id: 'meta-1', documentId: 'doc-1' });
            const result = await service.getMetadata('doc-1');
            expect(mockFindUnique).toHaveBeenCalledWith({ where: { documentId: 'doc-1' } });
            expect(result).toEqual({ id: 'meta-1', documentId: 'doc-1' });
        });
    });
});
//# sourceMappingURL=metadata.service.test.js.map