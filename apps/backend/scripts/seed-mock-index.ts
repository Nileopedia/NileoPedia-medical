import fs from 'fs';
import path from 'path';
import prisma from '../src/config/prisma';
import { EmbeddingService } from '../src/modules/rag/services/embedding.service';
import { ChunkingService } from '../src/modules/rag/services/chunking.service';
import { PineconeService } from '../src/modules/rag/services/pinecone.service';

function stripHtml(content: string): string {
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

async function main() {
  const embeddingService = new EmbeddingService();
  const chunkingService = new ChunkingService();
  const pineconeService = new PineconeService();

  const uploadDir = path.join(process.cwd(), 'uploads');
  const files = fs.readdirSync(uploadDir).filter((f) => f.endsWith('.html') && fs.statSync(path.join(uploadDir, f)).size > 1000);

  console.log('Found', files.length, 'HTML files');

  for (const file of files.slice(0, 3)) {
    const fullPath = path.join(uploadDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const clean = stripHtml(content).substring(0, 10000);

    const doc = await prisma.medicalDocument.create({
      data: {
        title: file.replace(/-\w+\.html/, '').replace(/\d+/, 'Medical Document'),
        source: 'MedlinePlus',
        fileUrl: 'file://' + fullPath,
        fileName: file,
        fileType: 'html',
        fileSize: fs.statSync(fullPath).size,
        specialty: 'general',
        ingestionStatus: 'COMPLETED',
        uploadedById: '1d5ffdb0-dd96-4c36-9417-3ccefc9eb7b0',
      },
    });

    const chunks = chunkingService.chunkDocument(clean, { source: 'MedlinePlus', specialty: 'general' });
    console.log('Created', chunks.length, 'chunks for', file);

    if (chunks.length > 0) {
      const batchSize = 20;
      for (let i = 0; i < Math.min(chunks.length, 200); i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const embeddings = await embeddingService.generateBatchEmbeddings(batch.map((c) => c.text));
        await pineconeService.storeChunks(batch, embeddings, doc.id);
      }
    }

    console.log('✓ Ingested', file);
  }

  console.log('\nTotal vectors:', PineconeService.mockVectors.length);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});