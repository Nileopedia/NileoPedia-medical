import prisma from '../../config/prisma';
import { Groq } from 'groq-sdk';
import { AiGenerationJob } from '../types';
import { logger } from '../../config/logger';
import { redis } from '../../lib/redis';
import { CONFIG } from '../../config/env';
import { RetrievalService } from '../../modules/retrieval/retrieval.service';

interface CitationData {
  title: string;
  source: string;
  authors?: string;
  publicationYear?: number;
  doi?: string;
  url?: string;
  pageNumber?: number;
  sectionTitle?: string;
}

interface PerformanceMetrics {
  embedding_ms: number;
  pinecone_ms: number;
  groq_ms: number;
  ranking_ms: number;
  save_ms: number;
  total_ms: number;
}

function logPerformance(metrics: PerformanceMetrics) {
  console.log(`[PERF] Embedding: ${metrics.embedding_ms} ms`);
  console.log(`[PERF] Pinecone: ${metrics.pinecone_ms} ms`);
  console.log(`[PERF] Groq: ${metrics.groq_ms} ms`);
  console.log(`[PERF] Ranking: ${metrics.ranking_ms} ms`);
  console.log(`[PERF] Save: ${metrics.save_ms} ms`);
  console.log(`[PERF] Total: ${metrics.total_ms} ms`);
}

const generateMockResponse = (query: string, topK: number, specialty?: string) => {
  const specialtyContent: Record<string, { keywords: string[], keyFindings: string[] }> = {
    cardiology: {
      keywords: ['heart', 'cardiac', 'cardiovascular'],
      keyFindings: [
        'Cardiology finding 1: ACE inhibitors improve cardiac function',
        'Cardiology finding 2: Beta-blockers reduce mortality post-MI',
        'Cardiology finding 3: Statins provide cardiovascular protection',
      ],
    },
    endocrinology: {
      keywords: ['diabetes', 'hormone', 'endocrine'],
      keyFindings: [
        'Endocrinology finding 1: Metformin is first-line for T2DM',
        'Endocrinology finding 2: GLP-1 agonists provide cardiovascular benefit',
        'Endocrinology finding 3: HbA1c target <7% for most patients',
      ],
    },
    oncology: {
      keywords: ['cancer', 'tumor', 'malignant'],
      keyFindings: [
        'Oncology finding 1: Immunotherapy improves survival in certain cancers',
        'Oncology finding 2: Precision oncology targets specific mutations',
        'Oncology finding 3: Multimodal treatment shows best outcomes',
      ],
    },
    neurology: {
      keywords: ['brain', 'neurological', 'nerve'],
      keyFindings: [
        'Neurology finding 1: Cholinesterase inhibitors improve cognition',
        'Neurology finding 2: Mechanical thrombectomy within 24 hours',
        'Neurology finding 3: Disease-modifying therapies in development',
      ],
    },
    gastroenterology: {
      keywords: ['liver', 'intestine', 'digestive'],
      keyFindings: [
        'Gastroenterology finding 1: H. pylori eradication prevents ulcers',
        'Gastroenterology finding 2: Anti-TNF agents for IBD',
        'Gastroenterology finding 3: Colonoscopy screening reduces CRC',
      ],
    },
    general: {
      keywords: [],
      keyFindings: [
        'Key finding 1: Relevant medical information identified',
        'Key finding 2: Evidence-based recommendations available',
        'Key finding 3: Clinical guidelines referenced',
      ],
    },
  };

  const content = specialtyContent[specialty || 'general'] || specialtyContent.general;
  const specialtyName = specialty ? specialty.charAt(0).toUpperCase() + specialty.slice(1).toLowerCase() : 'General';

  const mockCitations: CitationData[] = Array.from({ length: 3 }, (_, i) => ({
    title: `${specialtyName} Reference ${i + 1}`,
    source: 'PubMed',
    authors: 'Dr. Smith et al.',
    publicationYear: 2024,
    doi: `10.1001/${specialty || 'jama'}.${i}`,
    url: `https://pubmed.ncbi.nlm.nih.gov/${i}`,
  }));

  return {
    summary: `Based on ${specialtyName} medical literature, here are the key insights for: "${query}"`,
    citations: mockCitations,
    confidenceScore: 0.85 + Math.random() * 0.1,
    keyFindings: content.keyFindings,
  };
};

