"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentIngestionService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const embedding_service_1 = require("../rag/services/embedding.service");
const chunking_service_1 = require("../rag/services/chunking.service");
const pinecone_service_1 = require("../rag/services/pinecone.service");
class DocumentIngestionService {
    constructor() {
        this.embeddingService = new embedding_service_1.EmbeddingService();
        this.chunkingService = new chunking_service_1.ChunkingService();
        this.pineconeService = new pinecone_service_1.PineconeService();
    }
    async ingestDocument(input) {
        const cleanedContent = input.content;
        const document = await prisma_1.default.medicalDocument.create({
            data: {
                title: input.title,
                category: input.category,
                source: input.source,
                content: cleanedContent,
                uploadedBy: input.uploadedBy,
                isVerified: false,
                version: 1,
            },
        });
        const chunks = this.chunkingService.chunkDocument(cleanedContent, {
            source: input.source,
            publicationYear: input.publicationYear,
            specialty: input.specialty || 'general',
        });
        const embeddedChunks = await this.chunkingService.generateEmbeddings(chunks);
        await this.pineconeService.storeChunks(chunks, embeddedChunks.map(e => e.embedding), document.id);
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
        return { document, chunksCount: chunks.length };
    }
}
exports.DocumentIngestionService = DocumentIngestionService;
//# sourceMappingURL=document.ingestion.service.js.map