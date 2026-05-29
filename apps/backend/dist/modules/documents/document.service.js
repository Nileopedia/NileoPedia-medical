"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const document_ingestion_service_1 = require("./document.ingestion.service");
const prisma_1 = __importDefault(require("../../config/prisma"));
class DocumentService {
    constructor() {
        this.ingestionService = new document_ingestion_service_1.DocumentIngestionService();
    }
    async getDocuments() {
        return prisma_1.default.medicalDocument.findMany();
    }
    async verifyDocument(documentId) {
        return prisma_1.default.medicalDocument.update({
            where: { id: documentId },
            data: { isVerified: true },
        });
    }
}
exports.DocumentService = DocumentService;
//# sourceMappingURL=document.service.js.map