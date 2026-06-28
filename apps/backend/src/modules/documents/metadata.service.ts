import prisma from '../../config/prisma';
import { logger } from '../../config/logger';

export interface ExtractedMetadata {
  title?: string;
  authors: string[];
  journal?: string;
  publisher?: string;
  publicationYear?: number;
  doi?: string;
  sourceURL?: string;
  documentType?: string;
}

export class DocumentMetadataService {
  async extractMetadata(params: {
    rawText: string;
    fileName: string;
    fileType: string;
    sourceURL?: string;
    doctype?: string;
  }): Promise<ExtractedMetadata> {
    const { rawText, fileName, fileType } = params;

    const lowerFileType = fileType.toLowerCase();
    const lowerFileName = fileName.toLowerCase();

    if (lowerFileName.endsWith('.pdf') || lowerFileType.includes('pdf')) {
      return this.extractFromPDF(rawText);
    }

    if (lowerFileName.endsWith('.html') || lowerFileName.endsWith('.htm') || lowerFileType.includes('html')) {
      return this.extractFromHTML(rawText);
    }

    if (lowerFileName.endsWith('.xml') || lowerFileType.includes('xml') || rawText.includes('<PubmedArticle>')) {
      return this.extractFromPubMed(rawText);
    }

    if (lowerFileType.includes('word') || lowerFileName.endsWith('.docx')) {
      return this.extractFromDocx(rawText);
    }

    logger.warn(`Unknown document type for metadata extraction: ${fileType}`);
    return { authors: [] };
  }

  private extractFromPDF(rawText: string): ExtractedMetadata {
    const result: ExtractedMetadata = {
      authors: [],
    };

    const firstLines = rawText.split('\n').slice(0, 40).join('\n');

    const doiPattern = /10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/gi;
    const doiMatches = firstLines.match(doiPattern);
    result.doi = doiMatches?.[0];

    const titlePatterns = [
      /(?:^|\n)([A-Z][A-Za-z\s:-]+(?:\n[A-Z][A-Za-z\s:-]+){0,3})(?:\n|\r)/,
      /Title[:\s]+([^\n]+)/i,
      /([A-Z][A-Za-z\s-]+(?:Study|Trial|Review|Guideline|Analysis|Assessment|Evaluation)[^\n]{0,50})/i,
    ];

    for (const pattern of titlePatterns) {
      const match = firstLines.match(pattern);
      if (match && match[1].trim().length > 5) {
        result.title = match[1].trim();
        break;
      }
    }

    const authorPatterns = [
      /(?:^|\n)([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+)+(?:,[ \t]*[A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+)*)*(?:[ \t]*et[ \t]*al\.?)?)(?:\n|\r)/,
      /Authors?[:\s]+([^\n]+)/i,
      /(?:by|By)\s+([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+)+)/i,
    ];

    for (const pattern of authorPatterns) {
      const match = firstLines.match(pattern);
      if (match && match[1]) {
        const authorStr = match[1].trim();
        const authors = authorStr
          .replace(/\s*et al\.?$/i, '')
          .split(/\s*,\s*/)
          .map(a => a.trim())
          .filter(a => a.length > 1 && a.length < 50);
        if (authors.length > 0) {
          result.authors = authors;
          break;
        }
      }
    }

    const journalPatterns = [
      /(?:^|\n)(Journal of [A-Za-z\s]+)/,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s+(?:Journal|Review|Annals|Proceedings)/,
      /Published in[:\s]+([^\n]+)/i,
    ];

    for (const pattern of journalPatterns) {
      const match = firstLines.match(pattern);
      if (match) {
        result.journal = match[1].trim();
        break;
      }
    }

    const yearPattern = /(?:^|\n|\s)(\d{4})(?:\s*[).]|\s|$)/;
    const yearMatch = firstLines.match(yearPattern);
    if (yearMatch) {
      const year = parseInt(yearMatch[1], 10);
      if (year >= 1990 && year <= new Date().getFullYear() + 1) {
        result.publicationYear = year;
      }
    }

    if (!result.publicationYear) {
      const copyrightMatch = rawText.match(/©\s*(\d{4})/);
      if (copyrightMatch) {
        result.publicationYear = parseInt(copyrightMatch[1], 10);
      }
    }

