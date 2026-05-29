import prisma from '../../config/prisma';
import axios from 'axios';
import { DocumentIngestionJob } from '../types';
import { logger } from '../../config/logger';
import fs from 'fs';
import path from 'path';
import { IngestionStatus } from '@prisma/client';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function processDocumentIngestion(job: DocumentIngestionJob) {
  const { documentId, fileUrl, fileName, title, specialty, documentType, uploadedById, source, publicationYear } = job;

  try {
    await prisma.medicalDocument.update({
      where: { id: documentId },
      data: { ingestionStatus: IngestionStatus.PROCESSING },
    });

    const fullPath = path.join(process.cwd(), fileUrl);
    let content = '';

    if (fs.existsSync(fullPath)) {
      content = fs.readFileSync(fullPath, 'utf-8');
    } else {
      throw new Error(`File not found: ${fileUrl}`);
    }

    const ingestResponse = await axios.post(`${AI_SERVICE_URL}/ingest`, {
      title,
      content,
      specialty,
      documentType,
      source,
      publicationYear,
    });

    await prisma.medicalDocument.update({
      where: { id: documentId },
      data: {
        ingestionStatus: IngestionStatus.COMPLETED,
        updatedAt: new Date(),
      },
    });

    logger.info(`Document ingestion completed: ${documentId}`);
    return ingestResponse.data;

  } catch (error) {
    await prisma.medicalDocument.update({
      where: { id: documentId },
      data: { ingestionStatus: IngestionStatus.FAILED },
    });
    logger.error(`Document ingestion failed: ${documentId}`, error);
    throw error;
  }
}