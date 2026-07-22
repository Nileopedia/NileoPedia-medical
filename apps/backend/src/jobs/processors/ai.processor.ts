import { Groq } from 'groq-sdk';
import prisma from '../../config/prisma';
import { AiGenerationJob, PipelineError, MetadataResponse } from '../types';
import { logger } from '../../config/logger';
import { redis } from '../../lib/redis';
import { CONFIG } from '../../config/env';
import { RetrievalService } from '../../modules/retrieval/retrieval.service';
import { DocumentMetadataService } from '../../modules/documents/metadata.service';
import { ragDebugService } from '../../debug/rag-debug.service';
import { RagDebugInfo } from '../../debug/rag-debug.types';
import { MedicalSynonymService } from '../../modules/medical/synonym.service';
import { DynamicRetrievalService } from '../../modules/medical/dynamic-retrieval.service';
import { CrossEncoderReranker } from '../../modules/retrieval/cross-encoder-reranker.service';
import { ConfidenceEngine, EvidenceStrength } from '../../modules/medical/confidence-engine.service';
import { CitationQualityService } from '../../modules/medical/citation-quality.service';
import { KnowledgeGapDetectionService } from '../../modules/monitoring/knowledge-gap-detection.service';

const synonymService = new MedicalSynonymService();
const dynamicRetrievalService = new DynamicRetrievalService();
const crossEncoderReranker = new CrossEncoderReranker();
const confidenceEngine = new ConfidenceEngine();
const citationQualityService = new CitationQualityService();
const knowledgeGapDetectionService = new KnowledgeGapDetectionService();

interface CitationData {
  title: string;
  source: string;
  authors?: string;
  journal?: string;
  publisher?: string;
  publicationYear?: number;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  isbn?: string;
  pmid?: string;
  pmcid?: string;
  institution?: string;
  country?: string;
  publicationType?: string;
  keywords?: string[];
  medicalSpecialty?: string;
  language?: string;
  url?: string;
  pageNumber?: number;
  sectionTitle?: string;
  documentType?: string;
  specialty?: string;
}

function createPipelineError(stage: 'embeddings' | 'retrieval' | 'llm' | 'database', message: string): PipelineError {
  return {
    success: false,
    stage,
    message,
  };
}

function createEmptyStructuredResponse(clinicalSummary = ''): Record<string, unknown> {
  return {
    clinicalSummary,
    definition: '',
    clinicalOverview: '',
    causes: [],
    riskFactors: [],
    symptoms: [],
    diagnosis: [],
    treatment: { lifestyle: [], medications: [] },
    lifestyleManagement: [],
    complications: [],
    prevention: [],
    specialPopulations: [],
    prognosis: '',
    patientEducation: [],
    keyTakeaways: [],
    warningBoxes: [],
    tables: [],
    references: [],
    followUpQuestions: [],
    patientFriendlyVersion: '',
  };
}

function buildMatchDebug(match: any): RagDebugInfo['pineconeMatches'][0] {
  const metadata = match.metadata || {};
  const preview = typeof metadata.text === 'string' ? metadata.text.slice(0, 150) : (metadata.textPreview || '').slice(0, 150);
  return {
    id: match.id || 'unknown',
    score: typeof match.score === 'number' ? match.score : 0,
    documentId: metadata.documentId,
    chunkId: metadata.chunkId || match.id,
    chunkIndex: metadata.chunkIndex,
    title: metadata.title || metadata.source || 'Unknown',
    preview,
    metadata: metadata as Record<string, unknown>,
  };
}

