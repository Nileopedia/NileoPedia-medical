"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDocumentIngestion = exports.refreshKnowledgeBase = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client_1 = require("@prisma/client");
const document_ingestion_service_1 = require("../../modules/documents/document.ingestion.service");
const metadata_service_1 = require("../../modules/documents/metadata.service");
const logger_1 = require("../../config/logger");
const KB_SOURCES = [
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
async function createDemoDocuments(source, isIncremental = false) {
    const demoTitles = [
        'Evidence-Based Clinical Guidelines',
        'Latest Research Findings',
        'Systematic Review and Meta-Analysis',
        'Randomized Controlled Trial Results',
    ];
    let count = 0;
    for (const title of demoTitles) {
        const documentTitle = `${source.specialty.charAt(0).toUpperCase() + source.specialty.slice(1)}: ${title}`;
        const existing = await prisma_1.default.medicalDocument.findFirst({
            where: {
                title: { contains: documentTitle },
            },
        });
        if (!existing) {
            const doc = await prisma_1.default.medicalDocument.create({
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
                    ingestionStatus: client_1.IngestionStatus.COMPLETED,
                    isVerified: true,
                },
            });
            count++;
            await prisma_1.default.documentMetadata.create({
                data: {
                    documentId: doc.id,
                    title: documentTitle,
                    authors: ['Medical Editorial Board'],
                    journal: source.name,
                    publicationYear: new Date().getFullYear(),
                    sourceURL: source.baseUrl,
                    documentType: 'GUIDELINE',
                },
            });
            await prisma_1.default.embeddingMetadata.create({
                data: {
                    documentId: doc.id,
                    pineconeVectorId: `${doc.id}_chunk_0`,
                    chunkIndex: 0,
                    chunkText: `${documentTitle}: Evidence-based clinical guidelines and recommendations.`,
                },
            });
        }
        else if (isIncremental) {
            await prisma_1.default.medicalDocument.update({
                where: { id: existing.id },
                data: { updatedAt: new Date() },
            });
        }
    }
    logger_1.logger.info(`Created ${count} demo documents for ${source.name}${isIncremental ? ' (incremental)' : ''}`);
    return { count };
}
async function refreshKnowledgeBase(isIncremental = false) {
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
        }
        catch (error) {
            logger_1.logger.error(`Failed to refresh KB from ${source.name}:`, error);
        }
    }
    return results;
}
exports.refreshKnowledgeBase = refreshKnowledgeBase;
async function processDocumentIngestion(job) {
    if ('source' in job && 'type' in job && job.type === 'scheduled') {
        return createDemoDocuments(job.source);
    }
    const { documentId, fileUrl, fileName, title, specialty, documentType, uploadedById, source, publicationYear, fileType } = job;
    try {
        await prisma_1.default.medicalDocument.update({
            where: { id: documentId },
            data: { ingestionStatus: client_1.IngestionStatus.PROCESSING },
        });
        const fullPath = path_1.default.join(process.cwd(), fileUrl);
        if (!fs_1.default.existsSync(fullPath)) {
            throw new Error(`File not found: ${fileUrl}`);
        }
        let content = '';
        const buffer = fs_1.default.readFileSync(fullPath);
        if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
            try {
                const pdf = await Promise.resolve().then(() => __importStar(require('pdf-parse')));
                const pdfData = await pdf.default(buffer);
                content = pdfData.text || '';
            }
            catch (pdfError) {
                logger_1.logger.warn(`PDF parsing failed, falling back to text extraction:`, pdfError);
                content = buffer.toString('utf-8');
            }
        }
        else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            fileName.toLowerCase().endsWith('.docx')) {
            try {
                const mammoth = await Promise.resolve().then(() => __importStar(require('mammoth')));
                const docxResult = await mammoth.extractRawText({ buffer });
                content = docxResult.value || '';
            }
            catch (docxError) {
                logger_1.logger.warn(`DOCX parsing failed, falling back to text extraction:`, docxError);
                content = buffer.toString('utf-8');
            }
        }
        else if (fileType === 'text/html' || fileName.toLowerCase().endsWith('.html') || fileName.toLowerCase().endsWith('.htm')) {
            try {
                const cheerio = await Promise.resolve().then(() => __importStar(require('cheerio')));
                const $ = cheerio.load(buffer.toString('utf-8'));
                $('script, style, nav, header, footer, aside').remove();
                content = $('body').text() || $('html').text() || '';
                content = content.replace(/\s+/g, ' ').trim();
            }
            catch (htmlError) {
                logger_1.logger.warn(`HTML parsing failed, falling back to text extraction:`, htmlError);
                content = buffer.toString('utf-8');
            }
        }
        else {
            content = buffer.toString('utf-8');
        }
        if (!content || !content.trim()) {
            throw new Error('No content could be extracted from the file');
        }
        const metadataService = new metadata_service_1.DocumentMetadataService();
        const extractedMetadata = await metadataService.extractMetadata({
            rawText: content,
            fileName,
            fileType,
            sourceURL: source,
            doctype: documentType,
        });
        await metadataService.saveMetadata({
            documentId,
            title: extractedMetadata.title || title,
            authors: extractedMetadata.authors,
            journal: extractedMetadata.journal,
            publisher: extractedMetadata.publisher,
            publicationYear: extractedMetadata.publicationYear || publicationYear,
            doi: extractedMetadata.doi,
            sourceURL: extractedMetadata.sourceURL || source,
            documentType: documentType,
        });
        const ingestionService = new document_ingestion_service_1.DocumentIngestionService();
        await ingestionService.ingestDocument({
            title,
            content,
            specialty,
            documentType,
            source,
            publicationYear,
            uploadedById,
            fileName,
            fileUrl,
            fileType,
            fileSize: 0,
        });
        logger_1.logger.info(`Document ingestion completed: ${documentId}`);
        return { success: true };
    }
    catch (error) {
        await prisma_1.default.medicalDocument.update({
            where: { id: documentId },
            data: { ingestionStatus: client_1.IngestionStatus.FAILED },
        });
        logger_1.logger.error(`Document ingestion failed: ${documentId}`, error);
        throw error;
    }
}
exports.processDocumentIngestion = processDocumentIngestion;
//# sourceMappingURL=document.processor.js.map