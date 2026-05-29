import prisma from '../../../config/prisma';
import { PineconeService } from '../../rag/services/pinecone.service';
import { EmbeddingService } from '../../rag/services/embedding.service';
import { AIService } from '../../ai/services/ai.service';

export class QuestionsService {
  private pineconeService: PineconeService;
  private embeddingService: EmbeddingService;
  private aiService: AIService;

  constructor() {
    this.pineconeService = new PineconeService();
    this.embeddingService = new EmbeddingService();
    this.aiService = new AIService();
  }

  async askQuestion(userId: string, questionText: string) {
    const question = await prisma.question.create({
      data: { userId, questionText },
    });

    const retrievedChunks = await this.pineconeService.searchSimilar(
      questionText,
      this.embeddingService,
      10
    );

    const context = retrievedChunks.map((r: any) => r.metadata?.textPreview || '').join('\n\n');

    const aiResponse = await this.aiService.generateResponse(questionText, context);

    const response = await prisma.aIResponse.create({
      data: {
        questionId: question.id,
        summary: aiResponse.summary,
        confidenceScore: aiResponse.confidenceScore,
        generatedBy: 'GPT-4o',
        citations: {
          create: aiResponse.citations?.map((c: any, i: number) => ({
            title: c.title || 'Medical Source',
            source: c.source || 'Unknown',
            authors: c.authors,
            publicationYear: c.year,
            citationIndex: i + 1,
          })) || [],
        },
      },
      include: { citations: true },
    });

    return {
      questionId: question.id,
      response: {
        summary: response.summary,
        status: response.validationStatus,
        confidenceScore: response.confidenceScore,
        citations: response.citations,
        timestamp: response.createdAt,
      },
    };
  }

  async getHistory(userId: string) {
    return prisma.question.findMany({
      where: { userId },
      include: { aiResponse: { include: { citations: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getQuestion(questionId: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { aiResponse: { include: { citations: true } } },
    });

    if (!question) throw new Error('Question not found');
    return question;
  }

  async saveResponse(questionId: string, userId: string) {
    await prisma.question.update({
      where: { id: questionId, userId },
      data: {},
    });
  }

  async unsaveResponse(questionId: string, userId: string) {
    await prisma.question.update({
      where: { id: questionId, userId },
      data: {},
    });
  }
}