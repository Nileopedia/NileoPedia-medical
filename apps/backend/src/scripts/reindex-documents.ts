import prisma from '../config/prisma';
import { EmbeddingService } from '../modules/rag/services/embedding.service';
import { ChunkingService, DocumentChunk } from '../modules/rag/services/chunking.service';
import { PineconeService } from '../modules/rag/services/pinecone.service';
import fs from 'fs';
import path from 'path';

async function reindexDocuments() {
  console.log('Starting document reindexing...');
  
  const embeddingService = new EmbeddingService();
  const chunkingService = new ChunkingService();
  const pineconeService = new PineconeService();
  
  // Get all completed documents
  const documents = await prisma.medicalDocument.findMany({
    where: { ingestionStatus: 'COMPLETED' }
  });
  
  console.log(`Found ${documents.length} completed documents`);
  
  for (const doc of documents) {
    try {
      const filePath = path.join(process.cwd(), doc.fileUrl);
      if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${doc.fileName} - file not found`);
        continue;
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      const cleaned = await embeddingService.preprocessText(content);
      const chunks = chunkingService.chunkDocument(cleaned, {
        source: doc.source || 'MedlinePlus',
        specialty: doc.specialty || 'general'
      });
      
      console.log(`Reindexing ${doc.fileName}: ${chunks.length} chunks`);
      
      // Generate embeddings in small batches
      const embeddings: number[][] = [];
      for (let i = 0; i < chunks.length; i += 20) {
        const batch = chunks.slice(i, i + 20);
        const batchEmbeddings = await embeddingService.generateBatchEmbeddings(
          batch.map(c => c.text)
        );
        embeddings.push(...batchEmbeddings);
      }
      
      // Delete old vectors
      const vectorIds = chunks.map((_, i) => `${doc.id}_chunk_${i}`);
      await pineconeService.deleteVectors(vectorIds);
      
      // Re-upload vectors
      await pineconeService.storeChunks(chunks, embeddings, doc.id);
      console.log(`✓ Completed ${doc.fileName}`);
      
    } catch (error) {
      console.error(`✗ Failed ${doc.fileName}:`, error);
    }
  }
  
  console.log('Reindexing complete!');
  await prisma.$disconnect();
}

reindexDocuments().catch(console.error);