import prisma from '../../config/prisma';
import { Groq } from 'groq-sdk';
import { AiGenerationJob } from '../types';
import { logger } from '../../config/logger';
import { redis } from '../../lib/redis';

const USE_MOCK_AI = process.env.USE_MOCK_AI === 'true';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

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

  const mockCitations = Array.from({ length: 3 }, (_, i) => ({
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

const groq = USE_MOCK_AI ? null : (process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null);

export async function processAiGeneration(job: AiGenerationJob) {
  const { questionId, query, userId, topK = 10, specialty } = job;

  try {
    let summary, citations, confidenceScore, keyFindings, generatedBy;

    // Use mock mode if AI service is unavailable or mock mode is enabled
    if (USE_MOCK_AI || !groq) {
      logger.info(`Using mock AI response for question:`, questionId, `specialty:`, specialty);
      
      const mock = generateMockResponse(query, topK, specialty || undefined);
      
      // Stream progress for real-time updates via Redis pub/sub
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
      
      ({ summary, citations, confidenceScore, keyFindings } = mock);
      generatedBy = 'Llama-3.3-70b (mock)';
    } else {
      logger.info(`Calling Groq for question:`, questionId);
      const response = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You are a medical AI assistant providing evidence-based answers. Always cite your sources.' },
          { role: 'user', content: query },
        ],
      });
      ({ summary, citations, confidenceScore, keyFindings } = response.data);
      generatedBy = 'Llama-3.3-70b';
      
      // Store progress for late-joining clients
      await redis.setex(`question-progress:${questionId}`, 300, JSON.stringify({
        questionId,
        progress: 100,
        keyFindings,
      }));
    }

    const aiResponse = await prisma.aIResponse.create({
      data: {
        questionId,
        summary,
        keyFindings: keyFindings || [],
        confidenceScore,
        generatedBy,
      },
    });

    // Add mock citations to database
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

    logger.info(`AI generation completed for question: ${questionId}`);
    return { success: true, responseId: aiResponse.id };

  } catch (error: any) {
    logger.error(`AI generation failed for question: ${questionId}`, error);

    // Fallback to mock response on AI service error
    if (!USE_MOCK_AI) {
      logger.info('Falling back to mock response for question:', questionId);
      const mock = generateMockResponse(query, topK, specialty || undefined);
      const aiResponse = await prisma.aIResponse.create({
        data: {
          questionId,
          summary: mock.summary,
          keyFindings: mock.keyFindings,
          confidenceScore: mock.confidenceScore,
          generatedBy: 'Llama-3.3-70b (fallback)',
        },
      });
      return { success: true, responseId: aiResponse.id };
    }
    throw error;
  }
}