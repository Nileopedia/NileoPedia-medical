import prisma from '../../config/prisma';
import { logger } from '../../config/logger';
import { MedicalSynonymService } from '../medical/synonym.service';

export interface KnowledgeAuditResult {
  diseasesIndexed: string[];
  missingDiseases: string[];
  duplicateDiseases: string[];
  medicalSpecialties: string[];
  documentCounts: {
    total: number;
    bySpecialty: Record<string, number>;
    byDocumentType: Record<string, number>;
  };
  coveragePercentage: number;
  totalRequiredDiseases: number;
}

const REQUIRED_DISEASES = [
  'hypertension',
  'diabetes mellitus',
  'asthma',
  'copd',
  'malaria',
  'tuberculosis',
  'hiv',
  'heart failure',
  'stroke',
  'cancer',
  'pneumonia',
  'ckd',
];

export class KnowledgeAuditService {
  private synonymService: MedicalSynonymService;

  constructor() {
    this.synonymService = new MedicalSynonymService();
  }

  async runAudit(): Promise<KnowledgeAuditResult> {
    try {
      const documents = await prisma.medicalDocument.findMany({
        include: {
          documentMetadata: true,
        },
      });

      const specialties = new Set<string>();
      const diseaseSet = new Set<string>();
      const diseaseCounts = new Map<string, number>();
      const documentTypeCounts = new Map<string, number>();
      const specialtyCounts = new Map<string, number>();

      for (const doc of documents) {
        const specialty = doc.specialty || 'general';
        specialties.add(specialty);
        specialtyCounts.set(specialty, (specialtyCounts.get(specialty) || 0) + 1);

        const docType = doc.documentType || 'Unknown';
        documentTypeCounts.set(docType, (documentTypeCounts.get(docType) || 0) + 1);

        const metadata = doc.documentMetadata;
        if (metadata) {
          if (metadata.disease) {
            const diseaseKey = metadata.disease.toLowerCase().trim();
            diseaseSet.add(diseaseKey);
            diseaseCounts.set(diseaseKey, (diseaseCounts.get(diseaseKey) || 0) + 1);
          }

          if (metadata.medicalSpecialty) {
            specialties.add(metadata.medicalSpecialty);
          }

          const allTerms = [
            ...(metadata.keywords || []),
            ...(metadata.meshTerms || []),
            metadata.disease || '',
            ...(metadata.symptoms || []),
            ...(metadata.diagnosis || []),
            ...(metadata.treatment || []),
            ...(metadata.medication || []),
          ].filter(Boolean).join(' ').toLowerCase();

          for (const requiredDisease of REQUIRED_DISEASES) {
            const synonyms = this.synonymService.expand(requiredDisease).synonyms;
            const allTermsForDisease = [requiredDisease, ...synonyms].map(s => s.toLowerCase());
            const matches = allTermsForDisease.some(term => allTerms.includes(term));
            if (matches) {
              diseaseSet.add(requiredDisease);
              diseaseCounts.set(requiredDisease, (diseaseCounts.get(requiredDisease) || 0) + 1);
            }
          }
        }
      }

      const duplicateDiseases = Array.from(diseaseCounts.entries())
        .filter(([_, count]) => count > 1)
        .map(([disease, count]) => `${disease} (${count} documents)`);

      const missingDiseases = REQUIRED_DISEASES.filter(
        disease => !diseaseSet.has(disease)
      );

      const coveredDiseases = REQUIRED_DISEASES.filter(
        disease => diseaseSet.has(disease)
      );

      const coveragePercentage = REQUIRED_DISEASES.length > 0
        ? Math.round((coveredDiseases.length / REQUIRED_DISEASES.length) * 100)
        : 0;

      return {
        diseasesIndexed: Array.from(diseaseSet).sort(),
        missingDiseases,
        duplicateDiseases,
        medicalSpecialties: Array.from(specialties).sort(),
        documentCounts: {
          total: documents.length,
          bySpecialty: Object.fromEntries(specialtyCounts),
          byDocumentType: Object.fromEntries(documentTypeCounts),
        },
        coveragePercentage,
        totalRequiredDiseases: REQUIRED_DISEASES.length,
      };
    } catch (error) {
      logger.error('Knowledge audit failed:', error);
      throw error;
    }
  }

  async getCoverageReport(): Promise<{
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
  }> {
    const audit = await this.runAudit();

    const diseaseReports = REQUIRED_DISEASES.map(disease => {
      const expansion = this.synonymService.expand(disease);
      const count = audit.diseasesIndexed.filter(d => 
        expansion.synonyms.some(s => d.includes(s.toLowerCase())) || d === disease.toLowerCase()
      ).length;

      return {
        disease,
        covered: audit.diseasesIndexed.some(d => 
          expansion.synonyms.some(s => d.includes(s.toLowerCase())) || d === disease.toLowerCase()
        ),
        documentCount: count,
        synonyms: expansion.synonyms,
      };
    });

    const recommendations: string[] = [];
    for (const disease of audit.missingDiseases) {
      recommendations.push(`Add authoritative documents for ${disease}`);
    }

    if (audit.coveragePercentage < 50) {
      recommendations.push('Knowledge base coverage is below 50%. Consider adding more medical documents.');
    }

    if (audit.documentCounts.total < 50) {
      recommendations.push('Document count is low. Add more medical documents to improve retrieval quality.');
    }

    const vectorCount = await prisma.embeddingMetadata.count();

    return {
      reportDate: new Date().toISOString(),
      totalDocuments: audit.documentCounts.total,
      totalVectors: vectorCount,
      requiredDiseases: diseaseReports,
      missingDiseases: audit.missingDiseases,
      coveragePercentage: audit.coveragePercentage,
      recommendations,
    };
  }
}

export const knowledgeAuditService = new KnowledgeAuditService();
