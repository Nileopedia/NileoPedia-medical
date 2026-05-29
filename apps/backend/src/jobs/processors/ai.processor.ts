import prisma from '../../config/prisma';
import axios from 'axios';
import { AiGenerationJob } from '../types';
import { logger } from '../../config/logger';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function processAiGeneration(job: AiGenerationJob) {
  const { questionId, query, userId, topK = 10, specialty } = job;

  try {
    const response = await axios.post(`${AI_SERVICE_URL}/generate`, {
      query,
      topK,
      specialty,
    });

    const { summary, citations, confidenceScore } = response.data;

    const aiResponse = await prisma.aIResponse.create({
      data: {
        questionId,
        summary,
        confidenceScore,
        generatedBy: 'GPT-4o',
      },
    });

    for (const citation of citations) {
      await prisma.citation.create({
        data: {
          aiResponseId: aiResponse.id,
          title: citation.title,
          source: citation.source,
          authors: citation.authors,
          publicationYear: citation.publicationYear,
          doi: citation.doi,
          url: citation.url,
          citationIndex: citations.indexOf(citation),
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