export interface DocumentTaxonomy {
    title?: string;
    abstract?: string;
    disease?: string;
    specialty?: string;
    symptoms: string[];
    diagnosis: string[];
    treatments: string[];
    medications: string[];
    contraindications: string[];
    complications: string[];
    prevention: string[];
    prognosis?: string;
    patientEducation: string[];
    meshTerms: string[];
    keywords: string[];
    icd10: string[];
    snomed: string[];
    publicationYear?: number;
    journal?: string;
    publisher?: string;
    authors: string[];
    doi?: string;
    pmid?: string;
    pmcid?: string;
    isbn?: string;
    language?: string;
    organization?: string;
    sourceURL?: string;
    documentType?: string;
    citationQuality: number;
    metadataCompleteness: number;
}
export declare class AIMetadataExtractionService {
    private groq;
    private model;
    constructor();
    extractMetadata(content: string, fileName: string): Promise<DocumentTaxonomy>;
    enrichChunkWithTaxonomy(chunkText: string, documentTaxonomy: DocumentTaxonomy): Promise<{
        disease: string[];
        symptoms: string[];
        diagnosis: string[];
        treatment: string[];
        medication: string[];
        contraindications: string[];
        complications: string[];
        prevention: string[];
        icd10: string[];
        snomed: string[];
        meshTerms: string[];
        specialty: string;
    }>;
    private normalizeMetadata;
    private getDefaultMetadata;
}
export declare const aiMetadataExtractionService: AIMetadataExtractionService;
//# sourceMappingURL=ai-metadata.service.d.ts.map