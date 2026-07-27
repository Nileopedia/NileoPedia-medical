import { IngestionStatus } from '@prisma/client';
import prisma from '../../config/prisma';
import { EmbeddingService } from '../rag/services/embedding.service';
import { ChunkingService } from '../rag/services/chunking.service';
import { PineconeService } from '../rag/services/pinecone.service';
import { logger } from '../../config/logger';
import { CONFIG } from '../../config/env';
import { aiMetadataExtractionService } from './ai-metadata.service';
import { QualityValidationService } from '../medical/quality-validation.service';

function normalizeStringField(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value || null;
  if (Array.isArray(value)) {
    const filtered = value.filter((item) => typeof item === 'string' && item.trim() !== '');
    return filtered.length > 0 ? filtered.join(', ') : null;
  }
  return null;
}

export class DocumentIngestionService {
  private embeddingService: EmbeddingService;

  private chunkingService: ChunkingService;

  private pineconeService: PineconeService | null = null;
  
  private qualityValidationService: QualityValidationService;

  constructor() {
    this.embeddingService = new EmbeddingService();
    this.chunkingService = new ChunkingService();
    this.pineconeService = new PineconeService();
    this.qualityValidationService = new QualityValidationService();
  }

  async ingestDocument(input: {
    title: string;
    description?: string;
    source?: string;
    content: string;
    publicationYear?: number;
    specialty?: string;
    documentType?: string;
    uploadedById?: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }) {
    const document = await prisma.medicalDocument.create({
      data: {
        title: input.title,
        description: input.description,
        source: input.source,
        publicationYear: input.publicationYear,
        specialty: input.specialty,
        documentType: input.documentType,
        uploadedById: input.uploadedById ?? null,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        fileType: input.fileType,
        fileSize: input.fileSize,
        ingestionStatus: IngestionStatus.PROCESSING,
      },
    });

    return this.ingestContentForDocument(document.id, input.content, {
      title: input.title,
      source: input.source,
      specialty: input.specialty,
      documentType: input.documentType,
      publicationYear: input.publicationYear,
    });
  }

