"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentIngestionService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
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
        const chunks = this.chunkingService.chunkDocument(input.content, {
            source: input.source,
            publicationYear: input.publicationYear,
            specialty: input.specialty || 'general',
        });
        const embeddedChunks = await this.chunkingService.generateEmbeddings(chunks);
        if (this.pineconeService && env_1.CONFIG.PINECONE_API_KEY) {
            await this.pineconeService.storeChunks(chunks, embeddedChunks.map(e => e.embedding), document.id);
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