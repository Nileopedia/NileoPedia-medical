export interface EvaluationQuestion {
    id: string;
    query: string;
    category: string;
    specialty: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    expectedDiseases: string[];
    expectedTerms: string[];
    expectedSpecialty: string;
    minConfidence: number;
    maxLatencyMs: number;
    requiresCitation: boolean;
    requiresSynonymExpansion: boolean;
    requiresAcronymExpansion: boolean;
    metadata: {
        icd10Codes?: string[];
        snomedCodes?: string[];
        meshTerms?: string[];
        keywords?: string[];
    };
}
export interface EvaluationResult {
    questionId: string;
    query: string;
    specialty: string;
    passed: boolean;
    score: number;
    metrics: {
        precisionAt5: number;
        recallAt5: number;
        mrr: number;
        map: number;
        ndcg: number;
        hitRate: number;
        contextRecall: number;
        faithfulness: number;
        groundedness: number;
        citationAccuracy: number;
        answerCompleteness: number;
        evidenceCoverage: number;
        medicalAccuracy: number;
    };
    details: {
        retrievedCount: number;
        relevantCount: number;
        topScore: number;
        confidence: number;
        latencyMs: number;
        synonymsExpanded: string[];
        acronymsExpanded: string[];
        citations: Array<{
            title: string;
            source: string;
            authors: string[];
            year?: number;
        }>;
        chunks: Array<{
            text: string;
            score: number;
        }>;
        errors: string[];
    };
}
export interface EvaluationReport {
    totalQuestions: number;
    passedQuestions: number;
    failedQuestions: number;
    averageScore: number;
    specialtyBreakdown: Record<string, {
        total: number;
        passed: number;
        avgScore: number;
    }>;
    difficultyBreakdown: Record<string, {
        total: number;
        passed: number;
        avgScore: number;
    }>;
    metrics: {
        avgPrecisionAt5: number;
        avgRecallAt5: number;
        avgMRR: number;
        avgMAP: number;
        avgNDCG: number;
        avgHitRate: number;
        avgContextRecall: number;
        avgFaithfulness: number;
        avgGroundedness: number;
        avgCitationAccuracy: number;
        avgAnswerCompleteness: number;
        avgEvidenceCoverage: number;
        avgMedicalAccuracy: number;
    };
    latency: {
        avgLatencyMs: number;
        p50LatencyMs: number;
        p95LatencyMs: number;
        p99LatencyMs: number;
    };
    topFailures: Array<{
        query: string;
        reason: string;
    }>;
    recommendations: string[];
}
export declare const EVALUATION_QUESTIONS: EvaluationQuestion[];
export declare const EVALUATION_DATASET_SIZES: {
    small: EvaluationQuestion[];
    medium: EvaluationQuestion[];
    large: EvaluationQuestion[];
    xlarge: EvaluationQuestion[];
};
export declare function getEvaluationDataset(size?: 'small' | 'medium' | 'large' | 'xlarge'): EvaluationQuestion[];
//# sourceMappingURL=gold-dataset.d.ts.map