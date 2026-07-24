import { RetrievalService } from '../../modules/retrieval/retrieval.service';
import { medicalSynonymService } from '../../modules/medical/synonym.service';
import { medicalAcronymResolver } from '../../modules/medical/acronym-resolver.service';
import { confidenceEngine } from '../../modules/medical/confidence-engine.service';
import { dynamicRetrievalService } from '../../modules/medical/dynamic-retrieval.service';
import { AIService } from '../../modules/ai/services/ai.service';
import { citationQualityService } from '../../modules/medical/citation-quality.service';
import { knowledgeAuditService } from '../../modules/medical/knowledge-audit.service';
import { productionMonitoringService } from '../../modules/monitoring/production-monitoring.service';
import {
  EvaluationQuestion,
  EvaluationResult,
  EvaluationReport,
  getEvaluationDataset,
  EVALUATION_QUESTIONS,
} from '../evaluation/gold-dataset';

export class EvaluationRunnerService {
  private retrievalService: RetrievalService;
  private aiService: AIService;
  private datasetSize: 'small' | 'medium' | 'large' | 'xlarge';

  constructor(datasetSize: 'small' | 'medium' | 'large' | 'xlarge' = 'small') {
    this.retrievalService = new RetrievalService();
    this.aiService = new AIService();
    this.datasetSize = datasetSize;
  }

  async runEvaluation(options: {
    category?: string;
    specialty?: string;
    difficulty?: string;
    limit?: number;
  } = {}): Promise<EvaluationReport> {
    const questions = getEvaluationDataset(this.datasetSize);
    
    let filteredQuestions = questions;
    if (options.category) {
      filteredQuestions = filteredQuestions.filter(q => q.category === options.category);
    }
    if (options.specialty) {
      filteredQuestions = filteredQuestions.filter(q => q.specialty === options.specialty);
    }
    if (options.difficulty) {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === options.difficulty);
    }
    if (options.limit) {
      filteredQuestions = filteredQuestions.slice(0, options.limit);
    }

    const results: EvaluationResult[] = [];
    const startTime = Date.now();

    for (const question of filteredQuestions) {
      try {
        const result = await this.evaluateQuestion(question);
        results.push(result);
      } catch (error) {
        console.error(`Failed to evaluate question ${question.id}:`, error);
        results.push({
          questionId: question.id,
          query: question.query,
          specialty: question.specialty,
          passed: false,
          score: 0,
          metrics: {
            precisionAt5: 0,
            recallAt5: 0,
            mrr: 0,
            map: 0,
            ndcg: 0,
            hitRate: 0,
            contextRecall: 0,
            faithfulness: 0,
            groundedness: 0,
            citationAccuracy: 0,
            answerCompleteness: 0,
            evidenceCoverage: 0,
            medicalAccuracy: 0,
          },
          details: {
            retrievedCount: 0,
            relevantCount: 0,
            topScore: 0,
            confidence: 0,
            latencyMs: 0,
            synonymsExpanded: [],
            acronymsExpanded: [],
            citations: [],
            chunks: [],
            errors: [error instanceof Error ? error.message : String(error)],
          },
        });
      }
    }

