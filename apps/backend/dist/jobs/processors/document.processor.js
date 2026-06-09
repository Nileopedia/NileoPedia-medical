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
exports.processDocumentIngestion = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../../config/logger");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth = __importStar(require("mammoth"));
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
async function processDocumentIngestion(job) {
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
        // Extract text based on file type
        if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
            try {
                const pdfData = await (0, pdf_parse_1.default)(buffer);
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
                const $ = (await Promise.resolve().then(() => __importStar(require('cheerio')))).load(buffer.toString('utf-8'));
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
            // Plain text files
            content = buffer.toString('utf-8');
        }
        if (!content || !content.trim()) {
            throw new Error('No content could be extracted from the file');
        }
        const ingestResponse = await axios_1.default.post(`${AI_SERVICE_URL}/ingest`, {
            title,
            content,
            specialty,
            documentType,
            source,
            publicationYear,
        });
        await prisma_1.default.medicalDocument.update({
            where: { id: documentId },
            data: {
                ingestionStatus: client_1.IngestionStatus.COMPLETED,
                updatedAt: new Date(),
            },
        });
        logger_1.logger.info(`Document ingestion completed: ${documentId}`);
        return ingestResponse.data;
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