  async ingestContentForDocument(
    documentId: string,
    content: string,
    meta: { title?: string; source?: string; specialty?: string; documentType?: string; publicationYear?: number }
  ) {
    const document = await prisma.medicalDocument.update({
      where: { id: documentId },
      data: { ingestionStatus: IngestionStatus.PROCESSING },
    });

    logger.info({
      documentId: document.id,
      extractedLength: content.length,
    });

    let cleanContent = content;
    if (content.includes('<') && content.includes('>')) {
      cleanContent = cleanContent
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
        .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
        .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
        .replace(/<img\b[^>]*>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    const chunks = this.chunkingService.chunkDocument(cleanContent, {
      documentId: document.id,
      title: meta.title,
      source: meta.source,
      specialty: meta.specialty || 'general',
      documentType: meta.documentType,
      publicationYear: meta.publicationYear,
    });

    const validChunksReport = this.qualityValidationService.validateDocumentChunks(
      chunks.map(c => ({
        text: c.text,
        title: meta.title,
        source: meta.source,
        specialty: meta.specialty,
        publicationYear: meta.publicationYear,
        chunkId: c.chunkId,
      }))
    );

    logger.info({
      documentId: document.id,
      chunkCount: chunks.length,
      validChunks: validChunksReport.validChunks,
      invalidChunks: validChunksReport.invalidChunks,
      avgChunkLength: validChunksReport.averageChunkLength,
      rejectionReasons: validChunksReport.rejectionReasons,
    });

    const deduplicatedChunks = await this.chunkingService.deduplicateChunks(chunks);
    logger.info({
      documentId: document.id,
      chunksBeforeDedup: chunks.length,
      chunksAfterDedup: deduplicatedChunks.length,
      duplicatesRemoved: chunks.length - deduplicatedChunks.length,
    });

    const embeddedChunks = await this.chunkingService.generateEmbeddings(deduplicatedChunks);

    logger.info({
      documentId: document.id,
      embeddingCount: embeddedChunks.length,
      dimensions: embeddedChunks[0]?.embedding?.length,
    });

    let taxonomy: any = null;
    try {
      taxonomy = await aiMetadataExtractionService.extractMetadata(cleanContent, document.fileName);
    } catch (error) {
      logger.error({
        documentId: document.id,
        error: 'AI metadata extraction failed',
        message: error instanceof Error ? error.message : String(error),
      });
    }

    const enrichedMetadata = this.buildChunkEnrichedMetadata(taxonomy);

    if (this.pineconeService && CONFIG.PINECONE_API_KEY) {
      const storeResult = await this.pineconeService.storeChunks(
        chunks,
        embeddedChunks.map((e) => e.embedding),
        document.id,
        enrichedMetadata,
      );

      logger.info({
        documentId: document.id,
        uploadedVectors: storeResult.vectors.length,
        successCount: storeResult.result.success,
        failedCount: storeResult.result.failed,
      });

      if (storeResult.result.failed > 0) {
        const error = new Error(`Failed to store ${storeResult.result.failed} of ${storeResult.vectors.length} vectors in Pinecone for document ${document.id}`);
        logger.error(error.message);
        await prisma.medicalDocument.update({
          where: { id: document.id },
          data: { ingestionStatus: IngestionStatus.FAILED },
        });
        throw error;
      }

      const stats = await this.pineconeService.describeIndexStats();
      logger.info({
        totalVectors: stats?.totalRecordCount,
      });
    } else {
      logger.info(`Mock mode: Skipping Pinecone storage for document ${document.id}`);
    }

    await prisma.embeddingMetadata.deleteMany({
      where: { documentId: document.id },
    });

    const enrichmentPromises = chunks.map((chunk, i) => 
      prisma.embeddingMetadata.create({
        data: {
          documentId: document.id,
          pineconeVectorId: `${document.id}_chunk_${i}`,
          chunkIndex: chunks[i].chunkIndex,
          chunkText: chunks[i].text,
        },
      })
    );

    await Promise.all(enrichmentPromises);

    if (taxonomy) {
      await prisma.documentMetadata.upsert({
        where: { documentId: document.id },
        create: {
          documentId: document.id,
          title: taxonomy.title || meta.title,
          abstract: taxonomy.abstract,
          disease: taxonomy.disease,
          medicalSpecialty: taxonomy.specialty,
          symptoms: taxonomy.symptoms,
          diagnosis: taxonomy.diagnosis,
          treatment: taxonomy.treatments,
          medication: taxonomy.medications,
          contraindications: taxonomy.contraindications,
          complications: taxonomy.complications,
          prevention: taxonomy.prevention,
          prognosis: taxonomy.prognosis,
          keywords: taxonomy.keywords,
          meshTerms: taxonomy.meshTerms,
          icd10: normalizeStringField(taxonomy.icd10),
          snomed: normalizeStringField(taxonomy.snomed),
          publicationYear: taxonomy.publicationYear,
          journal: taxonomy.journal,
          publisher: taxonomy.publisher,
          authors: taxonomy.authors,
          doi: taxonomy.doi,
          pmid: taxonomy.pmid,
          pmcid: taxonomy.pmcid,
          isbn: taxonomy.isbn,
          language: taxonomy.language,
          sourceURL: taxonomy.sourceURL,
          documentType: taxonomy.documentType || meta.documentType,
        },
        update: {
          title: taxonomy.title || meta.title,
          abstract: taxonomy.abstract,
          disease: taxonomy.disease,
          medicalSpecialty: taxonomy.specialty,
          symptoms: taxonomy.symptoms,
          diagnosis: taxonomy.diagnosis,
          treatment: taxonomy.treatments,
          medication: taxonomy.medications,
          contraindications: taxonomy.contraindications,
          complications: taxonomy.complications,
          prevention: taxonomy.prevention,
          prognosis: taxonomy.prognosis,
          keywords: taxonomy.keywords,
          meshTerms: taxonomy.meshTerms,
          icd10: normalizeStringField(taxonomy.icd10),
          snomed: normalizeStringField(taxonomy.snomed),
          publicationYear: taxonomy.publicationYear,
          journal: taxonomy.journal,
          publisher: taxonomy.publisher,
          authors: taxonomy.authors,
          doi: taxonomy.doi,
          pmid: taxonomy.pmid,
          pmcid: taxonomy.pmcid,
          isbn: taxonomy.isbn,
          language: taxonomy.language,
          sourceURL: taxonomy.sourceURL,
          documentType: taxonomy.documentType || meta.documentType,
        },
      });

      logger.info({
        documentId: document.id,
        aiMetadataExtracted: true,
        disease: taxonomy.disease,
        specialty: taxonomy.specialty,
        citationQuality: taxonomy.citationQuality,
        metadataCompleteness: taxonomy.metadataCompleteness,
      });
    }

    await prisma.medicalDocument.update({
      where: { id: document.id },
      data: { ingestionStatus: IngestionStatus.COMPLETED },
    });

    return { document, chunksCount: chunks.length };
  }

  private buildChunkEnrichedMetadata(taxonomy: any): Record<string, any> {
    if (!taxonomy) return {};
    return {
      disease: taxonomy.disease || '',
      specialty: taxonomy.specialty || 'general',
      symptoms: taxonomy.symptoms || [],
      diagnosis: taxonomy.diagnosis || [],
      treatments: taxonomy.treatments || [],
      medications: taxonomy.medications || [],
      complications: taxonomy.complications || [],
      prevention: taxonomy.prevention || [],
      contraindications: taxonomy.contraindications || [],
      patientEducation: taxonomy.patientEducation || [],
      icd10: taxonomy.icd10 || [],
      snomed: taxonomy.snomed || [],
      meshTerms: taxonomy.meshTerms || [],
      keywords: taxonomy.keywords || [],
      abstract: taxonomy.abstract || '',
      prognosis: taxonomy.prognosis || '',
      citationQuality: taxonomy.citationQuality || 0,
      metadataCompleteness: taxonomy.metadataCompleteness || 0,
    };
  }
}
