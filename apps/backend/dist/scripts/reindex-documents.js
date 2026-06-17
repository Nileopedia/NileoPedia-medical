"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const embedding_service_1 = require("../modules/rag/services/embedding.service");
const chunking_service_1 = require("../modules/rag/services/chunking.service");
const pinecone_service_1 = require("../modules/rag/services/pinecone.service");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function reindexDocuments() {
    console.log('Starting document reindexing...');
    const embeddingService = new embedding_service_1.EmbeddingService();
    const chunkingService = new chunking_service_1.ChunkingService();
    const pineconeService = new pinecone_service_1.PineconeService();
    // Get all completed documents
    const documents = await prisma_1.default.medicalDocument.findMany({
        where: { ingestionStatus: 'COMPLETED' }
    });
    console.log(`Found ${documents.length} completed documents`);
    for (const doc of documents) {
        try {
            const filePath = path_1.default.join(process.cwd(), doc.fileUrl);
            if (!fs_1.default.existsSync(filePath)) {
                console.log(`Skipping ${doc.fileName} - file not found`);
                continue;
            }
            const content = fs_1.default.readFileSync(filePath, 'utf8');
            const cleaned = await embeddingService.preprocessText(content);
            const chunks = chunkingService.chunkDocument(cleaned, {
                source: doc.source || 'MedlinePlus',
                specialty: doc.specialty || 'general'
            });
            console.log(`Reindexing ${doc.fileName}: ${chunks.length} chunks`);
            // Generate embeddings in small batches
            const embeddings = [];
            for (let i = 0; i < chunks.length; i += 20) {
                const batch = chunks.slice(i, i + 20);
                const batchEmbeddings = await embeddingService.generateBatchEmbeddings(batch.map(c => c.text));
                embeddings.push(...batchEmbeddings);
            }
            // Delete old vectors
            const vectorIds = chunks.map((_, i) => `${doc.id}_chunk_${i}`);
            await pineconeService.deleteVectors(vectorIds);
            // Re-upload vectors
            await pineconeService.storeChunks(chunks, embeddings, doc.id);
            console.log(`✓ Completed ${doc.fileName}`);
        }
        catch (error) {
            console.error(`✗ Failed ${doc.fileName}:`, error);
        }
    }
    console.log('Reindexing complete!');
    await prisma_1.default.$disconnect();
}
reindexDocuments().catch(console.error);
//# sourceMappingURL=reindex-documents.js.map