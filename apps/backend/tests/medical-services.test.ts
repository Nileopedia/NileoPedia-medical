import { MedicalSynonymService } from '../src/modules/medical/synonym.service';
import { MedicalAcronymResolver } from '../src/modules/medical/acronym-resolver.service';
import { CitationQualityService } from '../src/modules/medical/citation-quality.service';
import { ConfidenceEngine } from '../src/modules/medical/confidence-engine.service';
import { DynamicRetrievalService } from '../src/modules/medical/dynamic-retrieval.service';
import { QualityValidationService } from '../src/modules/medical/quality-validation.service';
import { Bm25Service } from '../src/modules/medical/bm25.service';

describe('MedicalSynonymService', () => {
  let service: MedicalSynonymService;

  beforeEach(() => {
    service = new MedicalSynonymService();
  });

  it('should expand hypertension synonyms', () => {
    const result = service.expand('hypertension');
    expect(result.matchedSynonym).toBe('hypertension');
    expect(result.synonyms).toContain('high blood pressure');
    expect(result.synonyms).toContain('htn');
    expect(result.expandedQuery).toContain('hypertension');
  });

  it('should expand HTN abbreviation', () => {
    const result = service.expand('htn');
    expect(result.matchedSynonym).toBe('htn');
    expect(result.synonyms).toContain('hypertension');
    expect(result.synonyms).toContain('high blood pressure');
  });

  it('should expand heart attack synonyms', () => {
    const result = service.expand('heart attack');
    expect(result.matchedSynonym).toBe('heart attack');
    expect(result.synonyms).toContain('myocardial infarction');
    expect(result.synonyms).toContain('mi');
  });

  it('should expand stroke synonyms', () => {
    const result = service.expand('stroke');
    expect(result.matchedSynonym).toBe('stroke');
    expect(result.synonyms).toContain('cerebrovascular accident');
    expect(result.synonyms).toContain('cva');
  });

  it('should detect medical terms', () => {
    expect(service.isMedicalTerm('hypertension')).toBe(true);
    expect(service.isMedicalTerm('diabetes')).toBe(true);
    expect(service.isMedicalTerm('asthma')).toBe(true);
    expect(service.isMedicalTerm('fever')).toBe(true);
    expect(service.isMedicalTerm('computer')).toBe(false);
  });

  it('should return synonym groups', () => {
    const groups = service.getSynonymGroups();
    expect(groups.length).toBeGreaterThan(0);
    expect(groups[0]).toContain('hypertension');
  });
});

describe('MedicalAcronymResolver', () => {
  let resolver: MedicalAcronymResolver;

  beforeEach(() => {
    resolver = new MedicalAcronymResolver();
  });

  it('should resolve HTN', () => {
    const result = resolver.resolve('htn');
    expect(result).not.toBeNull();
    expect(result?.expanded).toBe('hypertension');
    expect(result?.confidence).toBeGreaterThan(0.9);
  });

  it('should resolve MI', () => {
    const result = resolver.resolve('mi');
    expect(result).not.toBeNull();
    expect(result?.expanded).toBe('myocardial infarction');
  });

  it('should resolve COPD', () => {
    const result = resolver.resolve('copd');
    expect(result).not.toBeNull();
    expect(result?.expanded).toBe('chronic obstructive pulmonary disease');
  });

  it('should resolve all acronyms in query', () => {
    const expansion = resolver.resolveAll('patient with htn and mi');
    expect(expansion.acronyms.length).toBeGreaterThanOrEqual(2);
    expect(expansion.expandedQuery).toContain('hypertension');
    expect(expansion.expandedQuery).toContain('myocardial infarction');
  });

  it('should get acronyms by category', () => {
    const diseases = resolver.getAcronymsByCategory('disease');
    expect(diseases.length).toBeGreaterThan(0);
    expect(diseases.some(d => d.acronym === 'htn')).toBe(true);
  });
});

