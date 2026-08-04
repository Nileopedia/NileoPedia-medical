export interface KnowledgeAuditResult {
    diseasesIndexed: string[];
    missingDiseases: string[];
    duplicateDiseases: string[];
    medicalSpecialties: string[];
    medicationCoverage: string[];
    guidelineCoverage: string[];
    documentCounts: {
        total: number;
        bySpecialty: Record<string, number>;
        byDocumentType: Record<string, number>;
    };
    averagePublicationYear: number;
    averageChunkLength: number;
    averageMetadataCompleteness: number;
    coveragePercentage: number;
    totalRequiredDiseases: number;
    outdatedPublications: number;
    missingSpecialties: string[];
    missingMedications: string[];
    missingGuidelines: string[];
}
export declare class KnowledgeAuditService {
    private synonymService;
    constructor();
    runAudit(): Promise<KnowledgeAuditResult>;
    getCoverageReport(): Promise<{
        reportDate: string;
        totalDocuments: number;
        totalVectors: number;
        requiredDiseases: Array<{
            disease: string;
            covered: boolean;
            documentCount: number;
            synonyms: string[];
        }>;
        missingDiseases: string[];
        coveragePercentage: number;
        recommendations: string[];
    }>;
}
export declare const knowledgeAuditService: KnowledgeAuditService;
//# sourceMappingURL=knowledge-audit.service.d.ts.map