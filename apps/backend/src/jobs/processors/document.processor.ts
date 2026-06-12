import prisma from '../../config/prisma';
import axios from 'axios';
import { DocumentIngestionJob, ScheduledIngestionJob } from '../types';
import { logger } from '../../config/logger';
import fs from 'fs';
import path from 'path';
import { IngestionStatus } from '@prisma/client';
import pdf from 'pdf-parse';
import * as mammoth from 'mammoth';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3001/api/v1/mock-ai';

interface KbSource {
  name: string;
  specialty: string;
  baseUrl: string;
  lastUpdated?: string;
}

const KB_SOURCES: KbSource[] = [
  { name: 'PubMed Central', specialty: 'general', baseUrl: 'https://www.ncbi.nlm.nih.gov/pmc/' },
  { name: 'NEJM', specialty: 'general', baseUrl: 'https://www.nejm.org/' },
  { name: 'The Lancet', specialty: 'general', baseUrl: 'https://www.thelancet.com/' },
  { name: 'JAMA', specialty: 'general', baseUrl: 'https://jamanetwork.com/' },
  { name: 'Circulation', specialty: 'cardiology', baseUrl: 'https://www.ahajournals.org/journal/circ' },
  { name: 'Diabetes Care', specialty: 'endocrinology', baseUrl: 'https://diabetesjournals.org/care' },
  { name: 'Journal of Clinical Oncology', specialty: 'oncology', baseUrl: 'https://ascopubs.org/journal/jco' },
  { name: 'Neurology', specialty: 'neurology', baseUrl: 'https://n.neurology.org/' },
  { name: 'Gastroenterology', specialty: 'gastroenterology', baseUrl: 'https://gi.org/' },
];

async function createDemoDocuments(source: { name: string; specialty: string }, isIncremental = false) {
  const demoTitles = [
    'Evidence-Based Clinical Guidelines',
    'Latest Research Findings',
    'Systematic Review and Meta-Analysis',
    'Randomized Controlled Trial Results',
  ];

  let count = 0;
  for (const title of demoTitles) {
    const documentTitle = `${source.specialty.charAt(0).toUpperCase() + source.specialty.slice(1)}: ${title}`;
    
    const existing = await prisma.medicalDocument.findFirst({
      where: {
        title: { contains: documentTitle },
      },
    });

    if (!existing) {
      await prisma.medicalDocument.create({
        data: {
          title: documentTitle,
          description: `Demo document from ${source.name} for ${source.specialty} specialty`,
          fileName: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.pdf`,
          fileUrl: source.name,
          fileType: 'application/pdf',
          fileSize: 1024 * 1024,
          specialty: source.specialty,
          documentType: 'GUIDELINE',
          source: source.name,
          publicationYear: new Date().getFullYear(),
          uploadedById: '00000000-0000-0000-0000-000000000000',
          ingestionStatus: IngestionStatus.COMPLETED,
          isVerified: true,
        },
      });
      count++;
    } else if (isIncremental) {
      await prisma.medicalDocument.update({
        where: { id: existing.id },
        data: { updatedAt: new Date() },
      });
    }
  }

  logger.info(`Created ${count} demo documents for ${source.name}${isIncremental ? ' (incremental)' : ''}`);
  return { count };
}

export async function refreshKnowledgeBase(isIncremental = false) {
  const results = {
    processed: 0,
    updated: 0,
    total: KB_SOURCES.length,
  };

  for (const source of KB_SOURCES) {
    try {
      const result = await createDemoDocuments(source, isIncremental);
      results.processed += result.count;
      if (isIncremental && result.count === 0) {
        results.updated += 4;
      }
    } catch (error) {
      logger.error(`Failed to refresh KB from ${source.name}:`, error);
    }
  }

  return results;
}

export async function processDocumentIngestion(job: DocumentIngestionJob | ScheduledIngestionJob) {
  if ('source' in job && 'type' in job && job.type === 'scheduled') {
    return createDemoDocuments(job.source);
  }

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