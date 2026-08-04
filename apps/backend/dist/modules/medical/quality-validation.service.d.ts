export interface ChunkValidationResult {
    isValid: boolean;
    rejectionReasons: string[];
    warnings: string[];
    metadata: {
        length: number;
        hasTitle: boolean;
        hasSource: boolean;
        hasSpecialty: boolean;
        hasPublicationYear: boolean;
        isDuplicate: boolean;
    };
}
export interface QualityValidationReport {
    totalChunks: number;
    validChunks: number;
    invalidChunks: number;
    duplicateChunks: number;
    shortChunks: number;
    missingMetadataChunks: number;
    averageChunkLength: number;
    rejectionReasons: Record<string, number>;
    warnings: string[];
}
export declare class QualityValidationService {
    private readonly MIN_CHUNK_LENGTH;
    private readonly MAX_CHUNK_LENGTH;
    private readonly REQUIRED_METADATA;
    validateChunk(chunk: {
        text: string;
        title?: string;
        source?: string;
        specialty?: string;
        publicationYear?: number;
        chunkId?: string;
    }, existingChunkHashes: Set<string>): ChunkValidationResult;
    validateDocumentChunks(chunks: Array<{
        text: string;
        title?: string;
        source?: string;
        specialty?: string;
        publicationYear?: number;
        chunkId?: string;
    }>): QualityValidationReport;
    private hashText;
    getValidationThresholds(): {
        MIN_CHUNK_LENGTH: number;
        MAX_CHUNK_LENGTH: number;
        REQUIRED_METADATA: string[];
    };
}
export declare const qualityValidationService: QualityValidationService;
//# sourceMappingURL=quality-validation.service.d.ts.map