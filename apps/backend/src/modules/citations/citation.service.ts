import prisma from '../../config/prisma';
import {
  CreateCitationDto,
  UpdateCitationDto,
  SearchCitationsQuery,
  SearchCitationsResult,
} from './citation.types';

export class CitationService {
  async getCitationsForResponse(aiResponseId: string) {
    return prisma.citation.findMany({
      where: { aiResponseId },
      orderBy: { citationIndex: 'asc' },
    });
  }

  async getCitationById(id: string) {
    return prisma.citation.findUnique({
      where: { id },
    });
  }

  async searchCitations(query: SearchCitationsQuery): Promise<SearchCitationsResult> {
    const {
      page, limit, keyword, specialty, publicationYear, documentType,
    } = query;
    const skip = (page - 1) * limit;

    const where: {
      AND?: Array<{
        OR?: Array<{ title?: { contains: string; mode: 'insensitive' }; source?: { contains: string; mode: 'insensitive' } }>;
        specialty?: string;
        publicationYear?: number;
        documentType?: string;
      }>;
      OR?: Array<{ title?: { contains: string; mode: 'insensitive' }; source?: { contains: string; mode: 'insensitive' } }>;
      specialty?: string;
      publicationYear?: number;
      documentType?: string;
    } = {};

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { source: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    if (specialty) where.specialty = specialty;
    if (publicationYear) where.publicationYear = publicationYear;
    if (documentType) where.documentType = documentType;

    const [citations, total] = await Promise.all([
      prisma.citation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.citation.count({ where }),
    ]);

    return {
      citations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createCitation(data: CreateCitationDto) {
    const citationCount = await prisma.citation.count({
      where: { aiResponseId: data.aiResponseId },
    });

    return prisma.citation.create({
      data: {
        aiResponseId: data.aiResponseId!,
        title: data.title!,
        source: data.source!,
        authors: data.authors,
        publicationYear: data.publicationYear,
        doi: data.doi,
        url: data.url,
        documentType: data.documentType,
        specialty: data.specialty,
        chunkId: data.chunkId,
        pageNumber: data.pageNumber,
        sectionTitle: data.sectionTitle,
        citationIndex: citationCount + 1,
      },
    });
  }

  async updateCitation(id: string, data: UpdateCitationDto) {
    const citation = await prisma.citation.findUnique({ where: { id } });
    if (!citation) {
      throw new Error('Citation not found');
    }

    return prisma.citation.update({
      where: { id },
      data,
    });
  }

  async deleteCitation(id: string) {
    const citation = await prisma.citation.findUnique({ where: { id } });
    if (!citation) {
      throw new Error('Citation not found');
    }

    return prisma.citation.delete({
      where: { id },
    });
  }
}
