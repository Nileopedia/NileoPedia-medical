export enum EvidenceStrength {
  VERY_HIGH = 'Very High',
  HIGH = 'High',
  MODERATE = 'Moderate',
  LOW = 'Low',
  VERY_LOW = 'Very Low',
}

export interface ConfidenceResult {
  confidenceScore: number;
  evidenceStrength: EvidenceStrength;
  retrievalQuality: number;
  breakdown: {
    similarityScore: number;
    documentCount: number;
    citationQuality: number;
    rerankerScore: number;
    metadataCompleteness: number;
    sourceAgreement: number;
  };
}

export class ConfidenceEngine {
  calculate(params: {
    topSimilarity: number;
    retrievedCount: number;
    rerankerScores: number[];
    citationQualityScores: number[];
    metadataCompleteness: number;
    sourceDiversity: number;
  }): ConfidenceResult {
    const { topSimilarity, retrievedCount, rerankerScores, citationQualityScores, metadataCompleteness, sourceDiversity } = params;

    const similarityScore = Math.min(1, topSimilarity) * 25;
    const documentCount = Math.min(1, retrievedCount / 10) * 20;
    const avgRerankerScore = rerankerScores.length > 0 ? rerankerScores.reduce((a, b) => a + b, 0) / rerankerScores.length : 0;
    const rerankerScore = Math.min(1, avgRerankerScore) * 20;
    const avgCitationQuality = citationQualityScores.length > 0 ? citationQualityScores.reduce((a, b) => a + b, 0) / citationQualityScores.length : 0;
    const citationQuality = Math.min(1, avgCitationQuality / 10) * 15;
    const metadataScore = (metadataCompleteness / 100) * 10;
    const agreementScore = Math.min(1, sourceDiversity) * 10;

    const confidenceScore = Math.min(100, Math.max(0,
      similarityScore + documentCount + rerankerScore + citationQuality + metadataScore + agreementScore
    ));

    const evidenceStrength = this.getEvidenceStrength(confidenceScore);
    const retrievalQuality = Math.min(100, Math.max(0,
      (similarityScore + documentCount + rerankerScore) / 65 * 100
    ));

    return {
      confidenceScore: Math.round(confidenceScore * 100) / 100,
      evidenceStrength,
      retrievalQuality: Math.round(retrievalQuality * 100) / 100,
      breakdown: {
        similarityScore: Math.round(similarityScore * 100) / 100,
        documentCount: Math.round(documentCount * 100) / 100,
        citationQuality: Math.round(citationQuality * 100) / 100,
        rerankerScore: Math.round(rerankerScore * 100) / 100,
        metadataCompleteness: Math.round(metadataScore * 100) / 100,
        sourceAgreement: Math.round(agreementScore * 100) / 100,
      },
    };
  }

  private getEvidenceStrength(confidenceScore: number): EvidenceStrength {
    if (confidenceScore >= 85) return EvidenceStrength.VERY_HIGH;
    if (confidenceScore >= 70) return EvidenceStrength.HIGH;
    if (confidenceScore >= 55) return EvidenceStrength.MODERATE;
    if (confidenceScore >= 40) return EvidenceStrength.LOW;
    return EvidenceStrength.VERY_LOW;
  }
}

export const confidenceEngine = new ConfidenceEngine();
