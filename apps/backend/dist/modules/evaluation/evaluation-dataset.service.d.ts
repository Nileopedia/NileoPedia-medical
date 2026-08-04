export interface EvaluationQuestion {
    id: string;
    question: string;
    expectedDisease: string[];
    expectedCitations: string[];
    expectedSpecialty: string;
    expectedAnswer: string;
    expectedRetrievedDocuments: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
}
export interface EvaluationResult {
    questionId: string;
    question: string;
    precision: number;
    recall: number;
    mrr: number;
    ndcg: number;
    contextPrecision: number;
    citationAccuracy: number;
    answerCorrectness: number;
    overallScore: number;
    retrievedDocuments: string[];
    actualCitations: string[];
    actualAnswer: string;
}
export interface EvaluationReport {
    totalQuestions: number;
    averagePrecision: number;
    averageRecall: number;
    averageMRR: number;
    averageNDCG: number;
    averageContextPrecision: number;
    averageCitationAccuracy: number;
    averageAnswerCorrectness: number;
    averageOverallScore: number;
    results: EvaluationResult[];
}
export declare class EvaluationDataset {
    private questions;
    constructor();
    private loadDefaultQuestions;
    addQuestion(question: Omit<EvaluationQuestion, 'id'>): void;
    getQuestions(): EvaluationQuestion[];
    getQuestionById(id: string): EvaluationQuestion | undefined;
    getQuestionsByCategory(category: string): EvaluationQuestion[];
    evaluateResponse(questionId: string, retrievedDocuments: string[], actualCitations: string[], actualAnswer: string): Promise<EvaluationResult>;
    runEvaluation(): Promise<EvaluationReport>;
    private calculatePrecision;
    private calculateRecall;
    private calculateMRR;
    private calculateNDCG;
    private calculateContextPrecision;
    private calculateCitationAccuracy;
    private calculateAnswerCorrectness;
    private seedAdditionalQuestions;
}
export declare const evaluationDataset: EvaluationDataset;
//# sourceMappingURL=evaluation-dataset.service.d.ts.map