describe('CitationQualityService', () => {
  let service: CitationQualityService;

  beforeEach(() => {
    service = new CitationQualityService();
  });

  it('should evaluate WHO sources as highest quality', () => {
    const result = service.evaluate('who.int', 'guideline');
    expect(result.tier).toBe('WHO');
    expect(result.qualityScore).toBeGreaterThanOrEqual(10);
  });

  it('should evaluate CDC sources as high quality', () => {
    const result = service.evaluate('cdc.gov', 'article');
    expect(result.tier).toBe('CDC');
    expect(result.qualityScore).toBeGreaterThanOrEqual(9);
  });

  it('should evaluate NIH sources as high quality', () => {
    const result = service.evaluate('nih.gov', 'article');
    expect(result.tier).toBe('NIH');
    expect(result.qualityScore).toBeGreaterThanOrEqual(9);
  });

  it('should evaluate PubMed sources', () => {
    const result = service.evaluate('pubmed', 'journal');
    expect(result.tier).toBe('PubMed');
    expect(result.qualityScore).toBeGreaterThanOrEqual(8);
  });

  it('should evaluate unknown sources as low quality', () => {
    const result = service.evaluate('random-blog.com', 'blog');
    expect(result.tier).toBe('BLOG');
    expect(result.qualityScore).toBeLessThan(3);
  });

  it('should prioritize WHO over CDC', () => {
    const whoPriority = service.getTierPriority('WHO');
    const cdcPriority = service.getTierPriority('CDC');
    expect(whoPriority).toBeLessThan(cdcPriority);
  });
});

describe('ConfidenceEngine', () => {
  let engine: ConfidenceEngine;

  beforeEach(() => {
    engine = new ConfidenceEngine();
  });

  it('should calculate high confidence for strong results', () => {
    const result = engine.calculate({
      topSimilarity: 0.9,
      retrievedCount: 8,
      rerankerScores: [0.9, 0.85, 0.8],
      citationQualityScores: [9, 8, 9],
      metadataCompleteness: 90,
      sourceDiversity: 0.8,
    });

    expect(result.confidenceScore).toBeGreaterThan(70);
    expect(result.evidenceStrength).toBe('High');
  });

  it('should calculate low confidence for weak results', () => {
    const result = engine.calculate({
      topSimilarity: 0.2,
      retrievedCount: 1,
      rerankerScores: [0.3],
      citationQualityScores: [2],
      metadataCompleteness: 20,
      sourceDiversity: 0.1,
    });

    expect(result.confidenceScore).toBeLessThan(40);
    expect(result.evidenceStrength).toBe('Very Low');
  });

  it('should return breakdown components', () => {
    const result = engine.calculate({
      topSimilarity: 0.5,
      retrievedCount: 4,
      rerankerScores: [0.6],
      citationQualityScores: [5],
      metadataCompleteness: 50,
      sourceDiversity: 0.5,
    });

    expect(result.breakdown.similarityScore).toBeGreaterThan(0);
    expect(result.breakdown.documentCount).toBeGreaterThan(0);
    expect(result.breakdown.citationQuality).toBeGreaterThan(0);
    expect(result.breakdown.rerankerScore).toBeGreaterThan(0);
  });
});

describe('DynamicRetrievalService', () => {
  let service: DynamicRetrievalService;

  beforeEach(() => {
    service = new DynamicRetrievalService();
  });

  it('should detect abbreviation queries', () => {
    const result = service.analyzeQuery('HTN');
    expect(result.queryType).toBe('abbreviation');
    expect(result.keywordWeight).toBeGreaterThan(0.5);
  });

  it('should detect symptom queries', () => {
    const result = service.analyzeQuery('chest pain and shortness of breath');
    expect(result.queryType).toBe('symptom');
    expect(result.denseWeight).toBeGreaterThan(0.7);
  });

  it('should detect natural language queries', () => {
    const result = service.analyzeQuery('what is the treatment for hypertension');
    expect(result.queryType).toBe('question');
    expect(result.complexity).toBe('high');
  });

  it('should expand query terms', () => {
    const result = service.analyzeQuery('HTN');
    expect(result.expandedTerms.length).toBeGreaterThan(0);
    expect(result.detectedAcronyms).toContain('htn');
  });
});

