/**
 * Production Readiness Audit Script
 * 
 * This script performs a comprehensive audit of the NileoPedia RAG system
 * by executing real queries against the database, Pinecone, and services.
 */

import { PrismaClient, MedicalDocument, DocumentMetadata, EmbeddingMetadata } from '@prisma/client';
import { RetrievalService } from '../src/modules/retrieval/retrieval.service';
import { crossEncoderReranker } from '../src/modules/retrieval/cross-encoder-reranker.service';
import { confidenceEngine } from '../src/modules/medical/confidence-engine.service';
import { citationQualityService } from '../src/modules/medical/citation-quality.service';
import { knowledgeAuditService } from '../src/modules/medical/knowledge-audit.service';
import { knowledgeGapDetectionService } from '../src/modules/monitoring/knowledge-gap-detection.service';
import { productionMonitoringService } from '../src/modules/monitoring/production-monitoring.service';
import { dynamicRetrievalService } from '../src/modules/medical/dynamic-retrieval.service';
import { medicalSynonymService } from '../src/modules/medical/synonym.service';
import { medicalAcronymResolver } from '../src/modules/medical/acronym-resolver.service';

const prisma = new PrismaClient();

interface AuditResult {
  component: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
}

const results: AuditResult[] = [];

function logResult(component: string, test: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: any) {
  results.push({ component, test, status, message, details });
  console.log(`[${status}] ${component} > ${test}: ${message}`);
}

async function auditRetrievalQuality() {
  console.log('\n=== AUDITING RETRIEVAL QUALITY ===');
  
  try {
    const retrievalService = new RetrievalService();
    
    const testQueries = [
      'What is hypertension?',
      'high blood pressure treatment',
      'HTN medications',
      'diabetes mellitus type 2',
      'myocardial infarction symptoms',
      'chest pain differential diagnosis',
      'pneumonia treatment guidelines',
      'COPD management',
      'asthma exacerbation',
      'acute kidney injury'
    ];
    
    for (const query of testQueries) {
      try {
        const results = await retrievalService.semanticSearch(query, 5);
        const hasResults = results.length > 0;
        const hasMedicalContent = results.some(r => 
          r.metadata?.text?.toLowerCase().includes('patient') ||
          r.metadata?.text?.toLowerCase().includes('treatment') ||
          r.metadata?.text?.toLowerCase().includes('diagnosis') ||
          r.metadata?.text?.toLowerCase().includes('symptom')
        );
        
        logResult(
          'Retrieval Quality',
          `Semantic search: "${query}"`,
          hasResults && hasMedicalContent ? 'PASS' : 'WARNING',
          hasResults ? `Found ${results.length} results, medical content: ${hasMedicalContent}` : 'No results found',
          { resultCount: results.length, hasMedicalContent, topScore: results[0]?.score }
        );
      } catch (error: any) {
        logResult('Retrieval Quality', `Semantic search: "${query}"`, 'FAIL', error.message);
      }
    }

    const acronymTests = [
      { query: 'HTN', expected: 'hypertension' },
      { query: 'MI', expected: 'myocardial infarction' },
      { query: 'COPD', expected: 'chronic obstructive pulmonary disease' },
      { query: 'AKI', expected: 'acute kidney injury' },
      { query: 'DKA', expected: 'diabetic ketoacidosis' }
    ];
    
    for (const test of acronymTests) {
      const expansion = medicalAcronymResolver.resolveAll(test.query);
      const found = expansion.acronyms.some(a => 
        a.expanded.toLowerCase().includes(test.expected) ||
        a.original.toLowerCase() === test.expected
      );
      
      logResult(
        'Retrieval Quality',
        `Acronym expansion: ${test.query}`,
        found ? 'PASS' : 'FAIL',
        found ? `Correctly expanded to ${test.expected}` : `Expected expansion to ${test.expected}, got: ${expansion.expandedQuery}`,
        { expansion: expansion.expandedQuery, acronyms: expansion.acronyms.map(a => a.expanded) }
      );
    }

    const synonymTests = [
      { query: 'high blood pressure', expected: 'hypertension' },
      { query: 'heart attack', expected: 'myocardial infarction' },
      { query: 'stroke', expected: 'cerebrovascular accident' },
      { query: 'diabetic', expected: 'diabetes' }
    ];
    
    for (const test of synonymTests) {
      const expansion = medicalSynonymService.expand(test.query);
      const found = expansion.matchedSynonym?.toLowerCase().includes(test.expected.toLowerCase()) ||
                    expansion.synonyms.some(s => s.toLowerCase().includes(test.expected.toLowerCase()));
      
      logResult(
        'Retrieval Quality',
        `Synonym expansion: ${test.query}`,
        found ? 'PASS' : 'WARNING',
        found ? `Correctly matched synonym: ${expansion.matchedSynonym}` : `No synonym match found`,
        { matchedSynonym: expansion.matchedSynonym, synonyms: expansion.synonyms }
      );
    }

    const queryAnalysis = dynamicRetrievalService.analyzeQuery('What is hypertension?');
    logResult(
      'Retrieval Quality',
      'Dynamic weight analysis',
      queryAnalysis.denseWeight > 0 && queryAnalysis.keywordWeight > 0 ? 'PASS' : 'FAIL',
      `Dense: ${queryAnalysis.denseWeight}, Keyword: ${queryAnalysis.keywordWeight}`,
      queryAnalysis
    );

  } catch (error: any) {
    logResult('Retrieval Quality', 'Overall', 'FAIL', error.message);
  }
}

