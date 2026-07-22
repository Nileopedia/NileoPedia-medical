import { PrismaClient } from '@prisma/client';
import { DocumentIngestionService } from '../src/modules/documents/document.ingestion.service';
import { PineconeService } from '../src/modules/rag/services/pinecone.service';

const prisma = new PrismaClient();
const ingestionService = new DocumentIngestionService();
const pineconeService = new PineconeService();

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
        await sleep(2000);
      }
    } catch (e) {
      console.log('Could not clear Pinecone index:', e);
    }
  }

  let completed = 0;
  let failed = 0;
  const failedDocs: string[] = [];

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
      completed++;
    } catch (error) {
      console.error(`Failed to re-ingest ${doc.id}:`, error);
      failed++;
      failedDocs.push(doc.id);
    }

    await sleep(1000);
  }

  console.log('\n=== Re-ingestion Summary ===');
  console.log(`Total documents: ${documents.length}`);
  console.log(`Completed: ${completed}`);
  console.log(`Failed: ${failed}`);

  if (failedDocs.length > 0) {
    console.log('\nRetrying failed documents...');
    for (const docId of failedDocs) {
      try {
        const doc = documents.find(d => d.id === docId);
        if (!doc || !doc.fileUrl) continue;

        const fs = await import('fs');
        const path = await import('path');
        const fullPath = path.join(process.cwd(), doc.fileUrl);

        if (!fs.existsSync(fullPath)) continue;

        const content = fs.readFileSync(fullPath, 'utf-8');
        console.log(`Retrying ${docId}: ${doc.title}`);

        await ingestionService.ingestContentForDocument(doc.id, content, {
          title: doc.title || undefined,
          source: doc.source || undefined,
          specialty: doc.specialty || 'general',
          documentType: doc.documentType || undefined,
          publicationYear: doc.publicationYear || undefined,
        });

        console.log(`Retry succeeded for ${docId}`);
        completed++;
        failed--;
      } catch (error) {
        console.error(`Retry failed for ${docId}:`, error);
      }

      await sleep(2000);
    }
  }

  console.log('\n=== Final Summary ===');
  console.log(`Completed: ${completed}`);
  console.log(`Failed: ${failed}`);
  console.log('Re-ingestion complete');
  await prisma.$disconnect();
}

reingest().catch((e) => {
  console.error('Re-ingestion failed:', e);
  process.exit(1);
});
