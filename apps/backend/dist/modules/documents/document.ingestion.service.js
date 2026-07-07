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
class DocumentIngestionService {
    constructor() {
        this.pineconeService = null;
        this.embeddingService = new embedding_service_1.EmbeddingService();
        this.chunkingService = new chunking_service_1.ChunkingService();
        if (env_1.CONFIG.PINECONE_API_KEY && !env_1.CONFIG.USE_MOCK_EMBEDDINGS) {
            this.pineconeService = new pinecone_service_1.PineconeService();
        }
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
                uploadedById: input.uploadedById,
                fileName: input.fileName,
                fileUrl: input.fileUrl,
                fileType: input.fileType,
                fileSize: input.fileSize,
                ingestionStatus: client_1.IngestionStatus.PROCESSING,
            },
        });
        logger_1.logger.info({
            documentId: document.id,
            extractedLength: input.content.length,
        });
        let cleanContent = input.content;
        if (input.content.includes('<') && input.content.includes('>')) {
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
            source: input.source,
            publicationYear: input.publicationYear,
            specialty: input.specialty || 'general',
        });
        logger_1.logger.info({
            documentId: document.id,
            chunkCount: chunks.length,
        });
        const embeddedChunks = await this.chunkingService.generateEmbeddings(chunks);
        logger_1.logger.info({
            documentId: document.id,
            embeddingCount: embeddedChunks.length,
            dimensions: embeddedChunks[0]?.embedding?.length,
        });
        if (this.pineconeService && env_1.CONFIG.PINECONE_API_KEY) {
            const vectors = await this.pineconeService.storeChunks(chunks, embeddedChunks.map((e) => e.embedding), document.id);
            logger_1.logger.info({
                documentId: document.id,
                uploadedVectors: vectors?.length ?? chunks.length,
            });
            const stats = await this.pineconeService.describeIndexStats();
            logger_1.logger.info({
                totalVectors: stats?.totalRecordCount,
            });
        }
        else {
            logger_1.logger.info(`Mock mode: Skipping Pinecone storage for document ${document.id}`);
        }
        for (let i = 0; i < chunks.length; i++) {
            await prisma_1.default.embeddingMetadata.create({
                data: {
                    documentId: document.id,
                    pineconeVectorId: `${document.id}_chunk_${i}`,
                    chunkIndex: chunks[i].chunkIndex,
                    chunkText: chunks[i].text,
                },
            });
        }
        await prisma_1.default.medicalDocument.update({
            where: { id: document.id },
            data: { ingestionStatus: client_1.IngestionStatus.COMPLETED },
        });
        return { document, chunksCount: chunks.length };
    }
}
exports.DocumentIngestionService = DocumentIngestionService;
//# sourceMappingURL=document.ingestion.service.js.map