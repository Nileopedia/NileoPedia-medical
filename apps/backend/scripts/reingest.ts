import { PrismaClient } from '@prisma/client';
import { DocumentIngestionService } from '../src/modules/documents/document.ingestion.service';
import { PineconeService } from '../src/modules/rag/services/pinecone.service';

const prisma = new PrismaClient();
const ingestionService = new DocumentIngestionService();
const pineconeService = new PineconeService();

async function reingest() {
  console.log('Starting re-ingestion...');

  const documents = await prisma.medicalDocument.findMany({
    where: { ingestionStatus: 'COMPLETED' },
    select: { id: true, title: true, fileUrl: true, source: true, specialty: true, documentType: true, publicationYear: true },
  });

  console.log(`Found ${documents.length} documents to re-ingest`);

  if (pineconeService && pineconeService['isAvailable']) {
    console.log('Clearing Pinecone index...');
    try {
      const pineconeClient = pineconeService['pinecone'];
      if (pineconeClient) {
        const index = pineconeClient.index(process.env.PINECONE_INDEX_NAME || 'nileopedia-med');
        await index.deleteAll();
        console.log('Pinecone index cleared');
      }
    } catch (e) {
      console.log('Could not clear Pinecone index:', e);
    }
  }

  for (const doc of documents) {
    try {
      if (!doc.fileUrl) {
        console.log(`Skipping ${doc.id}: no file URL`);
        continue;
      }

      const fs = await import('fs');
      const path = await import('path');
      const fullPath = path.join(process.cwd(), doc.fileUrl);

      if (!fs.existsSync(fullPath)) {
        console.log(`Skipping ${doc.id}: file not found at ${fullPath}`);
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      console.log(`Re-ingesting ${doc.id}: ${doc.title}`);

      await ingestionService.ingestContentForDocument(doc.id, content, {
        title: doc.title || undefined,
        source: doc.source || undefined,
        specialty: doc.specialty || 'general',
        documentType: doc.documentType || undefined,
        publicationYear: doc.publicationYear || undefined,
      });

      console.log(`Completed ${doc.id}`);
    } catch (error) {
      console.error(`Failed to re-ingest ${doc.id}:`, error);
    }
  }

  console.log('Re-ingestion complete');
  await prisma.$disconnect();
}

reingest().catch((e) => {
  console.error('Re-ingestion failed:', e);
  process.exit(1);
});
