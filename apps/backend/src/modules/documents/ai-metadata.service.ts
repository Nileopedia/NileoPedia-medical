import { Groq } from 'groq-sdk';
import { CONFIG } from '../../config/env';
import prisma from '../../config/prisma';
import { logger } from '../../config/logger';

export interface DocumentTaxonomy {
  title?: string;
  abstract?: string;
  disease?: string;
  specialty?: string;
  symptoms: string[];
  diagnosis: string[];
  treatments: string[];
  medications: string[];
  contraindications: string[];
  complications: string[];
  prevention: string[];
  prognosis?: string;
  patientEducation: string[];
  meshTerms: string[];
  keywords: string[];
  icd10: string[];
  snomed: string[];
  publicationYear?: number;
  journal?: string;
  publisher?: string;
  authors: string[];
  doi?: string;
  pmid?: string;
  pmcid?: string;
  isbn?: string;
  language?: string;
  organization?: string;
  sourceURL?: string;
  documentType?: string;
  citationQuality: number;
  metadataCompleteness: number;
}

const EXTRACTION_PROMPT = `You are a medical document analysis expert. Extract structured medical metadata from the provided document text.

Return valid JSON with EXACTLY these fields:
{
  "title": "document title",
  "abstract": "brief summary",
  "disease": "primary disease/condition",
  "specialty": "medical specialty",
  "symptoms": ["symptom1", "symptom2"],
  "diagnosis": ["diagnosis method1", "method2"],
  "treatments": ["treatment1", "treatment2"],
  "medications": ["medication1", "medication2"],
  "contraindications": ["contraindication1"],
  "complications": ["complication1"],
  "prevention": ["prevention strategy1"],
  "prognosis": "prognosis description",
  "patientEducation": ["education point1"],
  "meshTerms": ["MeSH term1"],
  "keywords": ["keyword1"],
  "icd10": ["A00", "B99"],
  "snomed": ["SNOMED code1"],
  "publicationYear": 2024,
  "journal": "journal name",
  "publisher": "publisher name",
  "authors": ["author1"],
  "doi": "10.xxxx/xxxxx",
  "pmid": "PMID number",
  "pmcid": "PMCID number",
  "isbn": "ISBN number",
  "language": "en",
  "organization": "organization name",
  "sourceURL": "source URL",
  "documentType": "article/guideline/review/etc",
  "citationQuality": 8,
  "metadataCompleteness": 85
}

Rules:
- citationQuality: 1-10 scale (higher = more authoritative source)
- metadataCompleteness: 0-100 percentage of fields populated
- Return ONLY valid JSON, no markdown, no explanations
- If a field cannot be determined, use empty array [] or empty string ""
- Be precise with medical terminology
- Extract ICD-10 codes when present (format: A00-Z99 with optional decimal)
- Extract SNOMED codes when present
- Extract MeSH terms from document headings or keywords sections`;

export class AIMetadataExtractionService {
  private groq: Groq;
  private model: string;

  constructor() {
    this.groq = new Groq({ apiKey: CONFIG.GROQ_API_KEY });
    this.model = CONFIG.GROQ_MODEL || 'llama-3.3-70b-versatile';
  }

  async extractMetadata(content: string, fileName: string): Promise<DocumentTaxonomy> {
    const truncatedContent = content.substring(0, 15000);

    const prompt = `${EXTRACTION_PROMPT}

Document filename: ${fileName}

Document content:
${truncatedContent}`;

    try {
      const completion = await this.groq.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a medical document analysis expert. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
      });