function logRagDebug(debug: RagDebugInfo) {
  console.log('================================');
  console.log('Original Query');
  console.log('================================');
  console.log(debug.query);
  console.log('================================');
  console.log('Normalized Query:', debug.normalizedQuery);
  console.log('Medical Domain Result:', debug.medicalDomain);
  console.log('Generated Embedding Dimensions:', debug.embeddingDimensions);
  console.log('Embedding Provider:', debug.embeddingProvider);
  console.log('Pinecone Query Vector Size:', debug.embeddingDimensions);
  console.log('Top 10 Pinecone Matches:', debug.pineconeMatches.length);
  for (const match of debug.pineconeMatches) {
    console.log('--------------------------------');
    console.log('Document ID:', match.documentId || 'N/A');
    console.log('Document Title:', match.title);
    console.log('Chunk ID:', match.chunkId);
    console.log('Chunk Index:', match.chunkIndex ?? 'N/A');
    console.log('Similarity Score:', match.score.toFixed(6));
    console.log('Metadata:', JSON.stringify(match.metadata));
    console.log('Chunk Preview:', match.preview);
  }
  console.log('================================');
  console.log('Filtering');
  console.log('================================');
  console.log('MIN_DOCS:', debug.minDocs);
  console.log('Score Threshold:', debug.minScore);
  console.log('Documents Before Filtering:', debug.pineconeMatches.length);
  console.log('Documents After Filtering:', debug.filteredMatches.length);
  for (const match of debug.rejectedMatches) {
    console.log('Rejected:', match.id, 'score:', match.score.toFixed(6), 'reason:', match.reason);
  }
  console.log('================================');
  console.log('Final Context');
  console.log('================================');
  console.log('Chunks Sent to Groq:', debug.chunksSentToGroq);
  console.log('Characters Sent:', debug.charactersSent);
  console.log('Chunk IDs:', debug.chunkIds);
  console.log('================================');
  console.log('Groq');
  console.log('================================');
  console.log('Prompt Size:', debug.promptSize);
  console.log('Completion Time:', debug.completionTime);
  console.log('================================\n');

  ragDebugService.capture(debug);
  logger.info({
    type: 'rag_debug',
    query: debug.query,
    normalizedQuery: debug.normalizedQuery,
    medicalDomain: debug.medicalDomain,
    embeddingProvider: debug.embeddingProvider,
    embeddingDimensions: debug.embeddingDimensions,
    retrievedCount: debug.retrievedCount,
    filteredCount: debug.filteredMatches.length,
    rejectedCount: debug.rejectedMatches.length,
    chunksSentToGroq: debug.chunksSentToGroq,
    topScore: debug.topScore,
    minScore: debug.minScore,
    minDocs: debug.minDocs,
  });
}

