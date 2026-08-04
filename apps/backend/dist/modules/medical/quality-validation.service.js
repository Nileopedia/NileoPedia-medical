"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qualityValidationService = exports.QualityValidationService = void 0;
class QualityValidationService {
    constructor() {
        this.MIN_CHUNK_LENGTH = 250;
        this.MAX_CHUNK_LENGTH = 2000;
        this.REQUIRED_METADATA = ['title', 'source', 'specialty', 'publicationYear'];
    }
    validateChunk(chunk, existingChunkHashes) {
        const rejectionReasons = [];
        const warnings = [];
        const textHash = this.hashText(chunk.text);
        const metadata = {
            length: chunk.text.length,
            hasTitle: !!chunk.title && chunk.title.length > 3,
            hasSource: !!chunk.source && chunk.source.length > 3,
            hasSpecialty: !!chunk.specialty && chunk.specialty.length > 2,
            hasPublicationYear: !!chunk.publicationYear && chunk.publicationYear > 1900 && chunk.publicationYear <= new Date().getFullYear() + 1,
            isDuplicate: existingChunkHashes.has(textHash),
        };
        if (chunk.text.length < this.MIN_CHUNK_LENGTH) {
            rejectionReasons.push(`Chunk too short: ${chunk.text.length} chars (minimum ${this.MIN_CHUNK_LENGTH})`);
        }
        if (chunk.text.length > this.MAX_CHUNK_LENGTH) {
            warnings.push(`Chunk exceeds recommended length: ${chunk.text.length} chars (recommended max ${this.MAX_CHUNK_LENGTH})`);
        }
        if (!metadata.hasTitle) {
            rejectionReasons.push('Missing or invalid title');
        }
        if (!metadata.hasSource) {
            rejectionReasons.push('Missing or invalid source');
        }
        if (!metadata.hasSpecialty) {
            rejectionReasons.push('Missing or invalid specialty');
        }
        if (!metadata.hasPublicationYear) {
            rejectionReasons.push('Missing or invalid publication year');
        }
        if (metadata.isDuplicate) {
            rejectionReasons.push('Duplicate chunk detected');
        }
        const isValid = rejectionReasons.length === 0;
        return {
            isValid,
            rejectionReasons,
            warnings,
            metadata,
        };
    }
    validateDocumentChunks(chunks) {
        const existingChunkHashes = new Set();
        const validChunks = [];
        const rejectionReasons = {};
        const warnings = [];
        let totalLength = 0;
        for (const chunk of chunks) {
            const result = this.validateChunk(chunk, existingChunkHashes);
            validChunks.push(result);
            totalLength += chunk.text.length;
            if (result.metadata.isDuplicate) {
                existingChunkHashes.add(this.hashText(chunk.text));
            }
            for (const reason of result.rejectionReasons) {
                rejectionReasons[reason] = (rejectionReasons[reason] || 0) + 1;
            }
            warnings.push(...result.warnings);
        }
        const validCount = validChunks.filter(r => r.isValid).length;
        const invalidChunks = validChunks.length - validCount;
        const duplicateCount = validChunks.filter(r => r.metadata.isDuplicate).length;
        const shortChunks = validChunks.filter(r => r.metadata.length < this.MIN_CHUNK_LENGTH).length;
        const missingMetadataChunks = validChunks.filter(r => !r.metadata.hasTitle || !r.metadata.hasSource || !r.metadata.hasSpecialty || !r.metadata.hasPublicationYear).length;
        return {
            totalChunks: chunks.length,
            validChunks: validCount,
            invalidChunks,
            duplicateChunks: duplicateCount,
            shortChunks,
            missingMetadataChunks,
            averageChunkLength: chunks.length > 0 ? Math.round(totalLength / chunks.length) : 0,
            rejectionReasons,
            warnings: [...new Set(warnings)],
        };
    }
    hashText(text) {
        const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
        let hash = 0;
        for (let i = 0; i < normalized.length; i++) {
            const char = normalized.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return String(hash);
    }
    getValidationThresholds() {
        return {
            MIN_CHUNK_LENGTH: this.MIN_CHUNK_LENGTH,
            MAX_CHUNK_LENGTH: this.MAX_CHUNK_LENGTH,
            REQUIRED_METADATA: this.REQUIRED_METADATA,
        };
    }
}
exports.QualityValidationService = QualityValidationService;
exports.qualityValidationService = new QualityValidationService();
//# sourceMappingURL=quality-validation.service.js.map