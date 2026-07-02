import prisma from '../src/config/prisma';
import { EmbeddingService } from '../src/modules/rag/services/embedding.service';
import { ChunkingService } from '../src/modules/rag/services/chunking.service';
import { PineconeService } from '../src/modules/rag/services/pinecone.service';
import fs from 'fs';
import path from 'path';

async function reindexDocuments() {
  console.log('Starting document reindexing...');
  
  const embeddingService = new EmbeddingService();
  const chunkingService = new ChunkingService();
  const pineconeService = new PineconeService();
  
  const documents = await prisma.medicalDocument.findMany({
    where: { ingestionStatus: 'COMPLETED' },
    include: { embeddingMetadata: true },
  });
  
  console.log(`Found ${documents.length} completed documents`);
  
  for (const doc of documents) {
    try {
      let fullPath = doc.fileUrl;
      if (!path.isAbsolute(fullPath)) {
        fullPath = path.join(process.cwd(), fullPath);
      }
      
      if (!fs.existsSync(fullPath)) {
        console.log(`Skipping ${doc.fileName} - file not found at ${fullPath}`);
        continue;
      }
      
      const content = fs.readFileSync(fullPath, 'utf8');
      const cleaned = await embeddingService.preprocessText(content);
      const chunks = chunkingService.chunkDocument(cleaned, {
        source: doc.source || 'MedlinePlus',
        specialty: doc.specialty || 'general'
      });
      
      console.log(`Reindexing ${doc.fileName}: ${chunks.length} chunks`);
      
      const embeddings: number[][] = [];
      for (let i = 0; i < chunks.length; i += 20) {
        const batch = chunks.slice(i, i + 20);
        const batchEmbeddings = await embeddingService.generateBatchEmbeddings(
          batch.map(c => c.text)
        );
        embeddings.push(...batchEmbeddings);
      }
      
      const existingVectorIds = doc.embeddingMetadata.map(m => m.pineconeVectorId);
      if (existingVectorIds.length > 0) {
        await pineconeService.deleteVectors(existingVectorIds);
        console.log(`Deleted ${existingVectorIds.length} old vectors`);
      }
      
      await pineconeService.storeChunks(chunks, embeddings, doc.id);
      
      await prisma.embeddingMetadata.deleteMany({ where: { documentId: doc.id } });
      for (let i = 0; i < chunks.length; i++) {
        await prisma.embeddingMetadata.create({
          data: {
            documentId: doc.id,
            pineconeVectorId: `${doc.id}_chunk_${i}`,
            chunkIndex: i,
            chunkText: chunks[i].text.substring(0, 1000),
          },
        });
      }
      
      console.log(`✓ Completed ${doc.fileName}`);
      
    } catch (error) {
      console.error(`✗ Failed ${doc.fileName}:`, error);
    }
  }
  
  console.log('Reindexing complete!');
  await prisma.$disconnect();
}

reindexDocuments().catch(console.error);