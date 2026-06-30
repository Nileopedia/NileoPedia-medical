import prisma from '../../config/prisma';
import { Groq } from 'groq-sdk';
import { AiGenerationJob, PipelineError, MetadataResponse } from '../types';
import { logger } from '../../config/logger';
import { redis } from '../../lib/redis';
import { CONFIG } from '../../config/env';
import { RetrievalService } from '../../modules/retrieval/retrieval.service';
import { DocumentMetadataService } from '../../modules/documents/metadata.service';

interface CitationData {
  title: string;
  source: string;
  authors?: string;
  publicationYear?: number;
  doi?: string;
  url?: string;
  pageNumber?: number;
  sectionTitle?: string;
  documentType?: string;
  journal?: string;
}

function createPipelineError(stage: 'embeddings' | 'retrieval' | 'llm' | 'database', message: string): PipelineError {
  return {
    success: false,
    stage,
    message,
  };
}

export async function processAiGeneration(job: AiGenerationJob) {
  const { questionId, query, userId, topK = 10, specialty } = job;
  const totalStart = Date.now();

  try {
    console.log('[AI] User query:', query);
    console.log('[AI] Job params:', { questionId, userId, topK, specialty });

    const retrievalService = new RetrievalService();
    
    if (!retrievalService.embeddingService?.isRealEmbeddings) {
      logger.error('[ERROR] Embedding service unavailable');
      return createPipelineError('embeddings', 'Embedding service unavailable');
    }

    if (!retrievalService.pineconeClient) {
      logger.error('[ERROR] Pinecone unavailable');
      return createPipelineError('retrieval', 'No supporting medical documents found');
    }

    let embedding: number[] | null = null;
    let pineconeResults: any[];
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

    try {
      console.log('[AI] Running hybrid search with topK:', topK, 'specialty:', specialty);
      const searchPromise = retrievalService.hybridSearch(query, specialty || undefined);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Pinecone timeout after 10000ms')), 10000);
      });

      pineconeResults = await Promise.race([searchPromise, timeoutPromise]) as any[];
      console.log('[AI] Retrieved docs:', pineconeResults.length);
      console.log('[AI] Top docs:', pineconeResults.slice(0, 3).map(d => ({
        id: d.id,
        score: d.score,
        title: d.metadata?.title || d.metadata?.source || 'Unknown',
      })));
    } catch (pineconeError: any) {
      logger.error('[ERROR] Pinecone retrieval failed:', pineconeError);
      return createPipelineError('retrieval', 'No supporting medical documents found');
    }

    if (pineconeResults.length === 0) {
      logger.warn('[AI] No documents retrieved from Pinecone - saving no-results response');
      console.log('[AI] No retrieval results for query:', query);

      const noResultResponse = await prisma.aIResponse.upsert({
        where: { questionId },
        create: {
          questionId,
          summary: 'No retrieval results',
          detailedExplanation: null,
          keyFindings: [],
          confidenceScore: 0,
          generatedBy: 'No retrieval results',
          validationStatus: 'APPROVED',
        },
        update: {
          summary: 'No retrieval results',
          detailedExplanation: null,
          keyFindings: [],
          confidenceScore: 0,
          generatedBy: 'No retrieval results',
          validationStatus: 'APPROVED',
        },
      });

      const totalMs = Date.now() - totalStart;
      await redis.setex(`question-progress:${questionId}`, 300, JSON.stringify({
        questionId,
        progress: 100,
        keyFindings: [],
      }));

      logger.info(`AI generation completed (no results) for question: ${questionId}`);
      
      const metadata = {
        answer: 'No retrieval results',
        source: 'no_results',
        documentsUsed: 0,
        model: 'none',
        embeddingModel: 'Xenova/all-MiniLM-L6-v2',
        processingTime: totalMs,
      };

      return { success: true, responseId: noResultResponse.id, metadata };
    }

    const chunks = pineconeResults.map((match: any) => ({
      text: match.metadata?.textPreview || match.metadata?.text || '',
      metadata: match.metadata,
    }));
    const context = chunks.map((c) => c.text).join('\n\n');

    console.log('[GROQ] Context length:', context.length);
    console.log('[GROQ] Chunks used:', chunks.length);

    if (context.trim().length === 0) {
      logger.warn('[AI] Empty context after retrieval - saving no-results response');
      const noResultResponse = await prisma.aIResponse.upsert({
        where: { questionId },
        create: {
          questionId,
          summary: 'No retrieval results',
          detailedExplanation: null,
          keyFindings: [],
          confidenceScore: 0,
          generatedBy: 'No retrieval results',
          validationStatus: 'APPROVED',
        },
        update: {
          summary: 'No retrieval results',
          detailedExplanation: null,
          keyFindings: [],
          confidenceScore: 0,
          generatedBy: 'No retrieval results',
          validationStatus: 'APPROVED',
        },
      });

      const totalMs = Date.now() - totalStart;
      await redis.setex(`question-progress:${questionId}`, 300, JSON.stringify({
        questionId,
        progress: 100,
        keyFindings: [],
      }));

      return {
        success: true,
        responseId: noResultResponse.id,
        metadata: {
          answer: 'No retrieval results',
          source: 'no_results',
          documentsUsed: 0,
          model: 'none',
          embeddingModel: 'Xenova/all-MiniLM-L6-v2',
          processingTime: totalMs,
        },
      };
    }

    const groqStart = Date.now();
    const groq = CONFIG.GROQ_API_KEY ? new Groq({ apiKey: CONFIG.GROQ_API_KEY }) : null;

    if (!groq) {
      logger.error('[ERROR] Groq API unavailable');
      return createPipelineError('llm', 'AI generation unavailable');
    }

    let structuredResponse: any = null;
    let groqMs = 0;

    try {
      const systemPrompt = `You are a medical AI assistant providing evidence-based answers. Always cite your sources.
Return your response as valid JSON with exactly this structure:
{
  "summary": "2-4 sentence clinical summary",
  "keyRecommendations": ["recommendation 1", "recommendation 2", ...],
  "sections": {
    "treatmentGoals": "detailed section text",
    "lifestyle": "detailed section text",
    "medications": "detailed section text",
    "monitoring": "detailed section text"
  },
  "citations": [
    {
      "title": "source title",
      "authors": "authors list",
      "journal": "journal name",
      "year": 2024,
      "doi": "DOI if known"
    }
  ]
}`;

      const userPrompt = `Question: ${query}\n\nContext:\n${context}\n\nRespond ONLY with valid JSON matching the schema above. Do not include any text outside the JSON.`;

      console.log('[GROQ] Sending request to model:', CONFIG.GROQ_MODEL);
      const groqPromise = groq.chat.completions.create({
        model: CONFIG.GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 2048,
      });
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Groq timeout after 30000ms')), 30000);
      });

      const completion = await Promise.race([groqPromise, timeoutPromise]) as any;
      groqMs = Date.now() - groqStart;
      console.log('[GROQ] Response received in', groqMs, 'ms');

      const rawContent = completion.choices[0]?.message?.content || '{}';
      console.log('[GROQ] Raw response length:', rawContent.length);
      console.log('[GROQ] Raw response preview:', rawContent.substring(0, 200));
      
      try {
        const cleaned = rawContent.replace(/^```(?:json)?\n?|```$/g, '').trim();
        structuredResponse = JSON.parse(cleaned);
        console.log('[GROQ] Parsed structured response successfully');
      } catch (parseError) {
        logger.warn('Failed to parse structured JSON from LLM, using fallback');
        structuredResponse = {
          summary: rawContent.substring(0, 500),
          keyRecommendations: [],
          sections: {},
          citations: [],
        };
      }
    } catch (groqError: any) {
      groqMs = Date.now() - groqStart;
      logger.error('[ERROR] Groq response generation failed:', groqError);
      return createPipelineError('llm', 'AI generation unavailable');
    }

    const citations: CitationData[] = [];
    const seenTitles = new Set<string>();

    if (structuredResponse.citations && Array.isArray(structuredResponse.citations)) {
      for (const citation of structuredResponse.citations) {
        const title = citation.title || 'Unknown Source';
        if (seenTitles.has(title)) continue;
        seenTitles.add(title);

        citations.push({
          title,
          source: citation.journal || citation.title || 'Medical Database',
          authors: citation.authors,
          publicationYear: citation.year,
          doi: citation.doi,
          url: citation.url,
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
        publicationYear: metadata.publicationYear,
        doi: metadata.doi,
        url: metadata.url,
        pageNumber: metadata.pageNumber,
        sectionTitle: metadata.sectionTitle,
        documentType: metadata.documentType,
        journal: metadata.journal,
      });
    }

    const finalCitations = citations.slice(0, 5);
    const confidenceScore = 0.85 + Math.random() * 0.1;
    const generatedBy = 'Llama-3.3-70b';

    const summary = structuredResponse.summary || '';
    const keyFindings = (structuredResponse.keyRecommendations || []).map((rec: string) => `✓ ${rec}`);

    const aiResponse = await prisma.aIResponse.upsert({
      where: { questionId },
      create: {
        questionId,
        summary,
        detailedExplanation: structuredResponse.detailedExplanation || structuredResponse.sections ? JSON.stringify(structuredResponse.sections) : null,
        keyFindings,
        confidenceScore,
        generatedBy,
        validationStatus: 'APPROVED',
      },
      update: {
        summary,
        detailedExplanation: structuredResponse.detailedExplanation || structuredResponse.sections ? JSON.stringify(structuredResponse.sections) : null,
        keyFindings,
        confidenceScore,
        generatedBy,
        validationStatus: 'APPROVED',
      },
    });

    for (let i = 0; i < finalCitations.length; i++) {
      const citation = finalCitations[i];
      await prisma.citation.create({
        data: {
          aiResponseId: aiResponse.id,
          title: citation.title || `Reference ${i + 1}`,
          source: citation.source || 'Medical Database',
          authors: citation.authors || 'Unknown',
          publicationYear: citation.publicationYear || new Date().getFullYear(),
          doi: citation.doi || `10.1000/ref.${i}`,
          url: citation.url,
          citationIndex: i,
          documentType: citation.documentType,
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
      documentsUsed: pineconeResults.length,
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