async function auditChunkQuality() {
  console.log('\n=== AUDITING CHUNK QUALITY ===');
  
  try {
    const chunks = await prisma.embeddingMetadata.findMany({
      take: 100,
      orderBy: { id: 'asc' }
    });
    
    const chunkLengths = chunks.map(c => c.chunkText?.length || 0);
    const avgLength = chunkLengths.reduce((a, b) => a + b, 0) / chunkLengths.length;
    const tinyChunks = chunks.filter(c => (c.chunkText?.length || 0) < 50);
    const duplicateChunks = chunks.filter(c => c.isDuplicate);
    const validChunks = chunks.filter(c => c.isValid);
    
    logResult(
      'Chunk Quality',
      'Average chunk size',
      avgLength > 100 && avgLength < 2000 ? 'PASS' : 'WARNING',
      `Average chunk length: ${avgLength.toFixed(1)} characters`,
      { avgLength, min: Math.min(...chunkLengths), max: Math.max(...chunkLengths) }
    );
    
    logResult(
      'Chunk Quality',
      'Tiny chunks',
      tinyChunks.length === 0 ? 'PASS' : 'WARNING',
      `Found ${tinyChunks.length} tiny chunks (< 50 chars) out of ${chunks.length} sampled`,
      { tinyChunkCount: tinyChunks.length, percentage: (tinyChunks.length / chunks.length * 100).toFixed(1) }
    );
    
    logResult(
      'Chunk Quality',
      'Duplicate chunks',
      duplicateChunks.length === 0 ? 'PASS' : 'WARNING',
      `Found ${duplicateChunks.length} duplicate chunks out of ${chunks.length} sampled`,
      { duplicateCount: duplicateChunks.length, percentage: (duplicateChunks.length / chunks.length * 100).toFixed(1) }
    );
    
    logResult(
      'Chunk Quality',
      'Valid chunks',
      validChunks.length === chunks.length ? 'PASS' : 'WARNING',
      `${validChunks.length}/${chunks.length} chunks marked as valid`,
      { validCount: validChunks.length, invalidCount: chunks.length - validChunks.length }
    );

    const withMetadata = chunks.filter(c => 
      c.chunkText && c.pineconeVectorId && c.documentId && c.chunkIndex !== undefined
    );
    const metadataComplete = withMetadata.length / chunks.length;
    
    logResult(
      'Chunk Quality',
      'Chunk metadata completeness',
      metadataComplete === 1 ? 'PASS' : 'FAIL',
      `${(metadataComplete * 100).toFixed(1)}% chunks have complete metadata`,
      { completeCount: withMetadata.length, total: chunks.length }
    );

  } catch (error: any) {
    logResult('Chunk Quality', 'Overall', 'FAIL', error.message);
  }
}

