import { EvaluationReport } from '../evaluation/gold-dataset';
export declare class EvaluationRunnerService {
    private retrievalService;
    private aiService;
    private datasetSize;
    constructor(datasetSize?: 'small' | 'medium' | 'large' | 'xlarge');
    runEvaluation(options?: {
        category?: string;
        specialty?: string;
        difficulty?: string;
        limit?: number;
    }): Promise<EvaluationReport>;
    private evaluateQuestion;
    private calculatePrecisionAtK;
    private calculateRecallAtK;
    private calculateMRR;
    private calculateMAP;
    private calculateNDCG;
    private calculateContextRecall;
    private calculateFaithfulness;
    private calculateGroundedness;
    private calculateCitationAccuracy;
    private calculateAnswerCompleteness;
    private calculateEvidenceCoverage;
    private calculateMedicalAccuracy;
    private calculateConfidence;
    private calculateOverallScore;
    private generateReport;
    runBenchmark(specialty?: string): Promise<{
        summary: string;
        passed: number;
        total: number;
        score: number;
        details: any[];
    }>;
}
//# sourceMappingURL=evaluation-runner.service.d.ts.map