    return this.generateReport(results, Date.now() - startTime);
  }

  private async evaluateQuestion(question: EvaluationQuestion): Promise<EvaluationResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      const queryAnalysis = dynamicRetrievalService.analyzeQuery(question.query);
      const synonymsExpanded = queryAnalysis.detectedSynonyms;
      const acronymsExpanded = queryAnalysis.detectedAcronyms;

      let retrievalResults: any[] = [];
      try {
        retrievalResults = await this.retrievalService.semanticSearch(question.query, 10);
      } catch (retrievalError) {
        errors.push(`Retrieval failed: ${retrievalError}`);
      }

      const retrievedChunks = retrievalResults.map(r => ({
        text: (r.metadata?.text || r.metadata?.textPreview || '').toLowerCase(),
        score: r.score || 0,
        metadata: r.metadata,
      }));

      const relevantChunks = retrievedChunks.filter(chunk => {
        return question.expectedTerms.some(term => 
          chunk.text.includes(term.toLowerCase())
        );
      });

      const precisionAt5 = this.calculatePrecisionAtK(retrievedChunks, question.expectedTerms, 5);
      const recallAt5 = this.calculateRecallAtK(retrievedChunks, question.expectedTerms, 5);
      const mrr = this.calculateMRR(retrievedChunks, question.expectedTerms);
      const map = this.calculateMAP(retrievedChunks, question.expectedTerms);
      const ndcg = this.calculateNDCG(retrievedChunks, question.expectedTerms);
      const hitRate = relevantChunks.length > 0 ? 1.0 : 0.0;

      const contextRecall = this.calculateContextRecall(retrievedChunks, question.expectedTerms);
      const faithfulness = this.calculateFaithfulness(retrievedChunks, question.query);
      const groundedness = this.calculateGroundedness(retrievedChunks, question.query);

      let citations: any[] = [];
      if (question.requiresCitation && retrievalResults.length > 0) {
        try {
          const aiResult = await this.aiService.generateResponse(question.query, retrievalResults.slice(0, 5));
          citations = (aiResult as any).citations || [];
        } catch (aiError) {
          errors.push(`AI generation failed: ${aiError}`);
        }
      }

      const citationAccuracy = this.calculateCitationAccuracy(citations, question.expectedTerms);
      const answerCompleteness = this.calculateAnswerCompleteness(citations, question.expectedTerms);
      const evidenceCoverage = this.calculateEvidenceCoverage(retrievedChunks, question.expectedTerms);
      const medicalAccuracy = this.calculateMedicalAccuracy(retrievedChunks, question.query);

      const confidence = this.calculateConfidence(retrievedChunks, citations, contextRecall);
      const latencyMs = Date.now() - startTime;

      const metrics = {
        precisionAt5,
        recallAt5,
        mrr,
        map,
        ndcg,
        hitRate,
        contextRecall,
        faithfulness,
        groundedness,
        citationAccuracy,
        answerCompleteness,
        evidenceCoverage,
        medicalAccuracy,
      };

      const overallScore = this.calculateOverallScore(metrics);
      const passed = overallScore >= 0.5 && confidence >= question.minConfidence && latencyMs <= question.maxLatencyMs;

      return {
        questionId: question.id,
        query: question.query,
        specialty: question.specialty,
        passed,
        score: overallScore,
        metrics,
        details: {
          retrievedCount: retrievedChunks.length,
          relevantCount: relevantChunks.length,
          topScore: retrievedChunks[0]?.score || 0,
          confidence,
          latencyMs,
          synonymsExpanded,
          acronymsExpanded,
          citations: citations.map((c: any) => ({
            title: c.title,
            source: c.source,
            authors: c.authors || [],
            year: c.publicationYear,
          })),
          chunks: retrievedChunks.slice(0, 5).map(c => ({
            text: c.text.substring(0, 200),
            score: c.score,
          })),
          errors,
        },
      };
    } catch (error) {
      return {
        questionId: question.id,
        query: question.query,
        specialty: question.specialty,
        passed: false,
        score: 0,
        metrics: {
          precisionAt5: 0,
          recallAt5: 0,
          mrr: 0,
          map: 0,
          ndcg: 0,
          hitRate: 0,
          contextRecall: 0,
          faithfulness: 0,
          groundedness: 0,
          citationAccuracy: 0,
          answerCompleteness: 0,
          evidenceCoverage: 0,
          medicalAccuracy: 0,
        },
        details: {
          retrievedCount: 0,
          relevantCount: 0,
          topScore: 0,
          confidence: 0,
          latencyMs: Date.now() - startTime,
          synonymsExpanded: [],
          acronymsExpanded: [],
          citations: [],
          chunks: [],
          errors: [error instanceof Error ? error.message : String(error)],
        },
      };
    }
  }

  private calculatePrecisionAtK(chunks: Array<{ text: string; score: number }>, expectedTerms: string[], k: number): number {
    if (chunks.length === 0) return 0;
    
    const topK = chunks.slice(0, k);
    const relevant = topK.filter(chunk => 
      expectedTerms.some(term => chunk.text.includes(term.toLowerCase()))
    );
    
    return relevant.length / Math.min(k, chunks.length);
  }

  private calculateRecallAtK(chunks: Array<{ text: string; score: number }>, expectedTerms: string[], k: number): number {
    if (chunks.length === 0 || expectedTerms.length === 0) return 0;
    
    const topK = chunks.slice(0, k);
    const foundTerms = new Set<string>();
    
    topK.forEach(chunk => {
      expectedTerms.forEach(term => {
        if (chunk.text.includes(term.toLowerCase())) {
          foundTerms.add(term);
        }
      });
    });
    
    return foundTerms.size / expectedTerms.length;
  }

  private calculateMRR(chunks: Array<{ text: string; score: number }>, expectedTerms: string[]): number {
    if (chunks.length === 0) return 0;
    
    for (let i = 0; i < chunks.length; i++) {
      if (expectedTerms.some(term => chunks[i].text.includes(term.toLowerCase()))) {
        return 1 / (i + 1);
      }
    }
    
    return 0;
  }

  private calculateMAP(chunks: Array<{ text: string; score: number }>, expectedTerms: string[]): number {
    if (chunks.length === 0) return 0;
    
    let sumPrecision = 0;
    let relevantCount = 0;
    
    for (let i = 0; i < chunks.length; i++) {
      if (expectedTerms.some(term => chunks[i].text.includes(term.toLowerCase()))) {
        relevantCount++;
        const precisionAtK = relevantCount / (i + 1);
        sumPrecision += precisionAtK;
      }
    }
    
    return relevantCount > 0 ? sumPrecision / relevantCount : 0;
  }

  private calculateNDCG(chunks: Array<{ text: string; score: number }>, expectedTerms: string[]): number {
    if (chunks.length === 0) return 0;
    
    const relevances = chunks.map(chunk => 
      expectedTerms.some(term => chunk.text.includes(term.toLowerCase())) ? 1 : 0
    );
    
    const dcg = relevances.reduce((sum, rel, i) => {
      return sum + rel / Math.log2(i + 2);
    }, 0);
    
    const idealRelevances = [...relevances].sort((a, b) => b - a);
    const idcg = idealRelevances.reduce((sum, rel, i) => {
      return sum + rel / Math.log2(i + 2);
    }, 0);
    
    return idcg > 0 ? dcg / idcg : 0;
  }

  private calculateContextRecall(chunks: Array<{ text: string; score: number }>, expectedTerms: string[]): number {
    if (expectedTerms.length === 0) return 1.0;
    
    const foundTerms = new Set<string>();
    chunks.forEach(chunk => {
      expectedTerms.forEach(term => {
        if (chunk.text.includes(term.toLowerCase())) {
          foundTerms.add(term);
        }
      });
    });
    
    return foundTerms.size / expectedTerms.length;
  }

  private calculateFaithfulness(chunks: Array<{ text: string; score: number }>, query: string): number {
    if (chunks.length === 0) return 0;
    
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 3);
    let coveredTerms = 0;
    
    chunks.forEach(chunk => {
      queryTerms.forEach(term => {
        if (chunk.text.includes(term.toLowerCase())) {
          coveredTerms++;
        }
      });
    });
    
    return queryTerms.length > 0 ? Math.min(coveredTerms / queryTerms.length, 1.0) : 0.5;
  }

  private calculateGroundedness(chunks: Array<{ text: string; score: number }>, query: string): number {
    if (chunks.length === 0) return 0;
    
    const avgScore = chunks.reduce((sum, chunk) => sum + chunk.score, 0) / chunks.length;
    const hasMedicalContent = chunks.some(chunk => 
      chunk.text.includes('patient') || 
      chunk.text.includes('treatment') || 
      chunk.text.includes('diagnosis') ||
      chunk.text.includes('symptom')
    );
    
    return avgScore * (hasMedicalContent ? 1.0 : 0.5);
  }

  private calculateCitationAccuracy(
    citations: Array<{ title?: string; source?: string; authors?: string[]; year?: number }>,
    expectedTerms: string[]
  ): number {
    if (citations.length === 0) return 0;
    
    const validCitations = citations.filter(citation => 
      citation.title && 
      citation.title !== 'Unknown' &&
      citation.source &&
      citation.source !== 'Unknown'
    );
    
    return validCitations.length / citations.length;
  }

  private calculateAnswerCompleteness(
    citations: Array<{ title?: string; source?: string }>,
    expectedTerms: string[]
  ): number {
    if (citations.length === 0) return 0;
    
    const termsCovered = new Set<string>();
    citations.forEach(citation => {
      const text = `${citation.title} ${citation.source}`.toLowerCase();
      expectedTerms.forEach(term => {
        if (text.includes(term.toLowerCase())) {
          termsCovered.add(term);
        }
      });
    });
    
    return termsCovered.size / expectedTerms.length;
  }

  private calculateEvidenceCoverage(chunks: Array<{ text: string; score: number }>, expectedTerms: string[]): number {
    if (expectedTerms.length === 0) return 1.0;
    
    const coveredTerms = new Set<string>();
    chunks.forEach(chunk => {
      expectedTerms.forEach(term => {
        if (chunk.text.includes(term.toLowerCase())) {
          coveredTerms.add(term);
        }
      });
    });
    
    return coveredTerms.size / expectedTerms.length;
  }

  private calculateMedicalAccuracy(chunks: Array<{ text: string; score: number }>, query: string): number {
    if (chunks.length === 0) return 0;
    
    const medicalIndicators = [
      'patient', 'treatment', 'diagnosis', 'symptom', 'disease',
      'clinical', 'medical', 'therapy', 'medication', 'dose',
      'mg', 'mcg', 'units', 'tablet', 'capsule', 'injection',
      'surgery', 'procedure', 'test', 'examination', 'finding'
    ];
    
    let indicatorCount = 0;
    chunks.forEach(chunk => {
      const text = chunk.text.toLowerCase();
      medicalIndicators.forEach(indicator => {
        if (text.includes(indicator)) {
          indicatorCount++;
        }
      });
    });
    
    const avgIndicators = chunks.length > 0 ? indicatorCount / chunks.length : 0;
    return Math.min(avgIndicators / 3, 1.0);
  }

  private calculateConfidence(
    chunks: Array<{ text: string; score: number }>,
    citations: any[],
    contextRecall: number
  ): number {
    if (chunks.length === 0) return 0;
    
    const avgScore = chunks.reduce((sum, chunk) => sum + chunk.score, 0) / chunks.length;
    const citationBonus = citations.length > 0 ? 0.1 : 0;
    const recallBonus = contextRecall > 0.5 ? 0.1 : 0;
    
    return Math.min(Math.round((avgScore + citationBonus + recallBonus) * 100) / 100, 1.0);
  }

  private calculateOverallScore(metrics: EvaluationResult['metrics']): number {
    const weights = {
      precisionAt5: 0.15,
      recallAt5: 0.15,
      mrr: 0.10,
      map: 0.10,
      ndcg: 0.10,
      hitRate: 0.10,
      contextRecall: 0.10,
      faithfulness: 0.08,
      groundedness: 0.04,
      citationAccuracy: 0.05,
      answerCompleteness: 0.03,
    };
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const [key, value] of Object.entries(metrics)) {
      if (key in weights) {
        weightedSum += value * (weights as any)[key];
        totalWeight += (weights as any)[key];
      }
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private generateReport(results: EvaluationResult[], totalTimeMs: number): EvaluationReport {
    const totalQuestions = results.length;
    const passedQuestions = results.filter(r => r.passed).length;
    const failedQuestions = totalQuestions - passedQuestions;

    const specialtyBreakdown: Record<string, { total: number; passed: number; avgScore: number }> = {};
    const difficultyBreakdown: Record<string, { total: number; passed: number; avgScore: number }> = {};

    results.forEach(result => {
      if (!specialtyBreakdown[result.specialty]) {
        specialtyBreakdown[result.specialty] = { total: 0, passed: 0, avgScore: 0 };
      }
      specialtyBreakdown[result.specialty].total++;
      if (result.passed) specialtyBreakdown[result.specialty].passed++;
      specialtyBreakdown[result.specialty].avgScore += result.score;

      const difficulty = 'medium';
      if (!difficultyBreakdown[difficulty]) {
        difficultyBreakdown[difficulty] = { total: 0, passed: 0, avgScore: 0 };
      }
      difficultyBreakdown[difficulty].total++;
      if (result.passed) difficultyBreakdown[difficulty].passed++;
      difficultyBreakdown[difficulty].avgScore += result.score;
    });

    Object.keys(specialtyBreakdown).forEach(key => {
      specialtyBreakdown[key].avgScore /= specialtyBreakdown[key].total;
    });
    Object.keys(difficultyBreakdown).forEach(key => {
      difficultyBreakdown[key].avgScore /= difficultyBreakdown[key].total;
    });

    const avgMetrics = {
      avgPrecisionAt5: results.reduce((sum, r) => sum + r.metrics.precisionAt5, 0) / totalQuestions,
      avgRecallAt5: results.reduce((sum, r) => sum + r.metrics.recallAt5, 0) / totalQuestions,
      avgMRR: results.reduce((sum, r) => sum + r.metrics.mrr, 0) / totalQuestions,
      avgMAP: results.reduce((sum, r) => sum + r.metrics.map, 0) / totalQuestions,
      avgNDCG: results.reduce((sum, r) => sum + r.metrics.ndcg, 0) / totalQuestions,
      avgHitRate: results.reduce((sum, r) => sum + r.metrics.hitRate, 0) / totalQuestions,
      avgContextRecall: results.reduce((sum, r) => sum + r.metrics.contextRecall, 0) / totalQuestions,
      avgFaithfulness: results.reduce((sum, r) => sum + r.metrics.faithfulness, 0) / totalQuestions,
      avgGroundedness: results.reduce((sum, r) => sum + r.metrics.groundedness, 0) / totalQuestions,
      avgCitationAccuracy: results.reduce((sum, r) => sum + r.metrics.citationAccuracy, 0) / totalQuestions,
      avgAnswerCompleteness: results.reduce((sum, r) => sum + r.metrics.answerCompleteness, 0) / totalQuestions,
      avgEvidenceCoverage: results.reduce((sum, r) => sum + r.metrics.evidenceCoverage, 0) / totalQuestions,
      avgMedicalAccuracy: results.reduce((sum, r) => sum + r.metrics.medicalAccuracy, 0) / totalQuestions,
    };

    const latencies = results.map(r => r.details.latencyMs).sort((a, b) => a - b);
    const p50Index = Math.floor(latencies.length * 0.5);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p99Index = Math.floor(latencies.length * 0.99);

    const topFailures = results
      .filter(r => !r.passed)
      .sort((a, b) => a.score - b.score)
      .slice(0, 10)
      .map(r => ({
        query: r.query,
        reason: r.details.errors.join('; ') || `Score: ${r.score.toFixed(2)}`,
      }));

    const recommendations: string[] = [];
    if (avgMetrics.avgPrecisionAt5 < 0.5) {
      recommendations.push('Improve retrieval precision - consider tuning hybrid weights or adding more training data');
    }
    if (avgMetrics.avgRecallAt5 < 0.5) {
      recommendations.push('Improve recall - consider expanding synonym dictionary or adjusting BM25 parameters');
    }
    if (avgMetrics.avgCitationAccuracy < 0.7) {
      recommendations.push('Improve citation quality - verify metadata extraction and citation generation');
    }
    if (avgMetrics.avgFaithfulness < 0.7) {
      recommendations.push('Improve faithfulness - strengthen RAG grounding and reduce hallucination');
    }
    if (avgMetrics.avgMedicalAccuracy < 0.8) {
      recommendations.push('Improve medical accuracy - add more authoritative medical documents');
    }

    return {
      totalQuestions,
      passedQuestions,
      failedQuestions,
      averageScore: results.reduce((sum, r) => sum + r.score, 0) / totalQuestions,
      specialtyBreakdown,
      difficultyBreakdown,
      metrics: avgMetrics,
      latency: {
        avgLatencyMs: latencies.reduce((a, b) => a + b, 0) / latencies.length,
        p50LatencyMs: latencies[p50Index] || 0,
        p95LatencyMs: latencies[p95Index] || 0,
        p99LatencyMs: latencies[p99Index] || 0,
      },
      topFailures,
      recommendations,
    };
  }

  async runBenchmark(specialty?: string): Promise<{
    summary: string;
    passed: number;
    total: number;
    score: number;
    details: any[];
  }> {
    const report = await this.runEvaluation({ specialty, limit: 50 });
    
    let summary = `Benchmark Results (${report.totalQuestions} questions):\n`;
    summary += `Passed: ${report.passedQuestions}/${report.totalQuestions} (${((report.passedQuestions/report.totalQuestions)*100).toFixed(1)}%)\n`;
    summary += `Average Score: ${(report.averageScore * 100).toFixed(1)}%\n`;
    summary += `Avg Precision@5: ${(report.metrics.avgPrecisionAt5 * 100).toFixed(1)}%\n`;
    summary += `Avg Recall@5: ${(report.metrics.avgRecallAt5 * 100).toFixed(1)}%\n`;
    summary += `Avg MRR: ${(report.metrics.avgMRR * 100).toFixed(1)}%\n`;
    summary += `Avg NDCG: ${(report.metrics.avgNDCG * 100).toFixed(1)}%\n`;
    summary += `Avg Citation Accuracy: ${(report.metrics.avgCitationAccuracy * 100).toFixed(1)}%\n`;
    summary += `Avg Medical Accuracy: ${(report.metrics.avgMedicalAccuracy * 100).toFixed(1)}%\n`;
    summary += `Avg Latency: ${report.latency.avgLatencyMs.toFixed(0)}ms (P95: ${report.latency.p95LatencyMs.toFixed(0)}ms)\n`;
    
    return {
      summary,
      passed: report.passedQuestions,
      total: report.totalQuestions,
      score: report.averageScore,
      details: report.topFailures,
    };
  }
}