export async function processAiGeneration(job: AiGenerationJob) {
  const {
    questionId, query, userId, topK = 10, specialty,
  } = job;
  const totalStart = Date.now();

  try {
    console.log('[AI] User query:', query);
    console.log('[AI] Job params:', {
      questionId, userId, topK, specialty,
    });

    const retrievalService = new RetrievalService();

    if (!retrievalService.embeddingService?.isRealEmbeddings) {
      logger.warn('[WARN] Using mock embeddings - proceeding in offline mode');
    }

    const medicalIntent = await retrievalService.isMedicalQuery(query, retrievalService.embeddingService);
    const normalizedQuery = query.toLowerCase().trim();
    const synonymExpansion = synonymService.expand(normalizedQuery);
    const expandedQuery = synonymExpansion.expandedQuery;

    console.log('================================');
    console.log('Original Query');
    console.log('================================');
    console.log(query);
    console.log('================================');
    console.log('Normalized Query:', normalizedQuery);
    console.log('Medical Domain Result:', medicalIntent);
    console.log('Matched Synonym:', synonymExpansion.matchedSynonym);
    console.log('Expanded Query:', expandedQuery);
    console.log('Synonyms:', synonymExpansion.synonyms);
    console.log('================================\n');

    if (!medicalIntent) {
      const debug: RagDebugInfo = {
        query,
        normalizedQuery,
        expandedQuery,
        matchedSynonym: synonymExpansion.matchedSynonym,
        synonyms: synonymExpansion.synonyms,
        medicalDomain: false,
        embeddingProvider: 'N/A',
        embeddingDimensions: 0,
        pineconeMatches: [],
        filteredMatches: [],
        rejectedMatches: [],
        finalContext: [],
        topScore: null,
        retrievedCount: 0,
        minScore: 0,
        minDocs: 1,
        promptSize: 0,
        completionTime: 0,
        chunksSentToGroq: 0,
        charactersSent: 0,
        chunkIds: [],
      };
      logRagDebug(debug);

      const noResultResponse = await prisma.aIResponse.upsert({
        where: { questionId },
        create: {
          questionId,
          summary: 'Question outside supported medical domain.',
          detailedExplanation: JSON.stringify(createEmptyStructuredResponse('Question outside supported medical domain.')),
          keyFindings: [],
          confidenceScore: 0,
          generatedBy: 'Domain Filter',
          validationStatus: 'APPROVED',
        },
        update: {
          questionId,
          summary: 'Question outside supported medical domain.',
          detailedExplanation: JSON.stringify(createEmptyStructuredResponse('Question outside supported medical domain.')),
          keyFindings: [],
          confidenceScore: 0,
          generatedBy: 'Domain Filter',
          validationStatus: 'APPROVED',
        },
      });

      const totalMs = Date.now() - totalStart;
      await redis.setex(`question-progress:${questionId}`, 300, JSON.stringify({
        questionId,
        progress: 100,
        keyFindings: [],
      }));

      logger.warn(`AI generation skipped - domain filter for question: ${questionId}`);
      console.log('[AI] Domain filter blocked query:', query);

      const metadata: MetadataResponse = {
        answer: 'Question outside supported medical domain.',
        source: 'Domain Filter',
        documentsUsed: 0,
        model: 'none',
        embeddingModel: 'Xenova/all-MiniLM-L6-v2',
        processingTime: totalMs,
      };

      return { success: true, responseId: noResultResponse.id, metadata };
    }

    let embedding: number[] | null = null;
    try {
      console.log('[AI] Generating embedding for query:', query);
      const embeddingPromise = retrievalService.embeddingService.generateEmbedding(query);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Embedding timeout after 15000ms')), 15000);
      });

      embedding = await Promise.race([embeddingPromise, timeoutPromise]) as number[];
      console.log('[AI] Embedding dimensions:', embedding?.length);

      if (!embedding || embedding.length !== 384) {
        logger.error(`[ERROR] Invalid embedding: length=${embedding?.length}, expected=384`);
        return createPipelineError('embeddings', 'Invalid embedding generated');
      }
    } catch (embeddingError: any) {
      logger.error('[ERROR] Embedding generation failed:', embeddingError);
      return createPipelineError('embeddings', 'Embedding service unavailable');
    }

    let retrievalResult: { hasContext: boolean; context: any[]; hybridWeights?: { dense: number; keyword: number }; resolvedAcronyms: string[] } | null = null;
    let debugInfo: RagDebugInfo | null = null;
    try {
      console.log(`[AI] Running strict RAG retrieval for query: ${query}`);
      
      const queryAnalysis = dynamicRetrievalService.analyzeQuery(query);
      const retrievalQuery = expandedQuery || query;
      
      const hybridResults = await retrievalService.hybridSearch(retrievalQuery, specialty, topK || 10);
      const threshold = retrievalService.embeddingService.embeddingSource === 'mock' ? 0.0 : 0.25;
      const relevant = hybridResults.filter((match: any) => (match.score ?? 0) >= threshold);
      const MIN_DOCS = 1;
      const hasContext = relevant.length >= MIN_DOCS;

      const rejectedMatches = hybridResults
        .filter((match: any) => (match.score ?? 0) < threshold)
        .map((match: any) => ({
          ...buildMatchDebug(match),
          reason: `score ${match.score?.toFixed(6) ?? 0} below threshold ${threshold}`,
        }));

      retrievalResult = {
        hasContext,
        context: hasContext ? relevant : [],
        hybridWeights: { dense: queryAnalysis.denseWeight, keyword: queryAnalysis.keywordWeight },
        resolvedAcronyms: queryAnalysis.detectedAcronyms,
      };

      console.log('================================');
      console.log('Original Query');
      console.log('================================');
      console.log(query);
      console.log('================================');
      console.log('Normalized Query:', normalizedQuery);
      console.log('Medical Domain Result:', medicalIntent);
      console.log('Matched Synonym:', synonymExpansion.matchedSynonym);
      console.log('Expanded Query:', expandedQuery);
      console.log('Synonyms:', synonymExpansion.synonyms);
      console.log('Generated Embedding Dimensions:', embedding?.length);
      console.log('Embedding Provider:', retrievalService.embeddingService.embeddingSource);
      console.log('Pinecone Query Vector Size:', embedding?.length);
      console.log('Top 10 Pinecone Matches:', hybridResults.length);
      for (const match of hybridResults.slice(0, 10)) {
        console.log('--------------------------------');
        console.log('Document ID:', match.metadata?.documentId || 'N/A');
        console.log('Document Title:', match.metadata?.title || match.metadata?.source || 'Unknown');
        console.log('Chunk ID:', match.metadata?.chunkId || match.id);
        console.log('Similarity Score:', (match.score || 0).toFixed(6));
        console.log('Metadata:', JSON.stringify(match.metadata));
      }
      console.log('================================');
      console.log('Filtering');
      console.log('================================');
      console.log('MIN_DOCS:', MIN_DOCS);
      console.log('Score Threshold:', threshold);
      console.log('Documents Before Filtering:', hybridResults.length);
      console.log('Documents After Filtering:', relevant.length);
      for (const match of rejectedMatches) {
        console.log('Rejected:', match.id, 'score:', match.score.toFixed(6), 'reason:', match.reason);
      }
      console.log('================================\n');

      const rerankerScores = relevant.map((m: any) => m.score || 0);

      debugInfo = {
        query,
        normalizedQuery,
        expandedQuery,
        matchedSynonym: synonymExpansion.matchedSynonym,
        synonyms: synonymExpansion.synonyms,
        resolvedAcronyms: queryAnalysis.detectedAcronyms,
        dynamicWeights: { dense: queryAnalysis.denseWeight, keyword: queryAnalysis.keywordWeight },
        medicalDomain: medicalIntent,
        embeddingProvider: retrievalService.embeddingService.embeddingSource,
        embeddingDimensions: embedding?.length || 0,
        pineconeMatches: hybridResults.map((m: any) => buildMatchDebug(m)),
        filteredMatches: relevant.map((m: any) => buildMatchDebug(m)),
        rejectedMatches,
        finalContext: [],
        topScore: relevant[0]?.score ?? null,
        retrievedCount: relevant.length,
        minScore: threshold,
        minDocs: MIN_DOCS,
        promptSize: 0,
        completionTime: 0,
        chunksSentToGroq: 0,
        charactersSent: 0,
        chunkIds: [],
        rerankerScores,
      };
    logRagDebug(debugInfo);

      logger.info({
        question: query,
        retrievedCount: retrievalResult.context.length,
        topScore: retrievalResult.context[0]?.score,
      });

      console.log('[AI] Retrieved docs:', retrievalResult.context.length);
      console.log('[AI] Top docs:', retrievalResult.context.slice(0, 3).map((d: any) => ({
        id: d.id,
        score: d.score,
        title: d.metadata?.title || d.metadata?.source || 'Unknown',
      })));

      if (!retrievalResult.hasContext) {
        const noResultResponse = await prisma.aIResponse.upsert({
          where: { questionId },
          create: {
            questionId,
            summary: 'I could not find supporting medical information in the knowledge base.',
            detailedExplanation: JSON.stringify(createEmptyStructuredResponse('I could not find supporting medical information in the knowledge base.')),
            keyFindings: [],
            confidenceScore: 0,
            generatedBy: 'No Context',
            validationStatus: 'APPROVED',
          },
          update: {
            questionId,
            summary: 'I could not find supporting medical information in the knowledge base.',
            detailedExplanation: JSON.stringify(createEmptyStructuredResponse('I could not find supporting medical information in the knowledge base.')),
            keyFindings: [],
            confidenceScore: 0,
            generatedBy: 'No Context',
            validationStatus: 'APPROVED',
          },
        });

        const totalMs = Date.now() - totalStart;
        await redis.setex(`question-progress:${questionId}`, 300, JSON.stringify({
          questionId,
          progress: 100,
          keyFindings: [],
        }));

        logger.warn(`AI generation skipped - no relevant context for question: ${questionId}`);
        console.log('[AI] No context found for query:', query);

        const metadata: MetadataResponse = {
          answer: 'I could not find supporting medical information in the knowledge base.',
          source: 'Knowledge Base Unavailable',
          documentsUsed: 0,
          model: 'none',
          embeddingModel: 'Xenova/all-MiniLM-L6-v2',
          processingTime: totalMs,
        };

        return { success: true, responseId: noResultResponse.id, metadata };
      }
    } catch (pineconeError: any) {
      logger.error('[ERROR] Pinecone retrieval failed:', pineconeError);
      return createPipelineError('retrieval', 'No supporting medical documents found');
    }

    const chunks = retrievalResult!.context.map((match: any) => ({
      text: match.metadata?.textPreview || match.metadata?.text || '',
      metadata: match.metadata,
    }));
    const context = retrievalService.buildContext(retrievalResult!.context);

    console.log('================================');
    console.log('Retrieved Context');
    console.log('================================');
    console.log('Question:', query);
    console.log('Retrieved chunk count:', chunks.length);
    console.log('Total context characters:', context.length);
    console.log('First 500 characters of context:');
    console.log(context.substring(0, 500));
    console.log('Document titles:', chunks.map((c: any) => c.metadata?.title || c.metadata?.source || 'Unknown').join(', '));
    console.log('Chunk IDs:', chunks.map((c: any) => c.metadata?.chunkId || c.metadata?.id || 'unknown').join(', '));
    console.log('================================\n');

    console.log('[GROQ] Context length:', context.length);
    console.log('[GROQ] Chunks used:', chunks.length);

    const groqStart = Date.now();
    const groq = CONFIG.GROQ_API_KEY ? new Groq({ apiKey: CONFIG.GROQ_API_KEY }) : null;

    if (!groq) {
      logger.error('[ERROR] Groq API unavailable');
      return createPipelineError('llm', 'AI generation unavailable');
    }

    let structuredResponse: any = null;
    let groqMs = 0;

    try {
      const systemPrompt = `You are a medical retrieval assistant for NileoPedia, a premium evidence-based medical decision support platform.

Rules:
- Use ONLY information provided in CONTEXT.
- Never use your own knowledge.
- Never invent facts.
- If context is insufficient, reply exactly: "I could not find supporting medical information in the knowledge base."
- Always return valid JSON matching the requested schema.
- Keep explanations concise. Maximum 4 lines per paragraph.
- Use bullet points, tables, and highlight boxes instead of long paragraphs.
- Never output "Unknown" for metadata fields. If a field is not available in the context, omit it from the reference object.
- Every clinical statement should be supported by a citation from the references array.

CONTEXT:
${context}`;

      const userPrompt = `QUESTION:
${query}

Return your response as valid JSON with exactly this structure:
{
  "clinicalSummary": "2-4 sentence executive summary with bullet points if helpful",
  "definition": "Clear medical definition",
  "clinicalOverview": "Brief clinical overview paragraph",
  "causes": ["Cause 1", "Cause 2"],
  "riskFactors": ["Risk factor 1", "Risk factor 2"],
  "symptoms": ["Symptom 1", "Symptom 2"],
  "diagnosis": ["Diagnosis method 1", "Diagnosis method 2"],
  "treatment": {
    "lifestyle": ["Lifestyle change 1", "Lifestyle change 2"],
    "medications": [
      {
        "name": "Medication name",
        "class": "Drug class",
        "use": "Typical use case"
      }
    ]
  },
  "lifestyleManagement": ["Management strategy 1", "Management strategy 2"],
  "complications": ["Complication 1", "Complication 2"],
  "prevention": ["Prevention strategy 1", "Prevention strategy 2"],
  "specialPopulations": ["Population 1", "Population 2"],
  "prognosis": "Brief prognosis statement",
  "patientEducation": ["Education point 1", "Education point 2"],
  "keyTakeaways": ["Key point 1", "Key point 2", "Key point 3"],
  "warningBoxes": [
    {
      "type": "emergency" | "drug_interaction" | "contraindication" | "general",
      "title": "Warning title",
      "content": "Warning content"
    }
  ],
  "tables": [
    {
      "title": "Table title",
      "headers": ["Column 1", "Column 2"],
      "rows": [
        ["Row 1 Col 1", "Row 1 Col 2"],
        ["Row 2 Col 1", "Row 2 Col 2"]
      ]
    }
  ],
  "references": [
    {
      "title": "Reference title",
      "authors": "Author names",
      "journal": "Journal name",
      "organization": "Organization name",
      "year": 2023,
      "doi": "10.1000/ref.0",
      "url": "https://example.com",
      "publisher": "Publisher name",
      "documentType": "Clinical Guideline",
      "medicalSpecialty": "Cardiology",
      "volume": "12",
      "issue": "3",
      "pages": "45-52",
      "isbn": "978-0-123456-47-2",
      "pmid": "12345678",
      "pmcid": "PMC123456"
    }
  ],
  "followUpQuestions": [
    "Follow-up question 1",
    "Follow-up question 2",
    "Follow-up question 3",
    "Follow-up question 4"
  ],
  "patientFriendlyVersion": "Simple language explanation for patients"
}

If no relevant information is available in the context, use clinicalSummary: "I could not find supporting medical information in the knowledge base." and empty arrays/objects for all other fields.`;

      console.log('[GROQ] Sending request to model:', CONFIG.GROQ_MODEL);

      console.log('================================');
      console.log('Groq Request');
      console.log('================================');
      console.log('Model:', CONFIG.GROQ_MODEL);
      console.log('Temperature:', 0.1);
      console.log('Max tokens:', 4096);
      console.log('Context length:', context.length);
      console.log('System prompt length:', systemPrompt.length);
      console.log('User prompt length:', userPrompt.length);
      console.log('System prompt preview:', systemPrompt.substring(0, 500));
      console.log('User prompt preview:', userPrompt.substring(0, 500));
      console.log('================================\n');

      const groqPromise = groq.chat.completions.create({
        model: CONFIG.GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      });
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Groq timeout after 30000ms')), 30000);
      });

      const completion = await Promise.race([groqPromise, timeoutPromise]) as any;
      groqMs = Date.now() - groqStart;
      console.log('[GROQ] Response received in', groqMs, 'ms');

      const rawContent = completion.choices[0]?.message?.content || '{}';
      const finishReason = completion.choices[0]?.finish_reason;
      const tokenUsage = completion.usage;

      console.log('================================');
      console.log('Groq Raw Response');
      console.log('================================');
      console.log('Raw response:', rawContent);
      console.log('Finish reason:', finishReason);
      console.log('Token usage:', JSON.stringify(tokenUsage));
      console.log('================================\n');

      console.log('[GROQ] Raw response length:', rawContent.length);
      console.log('[GROQ] Raw response preview:', rawContent.substring(0, 200));

      structuredResponse = null;
      try {
        const cleaned = rawContent.replace(/^```(?:json)?\n?|```$/g, '').trim();
        const jsonCleaned = cleaned.replace(/"(\\.|[^"\\])*"/g, (match: string) => match.replace(/\n/g, '\\n').replace(/\r/g, '\\r'));
        structuredResponse = JSON.parse(jsonCleaned);
        console.log('[GROQ] Parsed structured response successfully');
      } catch (parseError: any) {
        console.log('================================');
        console.log('JSON Parsing Failed');
        console.log('================================');
        console.log('Parse error:', parseError.message);
        console.log('Raw response:', rawContent);
        console.log('Expected schema: structured medical response with clinicalSummary, definition, etc.');
        console.log('================================\n');
        
        const noContext = rawContent.toLowerCase().includes('i could not find supporting medical information');
        if (noContext) {
          structuredResponse = {
            clinicalSummary: 'I could not find supporting medical information in the knowledge base.',
            definition: '',
            causes: [],
            symptoms: [],
            diagnosis: [],
            treatment: { lifestyle: [], medications: [] },
            complications: [],
            prevention: [],
            specialPopulations: [],
            keyTakeaways: [],
            references: [],
          };
        } else {
          logger.warn('Failed to parse structured JSON from LLM, using fallback');
          structuredResponse = {
            ...createEmptyStructuredResponse(rawContent.substring(0, 500)),
            clinicalSummary: rawContent.substring(0, 500),
          };
        }
      }
    } catch (groqError: any) {
      groqMs = Date.now() - groqStart;
      logger.error('[ERROR] Groq response generation failed:', groqError);
      return createPipelineError('llm', 'AI generation unavailable');
    }

    const citations: CitationData[] = [];
    const seenTitles = new Set<string>();

    if (structuredResponse.references && Array.isArray(structuredResponse.references)) {
      for (const ref of structuredResponse.references) {
        const title = ref.title || 'Unknown Source';
        if (seenTitles.has(title)) continue;
        seenTitles.add(title);

        citations.push({
          title,
          source: ref.journal || ref.title || 'Medical Database',
          authors: ref.authors,
          journal: ref.journal,
          publisher: ref.publisher,
          publicationYear: ref.year,
          volume: ref.volume,
          issue: ref.issue,
          pages: ref.pages,
          doi: ref.doi,
          isbn: ref.isbn,
          pmid: ref.pmid,
          pmcid: ref.pmcid,
          url: ref.url,
        });
      }
    }

    for (const chunk of chunks) {
      const metadata = chunk.metadata || {};
      if (citations.length >= 5) break;
      const title = metadata.title || metadata.source || 'Unknown Source';
      if (seenTitles.has(title)) continue;
      seenTitles.add(title);

      citations.push({
        title,
        source: metadata.source || 'Medical Database',
        authors: metadata.authors,
        journal: metadata.journal,
        publisher: metadata.publisher,
        publicationYear: metadata.publicationYear,
        volume: metadata.volume,
        issue: metadata.issue,
        pages: metadata.pages,
        doi: metadata.doi,
        isbn: metadata.isbn,
        pmid: metadata.pmid,
        pmcid: metadata.pmcid,
        institution: metadata.institution,
        country: metadata.country,
        publicationType: metadata.publicationType,
        keywords: metadata.keywords,
        medicalSpecialty: metadata.medicalSpecialty,
        language: metadata.language,
        url: metadata.sourceURL || metadata.url,
        pageNumber: metadata.pageNumber,
        sectionTitle: metadata.sectionTitle,
        documentType: metadata.documentType,
        specialty: metadata.specialty,
      });
    }

    const citationQualityResults = citations.map((c) => citationQualityService.evaluate(c.source, c.documentType, c.authors ? [c.authors] : undefined));
    const avgCitationQuality = citationQualityResults.length > 0
      ? citationQualityResults.reduce((sum, r) => sum + r.qualityScore, 0) / citationQualityResults.length
      : 0;

    const rerankerScores = retrievalResult!.context.map((m: any) => m.score || 0);
    const confidenceResult = confidenceEngine.calculate({
      topSimilarity: retrievalResult!.context[0]?.score || 0,
      retrievedCount: retrievalResult!.context.length,
      rerankerScores,
      citationQualityScores: citationQualityResults.map((r) => r.qualityScore),
      metadataCompleteness: retrievalService.getRetrievalStats(retrievalResult!.context).metadataCompleteness,
      sourceDiversity: new Set(citations.map((c) => c.source)).size / Math.max(citations.length, 1),
    });

    const explainabilityInfo = {
      queryAnalysis: dynamicRetrievalService.analyzeQuery(query),
      resolvedAcronyms: retrievalResult!.resolvedAcronyms,
      dynamicWeights: retrievalResult!.hybridWeights,
      evidenceStrength: confidenceResult.evidenceStrength,
      retrievalQuality: confidenceResult.retrievalQuality,
      confidenceBreakdown: confidenceResult.breakdown,
    };

    const hasResultsForGap = retrievalResult!.context.length > 0;
    try {
      knowledgeGapDetectionService.recordSearch(query, hasResultsForGap);
    } catch (gapError) {
      logger.warn('Knowledge gap recording failed:', gapError);
    }

    const finalCitations = citations.slice(0, 5);
    const confidenceScore = confidenceResult.confidenceScore / 100;
    const generatedBy = 'Llama-3.3-70b';

    const summary = structuredResponse.clinicalSummary || structuredResponse.summary || '';
    const keyFindings = (structuredResponse.keyTakeaways || []).map((rec: string) => `✓ ${rec}`);

    console.log('================================');
    console.log('Database Save');
    console.log('================================');
    console.log('clinicalSummary:', structuredResponse.clinicalSummary);
    console.log('definition:', structuredResponse.definition);
    console.log('clinicalOverview:', structuredResponse.clinicalOverview);
    console.log('treatment:', JSON.stringify(structuredResponse.treatment));
    console.log('references count:', structuredResponse.references?.length || 0);
    console.log('citations count:', finalCitations.length);
    console.log('confidenceScore:', confidenceScore);
    console.log('evidenceStrength:', confidenceResult.evidenceStrength);
    console.log('retrievalQuality:', confidenceResult.retrievalQuality);
    console.log('================================\n');

    const aiResponse = await prisma.aIResponse.upsert({
      where: { questionId },
      create: {
        questionId,
        summary,
        detailedExplanation: JSON.stringify(structuredResponse),
        keyFindings,
        confidenceScore,
        generatedBy,
        validationStatus: 'APPROVED',
        documentsUsed: retrievalResult.context.length,
      },
      update: {
        questionId,
        summary,
        detailedExplanation: JSON.stringify(structuredResponse),
        keyFindings,
        confidenceScore,
        generatedBy,
        validationStatus: 'APPROVED',
        documentsUsed: retrievalResult.context.length,
      },
    });

    const savedRecord = await prisma.aIResponse.findUnique({
      where: { id: aiResponse.id },
      select: {
        id: true,
        summary: true,
        detailedExplanation: true,
        validationStatus: true,
        documentsUsed: true,
        generatedBy: true,
        confidenceScore: true,
      },
    });

    console.log('================================');
    console.log('Database Verification');
    console.log('================================');
    console.log('Saved record ID:', savedRecord?.id);
    console.log('clinicalSummary:', savedRecord?.summary);
    console.log('structuredResponse:', savedRecord?.detailedExplanation);
    console.log('================================\n');

    for (let i = 0; i < finalCitations.length; i++) {
      const citation = finalCitations[i];
      await prisma.citation.create({
        data: {
          aiResponseId: aiResponse.id,
          title: citation.title || `Reference ${i + 1}`,
          source: citation.source || 'Medical Database',
          authors: typeof citation.authors === 'string' ? citation.authors : 'Unknown',
          journal: citation.journal,
          publisher: citation.publisher,
          publicationYear: citation.publicationYear || new Date().getFullYear(),
          volume: citation.volume,
          issue: citation.issue,
          pages: citation.pages,
          doi: citation.doi || `10.1000/ref.${i}`,
          isbn: citation.isbn,
          pmid: citation.pmid,
          pmcid: citation.pmcid,
          institution: citation.institution,
          country: citation.country,
          publicationType: citation.publicationType,
          keywords: citation.keywords,
          medicalSpecialty: citation.medicalSpecialty,
          language: citation.language,
          url: citation.url,
          citationIndex: i,
          documentType: citation.documentType,
          specialty: citation.specialty,
          pageNumber: citation.pageNumber,
          sectionTitle: citation.sectionTitle,
        },
      });
    }

    const totalMs = Date.now() - totalStart;

    await redis.setex(`question-progress:${questionId}`, 300, JSON.stringify({
      questionId,
      progress: 100,
      keyFindings,
    }));

    logger.info(`AI generation completed for question: ${questionId}`);

    const metadata: MetadataResponse = {
      answer: summary,
      source: 'real',
      documentsUsed: chunks.length,
      model: generatedBy,
      embeddingModel: 'Xenova/all-MiniLM-L6-v2',
      processingTime: totalMs,
    };

    return { success: true, responseId: aiResponse.id, metadata };
  } catch (error: any) {
    logger.error('[ERROR] AI generation failed:', error);
    return createPipelineError('database', 'Database operation failed');
  }
}
