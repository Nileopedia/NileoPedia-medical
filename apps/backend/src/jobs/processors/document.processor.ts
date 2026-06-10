import prisma from '../../config/prisma';
import axios from 'axios';
import { DocumentIngestionJob } from '../types';
import { logger } from '../../config/logger';
import fs from 'fs';
import path from 'path';
import { IngestionStatus } from '@prisma/client';
import pdf from 'pdf-parse';
import * as mammoth from 'mammoth';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3001/api/v1/mock-ai';

export async function processDocumentIngestion(job: DocumentIngestionJob) {
  const { documentId, fileUrl, fileName, title, specialty, documentType, uploadedById, source, publicationYear, fileType } = job;

  try {
    await prisma.medicalDocument.update({
      where: { id: documentId },
      data: { ingestionStatus: IngestionStatus.PROCESSING },
    });

    const fullPath = path.join(process.cwd(), fileUrl);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fileUrl}`);
    }

    let content = '';
    const buffer = fs.readFileSync(fullPath);

    // Extract text based on file type
    if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      try {
        const pdfData = await pdf(buffer);
        content = pdfData.text || '';
      } catch (pdfError) {
        logger.warn(`PDF parsing failed, falling back to text extraction:`, pdfError);
        content = buffer.toString('utf-8');
      }
} else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                fileName.toLowerCase().endsWith('.docx')) {
      try {
        const docxResult = await mammoth.extractRawText({ buffer });
        content = docxResult.value || '';
      } catch (docxError) {
        logger.warn(`DOCX parsing failed, falling back to text extraction:`, docxError);
        content = buffer.toString('utf-8');
      }
    } else if (fileType === 'text/html' || fileName.toLowerCase().endsWith('.html') || fileName.toLowerCase().endsWith('.htm')) {
      try {
        const $ = (await import('cheerio')).load(buffer.toString('utf-8'));
        $('script, style, nav, header, footer, aside').remove();
        content = $('body').text() || $('html').text() || '';
        content = content.replace(/\s+/g, ' ').trim();
      } catch (htmlError) {
        logger.warn(`HTML parsing failed, falling back to text extraction:`, htmlError);
        content = buffer.toString('utf-8');
      }
    } else {
      // Plain text files
      content = buffer.toString('utf-8');
    }

    if (!content || !content.trim()) {
      throw new Error('No content could be extracted from the file');
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