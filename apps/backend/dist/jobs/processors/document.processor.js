"use strict";
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
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
async function processDocumentIngestion(job) {
    const { documentId, fileUrl, fileName, title, specialty, documentType, uploadedById, source, publicationYear } = job;
    try {
        await prisma_1.default.medicalDocument.update({
            where: { id: documentId },
            data: { ingestionStatus: client_1.IngestionStatus.PROCESSING },
        });
        const fullPath = path_1.default.join(process.cwd(), fileUrl);
        let content = '';
        if (fs_1.default.existsSync(fullPath)) {
            content = fs_1.default.readFileSync(fullPath, 'utf-8');
        }
        else {
            throw new Error(`File not found: ${fileUrl}`);
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