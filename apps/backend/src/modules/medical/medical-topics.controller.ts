import { NextFunction, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { logger } from '../../config/logger';

export class MedicalTopicsController {
  async getTopics(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q as string | undefined)?.trim();
      const specialty = (req.query.specialty as string | undefined)?.trim();
      const limit = Math.min(Math.max(Number(req.query.limit ?? 24) || 24, 1), 100);

      const documents = await prisma.medicalDocument.findMany({
        include: {
          documentMetadata: true,
        },
      });

      const topicMap = new Map<string, { name: string; category: string; documentCount: number }>();

      for (const document of documents) {
        const metadata = ((document as any).documentMetadata as any) ?? null;
        const topicNames = new Set<string>();

        const normalizedSpecialty = ((document as any).specialty || metadata?.medicalSpecialty || 'General Medicine').trim();

        if (metadata?.disease) topicNames.add(String(metadata.disease).trim());
        if (metadata?.medicalSpecialty) topicNames.add(String(metadata.medicalSpecialty).trim());
        if ((document as any).specialty) topicNames.add(String((document as any).specialty).trim());
        for (const term of metadata?.meshTerms ?? []) {
          if (typeof term === 'string' && term.trim()) topicNames.add(term.trim());
        }
        for (const term of metadata?.keywords ?? []) {
          if (typeof term === 'string' && term.trim()) topicNames.add(term.trim());
        }

        for (const name of topicNames) {
          const lowerName = name.toLowerCase();
          const lowerQuery = query?.toLowerCase() ?? '';
          const matchesQuery = !query || lowerName.includes(lowerQuery) || lowerName.includes(query.toLowerCase());
          const matchesSpecialty = !specialty || normalizedSpecialty.toLowerCase().includes(specialty.toLowerCase());

          if (!matchesQuery || !matchesSpecialty) continue;

          const current = topicMap.get(name) ?? {
            name,
            category: normalizedSpecialty,
            documentCount: 0,
          };

          current.documentCount += 1;
          topicMap.set(name, current);
        }
      }

      const topics = Array.from(topicMap.values())
        .filter((topic) => topic.name.length > 1)
        .sort((a, b) => b.documentCount - a.documentCount || a.name.localeCompare(b.name))
        .slice(0, limit);

      const specialties = Array.from(new Set(
        documents.flatMap((document) => {
          const values: string[] = [];
          const documentSpecialty = (document as any).specialty;
          const metadataSpecialty = (document as any).documentMetadata?.medicalSpecialty;

          if (typeof documentSpecialty === 'string' && documentSpecialty.trim()) {
            values.push(documentSpecialty.trim());
          }
          if (typeof metadataSpecialty === 'string' && metadataSpecialty.trim()) {
            values.push(metadataSpecialty.trim());
          }

          return values;
        })
      )).sort((a, b) => a.localeCompare(b));

      return res.status(200).json({
        success: true,
        data: {
          topics,
          specialties,
        },
      });
    } catch (error) {
      logger.error('Error in MedicalTopicsController.getTopics:', error);
      return next(error);
    }
  }
}
