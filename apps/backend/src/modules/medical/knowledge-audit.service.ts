import prisma from '../../config/prisma';
import { logger } from '../../config/logger';
import { MedicalSynonymService } from '../medical/synonym.service';

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
          documentMetadata: {
            select: {
              disease: true,
              symptoms: true,
              diagnosis: true,
              treatment: true,
              medication: true,
              meshTerms: true,
              medicalSpecialty: true,
              keywords: true,
              icd10: true,
              snomed: true,
            },
          },
          embeddingMetadata: {
            select: {
              chunkText: true,
            },
          },
        },
      });

      const specialties = new Set<string>();
      const diseaseSet = new Set<string>();
      const diseaseCounts = new Map<string, number>();
      const documentTypeCounts = new Map<string, number>();
      const specialtyCounts = new Map<string, number>();
      const medicationSet = new Set<string>();
      const guidelineSet = new Set<string>();
      const indexedSpecialties = new Set<string>();
      const requiredSpecialties = new Set([
        'cardiology', 'neurology', 'pulmonology', 'endocrinology', 'gastroenterology',
        'nephrology', 'hematology', 'oncology', 'infectious disease', 'rheumatology',
        'dermatology', 'ophthalmology', 'otolaryngology', 'urology', 'gynecology',
        'obstetrics', 'pediatrics', 'geriatrics', 'psychiatry', 'orthopedics',
        'neurosurgery', 'cardiac surgery', 'vascular surgery', 'plastic surgery',
        'emergency medicine', 'family medicine', 'internal medicine', 'surgery',
      ]);

      let totalPublicationYear = 0;
      let publicationYearCount = 0;
      let totalChunkLength = 0;
      let totalMetadataCompleteness = 0;
      let metadataCompletenessCount = 0;
      let outdatedPublications = 0;
      const currentYear = new Date().getFullYear();

      for (const doc of documents) {
        const specialty = doc.specialty || 'general';
        specialties.add(specialty);
        specialtyCounts.set(specialty, (specialtyCounts.get(specialty) || 0) + 1);

        const docType = doc.documentType || 'Unknown';
        documentTypeCounts.set(docType, (documentTypeCounts.get(docType) || 0) + 1);

        const metadata = (doc as any).documentMetadata as any;
        if (metadata) {
          if (metadata.disease) {
            const diseaseKey = metadata.disease.toLowerCase().trim();
            diseaseSet.add(diseaseKey);
            diseaseCounts.set(diseaseKey, (diseaseCounts.get(diseaseKey) || 0) + 1);
          }

          if (metadata.medicalSpecialty) {
            specialties.add(metadata.medicalSpecialty);
            indexedSpecialties.add(metadata.medicalSpecialty);
          }

          if (metadata.publicationYear) {
            totalPublicationYear += metadata.publicationYear;
            publicationYearCount++;
            if (currentYear - metadata.publicationYear > 5) {
              outdatedPublications++;
            }
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

          for (const med of metadata.medication || []) {
            medicationSet.add(med.toLowerCase());
          }

          if (metadata.publicationType?.toLowerCase().includes('guideline')) {
            guidelineSet.add(doc.title || 'Unknown Guideline');
          }
          if (metadata.documentType?.toLowerCase().includes('guideline')) {
            guidelineSet.add(doc.title || 'Unknown Guideline');
          }

          for (const requiredDisease of REQUIRED_DISEASES) {
            const synonyms = this.synonymService.expand(requiredDisease).synonyms;
            const allTermsForDisease = [requiredDisease, ...synonyms].map(s => s.toLowerCase());
            const matches = allTermsForDisease.some(term => allTerms.includes(term));
            if (matches) {
              diseaseSet.add(requiredDisease);
              diseaseCounts.set(requiredDisease, (diseaseCounts.get(requiredDisease) || 0) + 1);
            }
          }

          const metadataFields = ['title', 'source', 'specialty', 'publicationYear', 'doi', 'authors'];
          let filledFields = 0;
          for (const field of metadataFields) {
            const value = (metadata as any)[field];
            if (value && value !== 'unknown' && value !== 'Unknown' && value !== 'N/A') {
              filledFields++;
            }
          }
          totalMetadataCompleteness += (filledFields / metadataFields.length) * 100;
          metadataCompletenessCount++;
        }

        for (const chunk of doc.embeddingMetadata || []) {
          totalChunkLength += chunk.chunkText?.length || 0;
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

      const missingSpecialties = Array.from(requiredSpecialties)
        .filter(s => !indexedSpecialties.has(s))
        .sort();

      const requiredMedications = [
        'aspirin', 'ibuprofen', 'metformin', 'lisinopril', 'atorvastatin', 'amlodipine',
        'omeprazole', 'prednisone', 'albuterol', 'warfarin', 'clopidogrel', 'insulin',
        'amoxicillin', 'azithromycin', 'ciprofloxacin', 'vancomycin',
      ];
      const missingMedications = requiredMedications.filter(med => !medicationSet.has(med));

      const requiredGuidelines = [
        'AHA/ACC Hypertension Guidelines',
        'ADA Standards of Medical Care',
        'GINA Asthma Strategy',
        'GOLD COPD Report',
        'WHO TB Guidelines',
        'WHO HIV Guidelines',
        'AHA/ACC Heart Failure Guidelines',
        'AHA/ASA Stroke Guidelines',
      ];
      const missingGuidelines = requiredGuidelines.filter(g => !guidelineSet.has(g));

      return {
        diseasesIndexed: Array.from(diseaseSet).sort(),
        missingDiseases,
        duplicateDiseases,
        medicalSpecialties: Array.from(specialties).sort(),
        medicationCoverage: Array.from(medicationSet).sort(),
        guidelineCoverage: Array.from(guidelineSet).sort(),
        documentCounts: {
          total: documents.length,
          bySpecialty: Object.fromEntries(specialtyCounts),
          byDocumentType: Object.fromEntries(documentTypeCounts),
        },
        averagePublicationYear: publicationYearCount > 0 ? Math.round(totalPublicationYear / publicationYearCount) : 0,
        averageChunkLength: documents.length > 0 ? Math.round(totalChunkLength / documents.length) : 0,
        averageMetadataCompleteness: metadataCompletenessCount > 0 ? Math.round(totalMetadataCompleteness / metadataCompletenessCount) : 0,
        coveragePercentage,
        totalRequiredDiseases: REQUIRED_DISEASES.length,
        outdatedPublications,
        missingSpecialties,
        missingMedications,
        missingGuidelines,
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