      const rawContent = completion.choices[0]?.message?.content || '{}';
      const cleanedContent = rawContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanedContent);
      
      return this.normalizeMetadata(parsed);
    } catch (error) {
      logger.error('AI metadata extraction failed:', error);
      return this.getDefaultMetadata();
    }
  }

  async enrichChunkWithTaxonomy(
    chunkText: string,
    documentTaxonomy: DocumentTaxonomy
  ): Promise<{
    disease: string[];
    symptoms: string[];
    diagnosis: string[];
    treatment: string[];
    medication: string[];
    contraindications: string[];
    complications: string[];
    prevention: string[];
    icd10: string[];
    snomed: string[];
    meshTerms: string[];
    specialty: string;
  }> {
    const prompt = `Analyze this medical text chunk and extract relevant taxonomy codes and terms.

Document taxonomy context:
- Disease: ${documentTaxonomy.disease || 'Unknown'}
- Specialty: ${documentTaxonomy.specialty || 'Unknown'}
- Keywords: ${documentTaxonomy.keywords?.join(', ') || 'None'}

Chunk text:
${chunkText.substring(0, 2000)}

Return valid JSON:
{
  "disease": ["disease terms from chunk"],
  "symptoms": ["symptoms mentioned"],
  "diagnosis": ["diagnostic methods"],
  "treatment": ["treatments mentioned"],
  "medication": ["medications mentioned"],
  "contraindications": ["contraindications"],
  "complications": ["complications"],
  "prevention": ["prevention strategies"],
  "icd10": ["ICD-10 codes"],
  "snomed": ["SNOMED codes"],
  "meshTerms": ["MeSH terms"],
  "specialty": "${documentTaxonomy.specialty || 'general'}"
}`;

    try {
      const completion = await this.groq.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a medical taxonomy expert. Return only valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
      });

      const rawContent = completion.choices[0]?.message?.content || '{}';
      const cleanedContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedContent);

      return {
        disease: Array.isArray(parsed.disease) ? parsed.disease : [],
        symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : [],
        diagnosis: Array.isArray(parsed.diagnosis) ? parsed.diagnosis : [],
        treatment: Array.isArray(parsed.treatment) ? parsed.treatment : [],
        medication: Array.isArray(parsed.medication) ? parsed.medication : [],
        contraindications: Array.isArray(parsed.contraindications) ? parsed.contraindications : [],
        complications: Array.isArray(parsed.complications) ? parsed.complications : [],
        prevention: Array.isArray(parsed.prevention) ? parsed.prevention : [],
        icd10: Array.isArray(parsed.icd10) ? parsed.icd10 : [],
        snomed: Array.isArray(parsed.snomed) ? parsed.snomed : [],
        meshTerms: Array.isArray(parsed.meshTerms) ? parsed.meshTerms : [],
        specialty: parsed.specialty || documentTaxonomy.specialty || 'general',
      };
    } catch (error) {
      logger.error('Chunk taxonomy enrichment failed:', error);
      return {
        disease: [],
        symptoms: [],
        diagnosis: [],
        treatment: [],
        medication: [],
        contraindications: [],
        complications: [],
        prevention: [],
        icd10: [],
        snomed: [],
        meshTerms: [],
        specialty: documentTaxonomy.specialty || 'general',
      };
    }
  }

  private normalizeMetadata(raw: any): DocumentTaxonomy {
    return {
      title: raw.title || '',
      abstract: raw.abstract || '',
      disease: raw.disease || '',
      specialty: raw.specialty || 'general',
      symptoms: Array.isArray(raw.symptoms) ? raw.symptoms : [],
      diagnosis: Array.isArray(raw.diagnosis) ? raw.diagnosis : [],
      treatments: Array.isArray(raw.treatments) ? raw.treatments : [],
      medications: Array.isArray(raw.medications) ? raw.medications : [],
      contraindications: Array.isArray(raw.contraindications) ? raw.contraindications : [],
      complications: Array.isArray(raw.complications) ? raw.complications : [],
      prevention: Array.isArray(raw.prevention) ? raw.prevention : [],
      prognosis: raw.prognosis || '',
      patientEducation: Array.isArray(raw.patientEducation) ? raw.patientEducation : [],
      meshTerms: Array.isArray(raw.meshTerms) ? raw.meshTerms : [],
      keywords: Array.isArray(raw.keywords) ? raw.keywords : [],
      icd10: Array.isArray(raw.icd10) ? raw.icd10 : [],
      snomed: Array.isArray(raw.snomed) ? raw.snomed : [],
      publicationYear: raw.publicationYear ? parseInt(raw.publicationYear, 10) : undefined,
      journal: raw.journal || '',
      publisher: raw.publisher || '',
      authors: Array.isArray(raw.authors) ? raw.authors : [],
      doi: raw.doi || '',
      pmid: raw.pmid || '',
      pmcid: raw.pmcid || '',
      isbn: raw.isbn || '',
      language: raw.language || 'en',
      organization: raw.organization || '',
      sourceURL: raw.sourceURL || '',
      documentType: raw.documentType || '',
      citationQuality: raw.citationQuality ? Math.min(10, Math.max(1, parseInt(raw.citationQuality, 10))) : 5,
      metadataCompleteness: raw.metadataCompleteness ? Math.min(100, Math.max(0, parseInt(raw.metadataCompleteness, 10))) : 50,
    };
  }

  private getDefaultMetadata(): DocumentTaxonomy {
    return {
      symptoms: [],
      diagnosis: [],
      treatments: [],
      medications: [],
      contraindications: [],
      complications: [],
      prevention: [],
      patientEducation: [],
      meshTerms: [],
      keywords: [],
      icd10: [],
      snomed: [],
      authors: [],
      citationQuality: 1,
      metadataCompleteness: 0,
    };
  }
}

export const aiMetadataExtractionService = new AIMetadataExtractionService();
