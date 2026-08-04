"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentIngestionService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../config/prisma"));
const embedding_service_1 = require("../rag/services/embedding.service");
const chunking_service_1 = require("../rag/services/chunking.service");
const pinecone_service_1 = require("../rag/services/pinecone.service");
const logger_1 = require("../../config/logger");
const env_1 = require("../../config/env");
const ai_metadata_service_1 = require("./ai-metadata.service");
const quality_validation_service_1 = require("../medical/quality-validation.service");
function normalizeStringField(value) {
    if (value === null || value === undefined)
        return null;
    if (typeof value === 'string')
        return value || null;
    if (Array.isArray(value)) {
        const filtered = value.filter((item) => typeof item === 'string' && item.trim() !== '');
        return filtered.length > 0 ? filtered.join(', ') : null;
    }
    return null;
}
class DocumentIngestionService {
    constructor() {
        this.pineconeService = null;
        this.embeddingService = new embedding_service_1.EmbeddingService();
        this.chunkingService = new chunking_service_1.ChunkingService();
        this.pineconeService = new pinecone_service_1.PineconeService();
        this.qualityValidationService = new quality_validation_service_1.QualityValidationService();
    }
    async ingestDocument(input) {
        const document = await prisma_1.default.medicalDocument.create({
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
                ingestionStatus: client_1.IngestionStatus.PROCESSING,
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
    async ingestContentForDocument(documentId, content, meta) {
        const document = await prisma_1.default.medicalDocument.update({
            where: { id: documentId },
            data: { ingestionStatus: client_1.IngestionStatus.PROCESSING },
        });
        logger_1.logger.info({
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
        const validChunksReport = this.qualityValidationService.validateDocumentChunks(chunks.map(c => ({
            text: c.text,
            title: meta.title,
            source: meta.source,
            specialty: meta.specialty,
            publicationYear: meta.publicationYear,
            chunkId: c.chunkId,
        })));
        logger_1.logger.info({
            documentId: document.id,
            chunkCount: chunks.length,
            validChunks: validChunksReport.validChunks,
            invalidChunks: validChunksReport.invalidChunks,
            avgChunkLength: validChunksReport.averageChunkLength,
            rejectionReasons: validChunksReport.rejectionReasons,
        });
        const deduplicatedChunks = await this.chunkingService.deduplicateChunks(chunks);
        logger_1.logger.info({
            documentId: document.id,
            chunksBeforeDedup: chunks.length,
            chunksAfterDedup: deduplicatedChunks.length,
            duplicatesRemoved: chunks.length - deduplicatedChunks.length,
        });
        const embeddedChunks = await this.chunkingService.generateEmbeddings(deduplicatedChunks);
        logger_1.logger.info({
            documentId: document.id,
            embeddingCount: embeddedChunks.length,
            dimensions: embeddedChunks[0]?.embedding?.length,
        });
        let taxonomy = null;
        try {
            taxonomy = await ai_metadata_service_1.aiMetadataExtractionService.extractMetadata(cleanContent, document.fileName);
        }
        catch (error) {
            logger_1.logger.error({
                documentId: document.id,
                error: 'AI metadata extraction failed',
                message: error instanceof Error ? error.message : String(error),
            });
        }
        const enrichedMetadata = this.buildChunkEnrichedMetadata(taxonomy);
        if (this.pineconeService && env_1.CONFIG.PINECONE_API_KEY) {
            const storeResult = await this.pineconeService.storeChunks(chunks, embeddedChunks.map((e) => e.embedding), document.id, enrichedMetadata);
            logger_1.logger.info({
                documentId: document.id,
                uploadedVectors: storeResult.vectors.length,
                successCount: storeResult.result.success,
                failedCount: storeResult.result.failed,
            });
            if (storeResult.result.failed > 0) {
                const error = new Error(`Failed to store ${storeResult.result.failed} of ${storeResult.vectors.length} vectors in Pinecone for document ${document.id}`);
                logger_1.logger.error(error.message);
                await prisma_1.default.medicalDocument.update({
                    where: { id: document.id },
                    data: { ingestionStatus: client_1.IngestionStatus.FAILED },
                });
                throw error;
            }
            const stats = await this.pineconeService.describeIndexStats();
            logger_1.logger.info({
                totalVectors: stats?.totalRecordCount,
            });
        }
        else {
            logger_1.logger.info(`Mock mode: Skipping Pinecone storage for document ${document.id}`);
        }
        await prisma_1.default.embeddingMetadata.deleteMany({
            where: { documentId: document.id },
        });
        const enrichmentPromises = chunks.map((chunk, i) => prisma_1.default.embeddingMetadata.create({
            data: {
                documentId: document.id,
                pineconeVectorId: `${document.id}_chunk_${i}`,
                chunkIndex: chunks[i].chunkIndex,
                chunkText: chunks[i].text,
            },
        }));
        await Promise.all(enrichmentPromises);
        if (taxonomy) {
            await prisma_1.default.documentMetadata.upsert({
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
            logger_1.logger.info({
                documentId: document.id,
                aiMetadataExtracted: true,
                disease: taxonomy.disease,
                specialty: taxonomy.specialty,
                citationQuality: taxonomy.citationQuality,
                metadataCompleteness: taxonomy.metadataCompleteness,
            });
        }
        await prisma_1.default.medicalDocument.update({
            where: { id: document.id },
            data: { ingestionStatus: client_1.IngestionStatus.COMPLETED },
        });
        return { document, chunksCount: chunks.length };
    }
    buildChunkEnrichedMetadata(taxonomy) {
        if (!taxonomy)
            return {};
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
exports.DocumentIngestionService = DocumentIngestionService;
//# sourceMappingURL=document.ingestion.service.js.map