describe('QualityValidationService', () => {
  let service: QualityValidationService;

  beforeEach(() => {
    service = new QualityValidationService();
  });

  it('should reject chunks below minimum length', () => {
    const result = service.validateChunk({
      text: 'Short',
      title: 'Test',
      source: 'Test',
      specialty: 'general',
      publicationYear: 2024,
    }, new Set());

    expect(result.isValid).toBe(false);
    expect(result.rejectionReasons.some(r => r.includes('too short'))).toBe(true);
  });

  it('should reject chunks without title', () => {
    const result = service.validateChunk({
      text: 'A'.repeat(300),
      source: 'Test',
      specialty: 'general',
      publicationYear: 2024,
    }, new Set());

    expect(result.isValid).toBe(false);
    expect(result.rejectionReasons.some(r => r.includes('title'))).toBe(true);
  });

  it('should reject chunks without source', () => {
    const result = service.validateChunk({
      text: 'A'.repeat(300),
      title: 'Test',
      specialty: 'general',
      publicationYear: 2024,
    }, new Set());

    expect(result.isValid).toBe(false);
    expect(result.rejectionReasons.some(r => r.includes('source'))).toBe(true);
  });

  it('should reject duplicate chunks', () => {
    const existingHashes = new Set<string>();
    const text = 'A'.repeat(300);
    existingHashes.add(service['hashText'](text) as any);

    const result = service.validateChunk({
      text,
      title: 'Test',
      source: 'Test',
      specialty: 'general',
      publicationYear: 2024,
    }, existingHashes);

    expect(result.isValid).toBe(false);
    expect(result.rejectionReasons.some(r => r.includes('Duplicate'))).toBe(true);
  });

  it('should validate good chunks', () => {
    const result = service.validateChunk({
      text: 'A'.repeat(300),
      title: 'Valid Medical Document',
      source: 'WHO',
      specialty: 'cardiology',
      publicationYear: 2024,
    }, new Set());

    expect(result.isValid).toBe(true);
    expect(result.rejectionReasons.length).toBe(0);
  });

  it('should validate document chunks', () => {
    const chunks = [
      { text: 'A'.repeat(300), title: 'Test', source: 'WHO', specialty: 'general', publicationYear: 2024 },
      { text: 'B'.repeat(300), title: 'Test', source: 'CDC', specialty: 'cardiology', publicationYear: 2023 },
      { text: 'Short', title: 'Test', source: 'Test', specialty: 'general', publicationYear: 2024 },
    ];

    const report = service.validateDocumentChunks(chunks);
    expect(report.totalChunks).toBe(3);
    expect(report.validChunks).toBeGreaterThanOrEqual(2);
    expect(report.invalidChunks).toBeGreaterThanOrEqual(1);
  });
});

describe('Bm25Service', () => {
  let service: Bm25Service;

  beforeEach(() => {
    service = new Bm25Service();
  });

  it('should initialize without errors', async () => {
    await service.initialize();
    const stats = await service.getStats();
    expect(stats).toBeDefined();
    expect(stats.totalDocuments).toBeGreaterThanOrEqual(0);
  });

  it('should return empty results for empty query', async () => {
    await service.initialize();
    const results = await service.search('', 5);
    expect(Array.isArray(results)).toBe(true);
  });

  it('should return results for valid query', async () => {
    await service.initialize();
    const results = await service.search('hypertension', 5);
    expect(Array.isArray(results)).toBe(true);
    if (results.length > 0) {
      expect(results[0]).toHaveProperty('chunkId');
      expect(results[0]).toHaveProperty('score');
      expect(results[0]).toHaveProperty('text');
    }
  });
});