    return result;
  }

  private extractFromHTML(rawText: string): ExtractedMetadata {
    const result: ExtractedMetadata = {
      authors: [],
    };

    const metaTagPattern = /<meta[^>]+name=["'](?:(?:citation_author)|(?:citation_journal_title)|(?:citation_publication_date)|(?:citation_doi)|(?:citation_title))["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
    let match: RegExpExecArray | null;

    while ((match = metaTagPattern.exec(rawText)) !== null) {
      const content = match[1];
      const name = rawText.substring(match.index, match.index + 50);

      if (name.includes('citation_author') && content) {
        result.authors.push(content);
      } else if (name.includes('citation_journal_title')) {
        result.journal = content;
      } else if (name.includes('citation_publication_date')) {
        const yearMatch = content.match(/\d{4}/);
        if (yearMatch) {
          result.publicationYear = parseInt(yearMatch[0], 10);
        }
      } else if (name.includes('citation_doi')) {
        result.doi = content;
      } else if (name.includes('citation_title')) {
        result.title = content;
      }
    }

    if (!result.title) {
      const titleMatch = rawText.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch) {
        result.title = titleMatch[1].trim();
      }
    }

    if (!result.doi) {
      const doiPattern = /10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/gi;
      const doiMatches = rawText.match(doiPattern);
      result.doi = doiMatches?.[0];
    }

    if (result.authors.length === 0) {
      const authorMatches = rawText.match(/<meta[^>]+name=["']citation_author["'][^>]+content=["']([^"']+)["']/gi);
      if (authorMatches) {
        result.authors = authorMatches.map(m => {
          const cMatch = m.match(/content=["']([^"']+)["']/);
          return cMatch ? cMatch[1] : '';
        }).filter(Boolean);
      }
    }

    if (!result.publicationYear) {
      const yearPattern = /<meta[^>]+name=["']citation_publication_date["'][^>]+content=["']([^"']+)["']/i;
      const yearMatch = rawText.match(yearPattern);
      if (yearMatch) {
        const y = yearMatch[1].match(/\d{4}/);
        if (y) result.publicationYear = parseInt(y[0], 10);
      }
    }

    return result;
  }

  private extractFromPubMed(rawText: string): ExtractedMetadata {
    const result: ExtractedMetadata = {
      authors: [],
    };

    const titleMatch = rawText.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/i);
    if (titleMatch) {
      result.title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    const authorTags = rawText.match(/<Author>([\s\S]*?)<\/Author>/gi);
    if (authorTags) {
      result.authors = authorTags.map(tag => {
        const lastName = tag.match(/<LastName>([^<]+)<\/LastName>/i)?.[1] || '';
        const foreName = tag.match(/<ForeName>([^<]+)<\/ForeName>/i)?.[1] || '';
        return `${foreName} ${lastName}`.trim();
      }).filter(Boolean);
    }

    if (result.authors.length === 0) {
      const collectiveMatch = rawText.match(/<CollectiveName>([^<]+)<\/CollectiveName>/i);
      if (collectiveMatch) {
        result.authors = [collectiveMatch[1]];
      }
    }

    const journalMatch = rawText.match(/<Title>([\s\S]*?)<\/Title>/i);
    if (journalMatch) {
      result.journal = journalMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    const yearMatch = rawText.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>[\s\S]*?<\/PubDate>/i);
    if (yearMatch) {
      result.publicationYear = parseInt(yearMatch[1], 10);
    }

    const doiMatch = rawText.match(/<ELocationID[^>]*EIdType=["']doi["'][^>]*>([^<]+)<\/ELocationID>/i);
    if (doiMatch) {
      result.doi = doiMatch[1].trim();
    }

    const publisherMatch = rawText.match(/<PublisherName>([^<]+)<\/PublisherName>/i);
    if (publisherMatch) {
      result.publisher = publisherMatch[1];
    }

    return result;
  }

  private extractFromDocx(rawText: string): ExtractedMetadata {
    const result: ExtractedMetadata = {
      authors: [],
    };

    const titlePatterns = [
      /^(Title\s*:?\s*)(.+)$/im,
      /^([A-Z][A-Za-z\s\-:]{5,})(?:\r?\n){2,}/i,
    ];

    for (const pattern of titlePatterns) {
      const match = rawText.match(pattern);
      if (match && match[2] && match[2].trim().length > 3) {
        result.title = match[2].trim();
        break;
      }
    }

    const authorPattern = /^(?:Authors?\s*:?\s*|by\s+)(.+)$/im;
    const authorMatch = rawText.match(authorPattern);
    if (authorMatch) {
      result.authors = authorMatch[1]
        .split(/\s*[,;]\s*/)
        .map(a => a.trim())
        .filter(a => a.length > 1);
    }

    const doiPattern = /10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/gi;
    const doiMatches = rawText.match(doiPattern);
    result.doi = doiMatches?.[0];

    const yearPattern = /(?:^|\n|\s)(\d{4})(?:\s*[).]|\s|$)/;
    const yearMatch = rawText.match(yearPattern);
    if (yearMatch) {
      const year = parseInt(yearMatch[1], 10);
      if (year >= 1990 && year <= new Date().getFullYear() + 1) {
        result.publicationYear = year;
      }
    }

    return result;
  }

  async saveMetadata(data: {
    documentId: string;
    title?: string;
    authors: string[];
    journal?: string;
    publisher?: string;
    publicationYear?: number;
    doi?: string;
    sourceURL?: string;
    documentType?: string;
  }): Promise<void> {
    await prisma.documentMetadata.upsert({
      where: { documentId: data.documentId },
      create: {
        documentId: data.documentId,
        title: data.title,
        authors: data.authors,
        journal: data.journal,
        publisher: data.publisher,
        publicationYear: data.publicationYear,
        doi: data.doi,
        sourceURL: data.sourceURL,
        documentType: data.documentType,
      },
      update: {
        title: data.title,
        authors: data.authors,
        journal: data.journal,
        publisher: data.publisher,
        publicationYear: data.publicationYear,
        doi: data.doi,
        sourceURL: data.sourceURL,
        documentType: data.documentType,
      },
    });
  }

  async getMetadata(documentId: string) {
    return prisma.documentMetadata.findUnique({
      where: { documentId },
    });
  }

  async getMetadataByDocumentIds(documentIds: string[]) {
    return prisma.documentMetadata.findMany({
      where: {
        documentId: {
          in: documentIds,
        },
      },
    });
  }
}