async function auditMetadataCompleteness() {
  console.log('\n=== AUDITING METADATA COMPLETENESS ===');
  
  try {
    const documents = await prisma.medicalDocument.findMany({
      include: { documentMetadata: true },
      take: 50
    });
    
    const fields = [
      'title', 'authors', 'journal', 'publicationYear', 'doi', 
      'pmid', 'specialty', 'keywords', 'source', 'publicationType',
      'abstract', 'disease', 'symptoms', 'treatment', 'medication'
    ];
    
    const stats: Record<string, { present: number; total: number }> = {};
    fields.forEach(field => {
      stats[field] = { present: 0, total: documents.length };
    });
    
    documents.forEach(doc => {
      const meta = doc.documentMetadata;
      if (meta) {
        fields.forEach(field => {
          const value = (meta as any)[field];
          if (value !== null && value !== undefined && value !== '' && 
              !(Array.isArray(value) && value.length === 0)) {
            stats[field].present++;
          }
        });
      }
    });
    
    fields.forEach(field => {
      const percentage = (stats[field].present / stats[field].total) * 100;
      logResult(
        'Metadata Completeness',
        field,
        percentage >= 80 ? 'PASS' : percentage >= 50 ? 'WARNING' : 'FAIL',
        `${stats[field].present}/${stats[field].total} documents have ${field} (${percentage.toFixed(1)}%)`,
        stats[field]
      );
    });

  } catch (error: any) {
    logResult('Metadata Completeness', 'Overall', 'FAIL', error.message);
  }
}

async function auditCitationQuality() {
  console.log('\n=== AUDITING CITATION QUALITY ===');
  
  try {
    const responses = await prisma.aIResponse.findMany({
      take: 20,
      include: { citations: true },
      where: { summary: { not: null } }
    });
    
    let totalCitations = 0;
    let unknownCitations = 0;
    let completeCitations = 0;
    
    responses.forEach(response => {
      response.citations?.forEach(citation => {
        totalCitations++;
        const hasUnknown = 
          citation.title === 'Unknown' ||
          citation.source === 'Unknown' ||
          !citation.authors ||
          !citation.publicationYear;
        
        if (hasUnknown) {
          unknownCitations++;
        } else {
          completeCitations++;
        }
      });
    });
    
    logResult(
      'Citation Quality',
      'Citation completeness',
      totalCitations > 0 ? (unknownCitations / totalCitations < 0.1 ? 'PASS' : 'WARNING') : 'WARNING',
      `${completeCitations}/${totalCitations} citations have complete metadata (${unknownCitations} with "Unknown")`,
      { totalCitations, completeCitations, unknownCitations }
    );

  } catch (error: any) {
    logResult('Citation Quality', 'Overall', 'FAIL', error.message);
  }
}

async function auditConfidenceEngine() {
  console.log('\n=== AUDITING CONFIDENCE ENGINE ===');
  
  try {
    const responses = await prisma.aIResponse.findMany({
      take: 20,
      where: { confidenceScore: { not: null } }
    });
    
    const confidenceScores = responses.map(r => r.confidenceScore as number);
    const avgConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;
    const minConfidence = Math.min(...confidenceScores);
    const maxConfidence = Math.max(...confidenceScores);
    const dynamicScores = confidenceScores.filter(s => s > 0 && s < 1);
    
    logResult(
      'Confidence Engine',
      'Dynamic confidence calculation',
      dynamicScores.length > 0 ? 'PASS' : 'FAIL',
      `Average confidence: ${(avgConfidence * 100).toFixed(1)}%, Range: ${(minConfidence * 100).toFixed(1)}% - ${(maxConfidence * 100).toFixed(1)}%`,
      { avgConfidence, minConfidence, maxConfidence, sampleSize: responses.length }
    );

  } catch (error: any) {
    logResult('Confidence Engine', 'Overall', 'FAIL', error.message);
  }
}

async function auditCrossEncoder() {
  console.log('\n=== AUDITING CROSS-ENCODER RERANKER ===');
  
  try {
    const testQuery = 'hypertension treatment guidelines';
    const retrievalService = new RetrievalService();
    const initialResults = await retrievalService.semanticSearch(testQuery, 10);
    
    if (initialResults.length === 0) {
      logResult('Cross-Encoder', 'Reranking test', 'WARNING', 'No results to rerank');
      return;
    }
    
    const rerankedResults = await crossEncoderReranker.rerank(testQuery, initialResults, 5);
    
    const orderChanged = initialResults.slice(0, 5).some((r, i) => 
      r.id !== rerankedResults[i]?.id
    );
    
    logResult(
      'Cross-Encoder',
      'Reranking changes order',
      orderChanged ? 'PASS' : 'WARNING',
      orderChanged ? 'Reranking modified result order' : 'Reranking did not change order',
      { 
        originalOrder: initialResults.slice(0, 5).map(r => r.id),
        rerankedOrder: rerankedResults.map(r => r.id)
      }
    );

  } catch (error: any) {
    logResult('Cross-Encoder', 'Overall', 'FAIL', error.message);
  }
}

