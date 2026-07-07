"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma_1 = __importDefault(require("../config/prisma"));
const embedding_service_1 = require("../modules/rag/services/embedding.service");
const chunking_service_1 = require("../modules/rag/services/chunking.service");
const pinecone_service_1 = require("../modules/rag/services/pinecone.service");
function stripHtml(content) {
    return content
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
async function reindexDocuments() {
    console.log('Starting document reindexing...');
    const embeddingService = new embedding_service_1.EmbeddingService();
    const chunkingService = new chunking_service_1.ChunkingService();
    const pineconeService = new pinecone_service_1.PineconeService();
    const documents = await prisma_1.default.medicalDocument.findMany({
        where: { ingestionStatus: 'COMPLETED' },
        include: { embeddingMetadata: true },
    });
    console.log(`Found ${documents.length} completed documents`);
    for (const doc of documents) {
        try {
            let fullPath = doc.fileUrl;
            if (!path_1.default.isAbsolute(fullPath)) {
                fullPath = path_1.default.join(process.cwd(), fullPath);
            }
            if (!fs_1.default.existsSync(fullPath)) {
                console.log(`Skipping ${doc.fileName} - file not found at ${fullPath}`);
                continue;
            }
            const content = fs_1.default.readFileSync(fullPath, 'utf8');
            const cleanContent = stripHtml(content);
            const chunks = chunkingService.chunkDocument(cleanContent, {
                source: doc.source || 'MedlinePlus',
                specialty: doc.specialty || 'general'
            });
            console.log(`Reindexing ${doc.fileName}: ${chunks.length} chunks`);
            const embeddings = [];
            for (let i = 0; i < chunks.length; i += 20) {
                const batch = chunks.slice(i, i + 20);
                const batchEmbeddings = await embeddingService.generateBatchEmbeddings(batch.map((c) => c.text));
                embeddings.push(...batchEmbeddings);
            }
            const existingVectorIds = doc.embeddingMetadata.map((m) => m.pineconeVectorId);
            if (existingVectorIds.length > 0) {
                await pineconeService.deleteVectors(existingVectorIds);
                console.log(`Deleted ${existingVectorIds.length} old vectors`);
            }
            await pineconeService.storeChunks(chunks, embeddings, doc.id);
            await prisma_1.default.embeddingMetadata.deleteMany({ where: { documentId: doc.id } });
            for (let i = 0; i < chunks.length; i++) {
                await prisma_1.default.embeddingMetadata.create({
                    data: {
                        documentId: doc.id,
                        pineconeVectorId: `${doc.id}_chunk_${i}`,
                        chunkIndex: i,
                        chunkText: chunks[i].text.substring(0, 1000),
                    },
                });
            }
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