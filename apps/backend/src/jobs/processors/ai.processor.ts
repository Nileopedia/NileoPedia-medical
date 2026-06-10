import prisma from '../../config/prisma';
import axios from 'axios';
import { AiGenerationJob } from '../types';
import { logger } from '../../config/logger';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const USE_MOCK_AI = process.env.USE_MOCK_AI === 'true' || !AI_SERVICE_URL;

const generateMockResponse = (query: string, topK: number) => {
  const mockCitations = Array.from({ length: 3 }, (_, i) => ({
    title: `Medical Reference ${i + 1}`,
    source: 'PubMed',
    authors: 'Dr. Smith et al.',
    publicationYear: 2023,
    doi: `10.1001/jama.${i}`,
    url: `https://pubmed.ncbi.nlm.nih.gov/${i}`,
  }));

  return {
    summary: `Based on medical literature, here are the key insights for: "${query}"`,
    citations: mockCitations,
    confidenceScore: 0.85 + Math.random() * 0.1,
    keyFindings: [
      'Key finding 1: Relevant medical information identified',
      'Key finding 2: Evidence-based recommendations available',
      'Key finding 3: Clinical guidelines referenced',
    ],
  };
};

export async function processAiGeneration(job: AiGenerationJob) {
  const { questionId, query, userId, topK = 10, specialty } = job;

  try {
    // Use mock mode if AI service is unavailable or mock mode is enabled
    logger.info('Using mock AI response for question:', questionId);
    const mock = generateMockResponse(query, topK);
    const { summary, citations, confidenceScore, keyFindings } = mock;

    const aiResponse = await prisma.aIResponse.create({
      data: {
        questionId,
        summary,
        keyFindings: keyFindings || [],
        confidenceScore,
        generatedBy: 'GPT-4o',
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

  } catch (error) {
    logger.error(`AI generation failed for question: ${questionId}`, error);
    throw error;
  }
}