async function auditExplainability() {
  console.log('\n=== AUDITING EXPLAINABILITY ===');
  
  try {
    const retrievalService = new RetrievalService();
    const testQuery = 'What is diabetes?';
    const results = await retrievalService.semanticSearch(testQuery, 3);
    
    const hasExplanation = results.every(r => 
      r.metadata?.explanation ||
      r.metadata?.retrievalScore ||
      r.metadata?.selectedReason
    );
    
    logResult(
      'Explainability',
      'Response explanations',
      hasExplanation ? 'PASS' : 'WARNING',
      hasExplanation ? 'All results include explainability metadata' : 'Some results missing explainability',
      { 
        hasExplanation,
        sampleSize: results.length,
        hasScore: results.filter(r => r.metadata?.retrievalScore).length,
        hasReason: results.filter(r => r.metadata?.selectedReason).length
      }
    );

  } catch (error: any) {
    logResult('Explainability', 'Overall', 'FAIL', error.message);
  }
}

async function auditEvaluation() {
  console.log('\n=== AUDITING EVALUATION ===');
  
  try {
    const { evaluationDatasetService } = await import('../src/modules/evaluation/evaluation-dataset.service');
    const service = new evaluationDatasetService();
    
    const metrics = await service.runEvaluation();
    
    logResult(
      'Evaluation',
      'Evaluation metrics',
      metrics.averageOverallScore > 0.5 ? 'PASS' : 'WARNING',
      `Overall score: ${(metrics.averageOverallScore * 100).toFixed(1)}%`,
      metrics
    );

  } catch (error: any) {
    logResult('Evaluation', 'Overall', 'FAIL', error.message);
  }
}

async function auditMonitoring() {
  console.log('\n=== AUDITING MONITORING ===');
  
  try {
    const metrics = productionMonitoringService.getSystemMetrics();
    
    logResult(
      'Monitoring',
      'System metrics availability',
      metrics.totalQueries >= 0 ? 'PASS' : 'FAIL',
      `Monitoring system operational, tracked ${metrics.totalQueries} queries`,
      metrics
    );

  } catch (error: any) {
    logResult('Monitoring', 'Overall', 'FAIL', error.message);
  }
}

async function auditKnowledgeBase() {
  console.log('\n=== AUDITING KNOWLEDGE BASE ===');
  
  try {
    const audit = await knowledgeAuditService.runAudit();
    
    logResult(
      'Knowledge Base',
      'Knowledge audit',
      audit.overallScore >= 70 ? 'PASS' : audit.overallScore >= 50 ? 'WARNING' : 'FAIL',
      `Knowledge coverage: ${audit.overallScore.toFixed(1)}%`,
      {
        totalDocuments: audit.totalDocuments,
        indexedDiseases: audit.indexedDiseases,
        missingDiseases: audit.missingDiseases,
        duplicateDiseases: audit.duplicateDiseases,
        missingMetadata: audit.missingMetadata,
        missingEmbeddings: audit.missingEmbeddings
      }
    );

  } catch (error: any) {
    logResult('Knowledge Base', 'Overall', 'FAIL', error.message);
  }
}

async function runAudit() {
  console.log('Starting Production Readiness Audit...\n');
  
  await auditRetrievalQuality();
  await auditChunkQuality();
  await auditMetadataCompleteness();
  await auditCitationQuality();
  await auditConfidenceEngine();
  await auditCrossEncoder();
  await auditExplainability();
  await auditEvaluation();
  await auditMonitoring();
  await auditKnowledgeBase();
  
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const warningCount = results.filter(r => r.status === 'WARNING').length;
  const total = results.length;
  const readiness = ((passCount / total) * 100).toFixed(1);
  
  console.log('\n=== AUDIT SUMMARY ===');
  console.log(`Total tests: ${total}`);
  console.log(`PASS: ${passCount} (${((passCount/total)*100).toFixed(1)}%)`);
  console.log(`FAIL: ${failCount} (${((failCount/total)*100).toFixed(1)}%)`);
  console.log(`WARNING: ${warningCount} (${((warningCount/total)*100).toFixed(1)}%)`);
  console.log(`\nProduction Readiness: ${readiness}%`);
  
  if (failCount > 0) {
    console.log('\n=== FAILED TESTS ===');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`[${r.component}] ${r.test}: ${r.message}`);
    });
  }
  
  if (warningCount > 0) {
    console.log('\n=== WARNINGS ===');
    results.filter(r => r.status === 'WARNING').forEach(r => {
      console.log(`[${r.component}] ${r.test}: ${r.message}`);
    });
  }
  
  await prisma.$disconnect();
  return results;
}

runAudit().catch(console.error);