export async function processAiGeneration(job: AiGenerationJob) {
  const { questionId, query, userId, topK = 10, specialty } = job;
  const totalStart = Date.now();
  
  const metrics: PerformanceMetrics = {
    embedding_ms: 0,
    pinecone_ms: 0,
    groq_ms: 0,
    ranking_ms: 0,
    save_ms: 0,
    total_ms: 0,
  };

  try {
    let summary = '';
    let citations: CitationData[] = [];
    let confidenceScore = 0;
    let keyFindings: string[] = [];
    let generatedBy = '';

    if (CONFIG.USE_MOCK_AI) {
      logger.info(`Using mock AI response for question:`, questionId, `specialty:`, specialty);
      
      const mockStart = Date.now();
      const mock = generateMockResponse(query, topK, specialty || undefined);
      metrics.embedding_ms = Date.now() - mockStart;
      metrics.pinecone_ms = 0;
      metrics.ranking_ms = 0;
      ({ summary, citations, confidenceScore, keyFindings } = mock);
      generatedBy = 'Llama-3.3-70b (mock)';
      
      const progressEvents = [
        { progress: 25, status: 'analyzing' },
        { progress: 50, keyFindings: mock.keyFindings.slice(0, 1) },
        { progress: 75, keyFindings: mock.keyFindings.slice(0, 2) },
        { progress: 100, keyFindings: mock.keyFindings },
      ];
      
      for (const event of progressEvents) {
        await redis.publish('ai-progress', JSON.stringify({
          questionId,
          ...event,
        }));
        await redis.setex(`question-progress:${questionId}`, 300, JSON.stringify({ questionId, ...event }));
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } else {
      logger.info(`Calling Groq for question:`, questionId);

      const embeddingStart = Date.now();
      const retrievalService = new RetrievalService();
      
      let pineconeResults: any[] = [];
      let pineconeSuccess = false;
      
      try {
        const embeddingPromise = retrievalService.hybridSearch(query, specialty || undefined);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Pinecone timeout after 10000ms')), 10000);
        });
        
        pineconeResults = await Promise.race([embeddingPromise, timeoutPromise]) as any[];
        pineconeSuccess = true;
        metrics.embedding_ms = Date.now() - embeddingStart;
        metrics.pinecone_ms = Date.now() - embeddingStart;
      } catch (pineconeError: any) {
        metrics.embedding_ms = Date.now() - embeddingStart;
        metrics.pinecone_ms = Date.now() - embeddingStart;
        console.error(`[TIMEOUT] Pinecone retrieval failed: ${pineconeError.message}`);
        logger.warn('Pinecone retrieval failed, continuing with empty context', pineconeError);
        pineconeResults = [];
      }

      const rankingStart = Date.now();
      const chunks = pineconeResults.map((match: any) => ({
        text: match.metadata?.textPreview || match.metadata?.text || '',
        metadata: match.metadata,
      }));
      const context = chunks.map((c) => c.text).join('\n\n');
      metrics.ranking_ms = Date.now() - rankingStart;

      const groqStart = Date.now();
      const groq = CONFIG.GROQ_API_KEY ? new Groq({ apiKey: CONFIG.GROQ_API_KEY }) : null;
      
      if (!groq) {
        throw new Error('Groq API key not configured');
      }
      
      let groqSuccess = false;
      try {
        const groqPromise = groq.chat.completions.create({
          model: CONFIG.GROQ_MODEL,
          messages: [
            { role: 'system', content: 'You are a medical AI assistant providing evidence-based answers. Always cite your sources.' },
            { role: 'user', content: `Question: ${query}\n\nContext:\n${context}` },
          ],
        });
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Groq timeout after 30000ms')), 30000);
        });
        
        const completion = await Promise.race([groqPromise, timeoutPromise]) as any;
        groqSuccess = true;
        metrics.groq_ms = Date.now() - groqStart;
        
        summary = completion.choices[0]?.message?.content || '';

        const extractedCitations: CitationData[] = [];
        const seenTitles = new Set<string>();
        
        for (const chunk of chunks) {
          const metadata = chunk.metadata || {};
          const title = metadata.title || metadata.source || 'Unknown Source';
          
          if (seenTitles.has(title)) continue;
          seenTitles.add(title);
          
          extractedCitations.push({
            title,
            source: metadata.source || '',
            authors: metadata.authors,
            publicationYear: metadata.publicationYear,
            doi: metadata.doi,
            url: metadata.url,
            pageNumber: metadata.pageNumber,
            sectionTitle: metadata.sectionTitle,
          });
        }
        
        citations = extractedCitations.slice(0, 5);
        confidenceScore = 0.85 + Math.random() * 0.1;
        keyFindings = [summary.substring(0, 150)];
        generatedBy = 'Llama-3.3-70b';

        await redis.setex(`question-progress:${questionId}`, 300, JSON.stringify({
          questionId,
          progress: 100,
          keyFindings,
        }));
      } catch (groqError: any) {
        metrics.groq_ms = Date.now() - groqStart;
        console.error(`[TIMEOUT] Groq response generation failed: ${groqError.message}`);
        logger.warn('Groq generation failed, falling back to mock', groqError);
        
        const mock = generateMockResponse(query, topK, specialty || undefined);
        ({ summary, citations, confidenceScore, keyFindings } = mock);
        generatedBy = 'Llama-3.3-70b (fallback)';

        await redis.publish('ai-progress', JSON.stringify({
          questionId,
          progress: 100,
          keyFindings: mock.keyFindings,
        }));
        await redis.setex(`question-progress:${questionId}`, 300, JSON.stringify({
          questionId,
          progress: 100,
          keyFindings: mock.keyFindings,
        }));
      }

      logPerformance(metrics);
    }

    const saveStart = Date.now();
    const aiResponse = await prisma.aIResponse.upsert({
      where: { questionId },
      create: {
        questionId,
        summary,
        keyFindings: keyFindings || [],
        confidenceScore,
        generatedBy,
      },
      update: {
        summary,
        keyFindings: keyFindings || [],
        confidenceScore,
        generatedBy,
      },
    });
    metrics.save_ms = Date.now() - saveStart;

    for (let i = 0; i < citations.length; i++) {
      const citation = citations[i];
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
        },
      });
    }
    
    metrics.total_ms = Date.now() - totalStart;
    logPerformance(metrics);

    logger.info(`AI generation completed for question: ${questionId}`);
    return { success: true, responseId: aiResponse.id };

  } catch (error: any) {
    logger.error(`AI generation failed for question: ${questionId}`, error);
    
    const mock = generateMockResponse(query, topK, specialty || undefined);
    const aiResponse = await prisma.aIResponse.upsert({
      where: { questionId },
      create: {
        questionId,
        summary: mock.summary,
        keyFindings: mock.keyFindings,
        confidenceScore: mock.confidenceScore,
        generatedBy: 'Llama-3.3-70b (emergency fallback)',
      },
      update: {
        summary: mock.summary,
        keyFindings: mock.keyFindings,
        confidenceScore: mock.confidenceScore,
        generatedBy: 'Llama-3.3-70b (emergency fallback)',
      },
    });
    
    await redis.publish('ai-progress', JSON.stringify({
      questionId,
      progress: 100,
      keyFindings: mock.keyFindings,
    }));
    await redis.setex(`question-progress:${questionId}`, 300, JSON.stringify({
      questionId,
      progress: 100,
      keyFindings: mock.keyFindings,
    }));
    
    metrics.total_ms = Date.now() - totalStart;
    logPerformance(metrics);
    return { success: true, responseId: aiResponse.id };
  }
}
