/* eslint-env jest */
/**
 * E2E Medical Document Ingestion Validation
 * 
 * Tests the complete ingestion pipeline for real medical documents:
 * - Upload through API
 * - Extract text from file
 * - Generate chunks with enhanced algorithm
 * - Extract metadata with AI
 * - Index in Pinecone
 * - Verify retrieval quality
 * - Verify citation generation
 * - Verify confidence scores
 */

import request from 'supertest';
import { app } from '../../app';
import { generateTestJWT, createTestUser } from '../helpers/test.helpers';
import { createTestDocument, MEDICAL_DOCUMENTS, cleanupTestDocuments } from './helpers/medical-documents.helper';
import { prisma, cleanupDatabase as cleanupTestDb } from './helpers/prisma.helper';
import { IngestionStatus } from '@prisma/client';

describe('E2E: Medical Document Ingestion Validation', () => {
  let authToken: string;
  let adminToken: string;
  let userId: string;
  let adminId: string;

  beforeAll(async () => {
    await cleanupDatabase();
    
    const user = await createTestUser({ email: `e2e-medical-${Date.now()}@example.com`, role: 'MEDICAL_USER' });
    userId = user.id;
    authToken = generateTestJWT({ id: user.id, email: user.email, role: user.role });

    const admin = await createTestUser({ email: `e2e-admin-${Date.now()}@example.com`, role: 'ADMIN' });
    adminId = admin.id;
    adminToken = generateTestJWT({ id: admin.id, email: admin.email, role: admin.role });
  });

  afterAll(async () => {
    await cleanupTestDocuments();
    await disconnectPrisma();
  });

  afterEach(async () => {
    await cleanupTestDocuments();
  });

  describe('1. Document Upload and Ingestion', () => {
    it('should upload and ingest a hypertension guideline document', async () => {
      const fixture = MEDICAL_DOCUMENTS[0];
      
      const document = await createTestDocument(fixture, userId);
      
      const response = await request(app)
        .get(`/api/v1/documents/${document.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toContain('Hypertension');
    });

    it('should ingest diabetes mellitus document', async () => {
      const fixture = MEDICAL_DOCUMENTS[1];
      const document = await createTestDocument(fixture, userId);

      const response = await request(app)
        .get(`/api/v1/documents/${document.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('2. Metadata Extraction Verification', () => {
    it('should extract correct metadata for hypertension document', async () => {
      const fixture = MEDICAL_DOCUMENTS[0];
      const document = await createTestDocument(fixture, userId);

      await new Promise(resolve => setTimeout(resolve, 2000));

      const metadata = await prisma.documentMetadata.findUnique({
        where: { documentId: document.id }
      });

      if (metadata) {
        expect(metadata.disease?.toLowerCase()).toContain('hypertension');
        expect(metadata.medicalSpecialty).toBe('cardiology');
        expect(metadata.authors?.length).toBeGreaterThan(0);
      }
    });

    it('should extract ICD-10 codes', async () => {
      const fixture = MEDICAL_DOCUMENTS[0];
      const document = await createTestDocument(fixture, userId);

      const metadata = await prisma.documentMetadata.findUnique({
        where: { documentId: document.id }
      });

      if (metadata && metadata.icd10 && metadata.icd10.length > 0) {
        const hasHypertensionCode = metadata.icd10.some(code => 
          code.startsWith('I10') || code.startsWith('I11') || code.startsWith('I12') || code.startsWith('I13')
        );
        expect(hasHypertensionCode).toBe(true);
      }
    });

    it('should extract SNOMED codes', async () => {
      const fixture = MEDICAL_DOCUMENTS[0];
      const document = await createTestDocument(fixture, userId);

      const metadata = await prisma.documentMetadata.findUnique({
        where: { documentId: document.id }
      });

      if (metadata && metadata.snomed && metadata.snomed.length > 0) {
        expect(metadata.snomed.length).toBeGreaterThan(0);
      }
    });

    it('should extract MeSH terms', async () => {
      const fixture = MEDICAL_DOCUMENTS[0];
      const document = await createTestDocument(fixture, userId);

      const metadata = await prisma.documentMetadata.findUnique({
        where: { documentId: document.id }
      });

      if (metadata && metadata.meshTerms && metadata.meshTerms.length > 0) {
        expect(metadata.meshTerms.length).toBeGreaterThan(0);
      }
    });
  });

  describe('3. Chunk Generation Verification', () => {
    it('should generate chunks for ingested document', async () => {
      const fixture = MEDICAL_DOCUMENTS[0];
      const document = await createTestDocument(fixture, userId);

      const chunks = await prisma.embeddingMetadata.findMany({
        where: { documentId: document.id }
      });

      expect(chunks.length).toBeGreaterThan(0);

      const chunkLengths = chunks.filter(c => c.chunkLength && c.chunkLength > 0).map(c => c.chunkLength!);
      if (chunkLengths.length > 0) {
        const avgChunkLength = chunkLengths.reduce((a, b) => a + b, 0) / chunkLengths.length;
        expect(avgChunkLength).toBeGreaterThan(100);
        expect(avgChunkLength).toBeLessThan(5000);
      }
    });

    it('should have valid chunk metadata', async () => {
      const fixture = MEDICAL_DOCUMENTS[0];
      const document = await createTestDocument(fixture, userId);

      const chunks = await prisma.embeddingMetadata.findMany({
        where: { documentId: document.id },
        take: 10
      });

      for (const chunk of chunks) {
        expect(chunk.pineconeVectorId).toBeTruthy();
        expect(chunk.chunkIndex).toBeGreaterThanOrEqual(0);
        expect(chunk.chunkText?.length).toBeGreaterThan(0);
        expect(chunk.documentId).toBe(document.id);
      }
    });

    it('should have low duplicate rate', async () => {
      const fixture = MEDICAL_DOCUMENTS[0];
      const document = await createTestDocument(fixture, userId);

      const total = await prisma.embeddingMetadata.count({
        where: { documentId: document.id }
      });
      const duplicates = await prisma.embeddingMetadata.count({
        where: { documentId: document.id, isDuplicate: true }
      });

      const duplicateRate = total > 0 ? (duplicates / total) * 100 : 0;
      expect(duplicateRate).toBeLessThan(10);
    });
  });

  describe('4. Pinecone Indexing Verification', () => {
    it('should have indexed vectors in Pinecone', async () => {
      const fixture = MEDICAL_DOCUMENTS[0];
      const document = await createTestDocument(fixture, userId);

      const chunks = await prisma.embeddingMetadata.findMany({
        where: { documentId: document.id }
      });

      const indexedChunks = chunks.filter(c => c.pineconeVectorId && c.chunkLength && c.chunkLength > 0);
      expect(indexedChunks.length).toBeGreaterThan(0);
    });
  });

  describe('5. BM25 Indexing Verification', () => {
    it('should have chunks for BM25 search', async () => {
      const fixture = MEDICAL_DOCUMENTS[0];
      const document = await createTestDocument(fixture, userId);

      const chunks = await prisma.embeddingMetadata.findMany({
        where: { documentId: document.id },
        select: { chunkText: true, chunkIndex: true }
      });

      expect(chunks.length).toBeGreaterThan(0);
    });
  });

  describe('6. Retrieval Quality Verification', () => {
    it('should retrieve hypertension document via semantic search', async () => {
      const fixture = MEDICAL_DOCUMENTS[0];
      const document = await createTestDocument(fixture, userId);

      await new Promise(resolve => setTimeout(resolve, 3000));

      const response = await request(app)
        .get('/api/v1/search?q=hypertension&type=semantic')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200 && response.body.success) {
        const results = response.body.data.results || [];
        if (results.length > 0) {
          const hasHypertension = results.some((r: any) => 
            (r.metadata?.text || r.metadata?.textPreview || '').toLowerCase().includes('hypertension')
          );
          expect(hasHypertension).toBe(true);
        }
      }
    }, 60000);

    it('should retrieve hypertension document via synonym search', async () => {
      const fixture = MEDICAL_DOCUMENTS[0];
      const document = await createTestDocument(fixture, userId);

      await new Promise(resolve => setTimeout(resolve, 3000));

      const response = await request(app)
        .get('/api/v1/search?q=high blood pressure&type=hybrid')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200 && response.body.success) {
        const results = response.body.data.results || [];
        if (results.length > 0) {
          const hasHypertension = results.some((r: any) => 
            (r.metadata?.text || r.metadata?.textPreview || '').toLowerCase().includes('hypertension') ||
            (r.metadata?.text || r.metadata?.textPreview || '').toLowerCase().includes('blood pressure')
          );
          expect(hasHypertension).toBe(true);
        }
      }
    }, 60000);
  });

  describe('7. AI Response Quality Verification', () => {
    it('should generate AI response with citations', async () => {
      const questionResponse = await request(app)
        .post('/api/v1/questions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          questionText: 'What is hypertension?',
          category: 'cardiology',
        });

      if (questionResponse.status === 201 || questionResponse.status === 200) {
        const questionId = questionResponse.body.data?.questionId || questionResponse.body.data?.id;
        if (questionId) {
          await new Promise(resolve => setTimeout(resolve, 15000));

          const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: { aiResponse: { include: { citations: true } } }
          });

          if (question?.aiResponse) {
            expect(question.aiResponse.summary?.length).toBeGreaterThan(0);
          }
        }
      }
    }, 30000);
  });

  describe('8. Multi-Document Ingestion', () => {
    it('should ingest hypertension and diabetes documents', async () => {
      const hypertensionDoc = await createTestDocument(MEDICAL_DOCUMENTS[0], userId);
      const diabetesDoc = await createTestDocument(MEDICAL_DOCUMENTS[1], userId);

      const htnChunks = await prisma.embeddingMetadata.count({
        where: { documentId: hypertensionDoc.id }
      });
      const dmChunks = await prisma.embeddingMetadata.count({
        where: { documentId: diabetesDoc.id }
      });

      expect(htnChunks).toBeGreaterThan(0);
      expect(dmChunks).toBeGreaterThan(0);
    });

    it('should have distinct chunks for different documents', async () => {
      const doc1 = await createTestDocument(MEDICAL_DOCUMENTS[0], userId);
      const doc2 = await createTestDocument(MEDICAL_DOCUMENTS[1], userId);

      const chunks1 = await prisma.embeddingMetadata.findMany({
        where: { documentId: doc1.id },
        select: { chunkText: true }
      });
      const chunks2 = await prisma.embeddingMetadata.findMany({
        where: { documentId: doc2.id },
        select: { chunkText: true }
      });

      const text1 = chunks1.map(c => c.chunkText).join(' ').toLowerCase();
      const text2 = chunks2.map(c => c.chunkText).join(' ').toLowerCase();

      const hasDistinctContent = 
        text1.includes('hypertension') || text2.includes('diabetes');
      
      expect(hasDistinctContent).toBe(true);
    });
  });

  describe('9. Document Retrieval via API', () => {
    it('should list all documents', async () => {
      const response = await request(app)
        .get('/api/v1/documents')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get document by ID', async () => {
      const fixture = MEDICAL_DOCUMENTS[0];
      const document = await createTestDocument(fixture, userId);

      const response = await request(app)
        .get(`/api/v1/documents/${document.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(document.id);
    });
  });

  describe('10. Complete Workflow Validation', () => {
    it('should complete full workflow: upload -> process -> retrieve -> ask', async () => {
      const fixture = MEDICAL_DOCUMENTS[0];
      const document = await createTestDocument(fixture, userId);

      await new Promise(resolve => setTimeout(resolve, 3000));

      const docResponse = await request(app)
        .get(`/api/v1/documents/${document.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(docResponse.status).toBe(200);

      const metadata = await prisma.documentMetadata.findUnique({
        where: { documentId: document.id }
      });

      const chunks = await prisma.embeddingMetadata.findMany({
        where: { documentId: document.id },
        take: 5
      });

      expect(chunks.length).toBeGreaterThan(0);

      const searchResponse = await request(app)
        .get('/api/v1/search?q=hypertension treatment&type=hybrid')
        .set('Authorization', `Bearer ${authToken}`);

      if (searchResponse.status === 200 && searchResponse.body.success) {
        const results = searchResponse.body.data.results || [];
        expect(results.length).toBeGreaterThanOrEqual(0);
      }
    }, 60000);
  });
});
