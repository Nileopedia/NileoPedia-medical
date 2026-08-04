"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentMetadataService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const logger_1 = require("../../config/logger");
class DocumentMetadataService {
    async extractMetadata(params) {
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
        logger_1.logger.warn(`Unknown document type for metadata extraction: ${fileType}`);
        return { authors: [] };
    }
    extractMedicalTaxonomy(text) {
        const result = {
            symptoms: [],
            diagnosis: [],
            treatment: [],
            medication: [],
            prevention: [],
            meshTerms: [],
        };
        const lowerText = text.toLowerCase();
        const diseasePatterns = [
            /(?:diagnosed with|suffers from|has been diagnosed with)\s+([A-Za-z\s]+?)(?:\s+and\s+|\s+who\s+|\s+,\s+|\s+\.|\s+;)/i,
            /(?:disease|condition|disorder):\s*([A-Za-z\s,]+?)(?:\n|$)/i,
            /^([A-Z][A-Za-z\s]+(?:disease|disorder|syndrome|infection|cancer|diabetes|hypertension|asthma|pneumonia|stroke|malaria|tuberculosis|hiv|aids|hepatitis|arthritis|osteoporosis|anemia|leukemia|lymphoma|myeloma|neuropathy|neurodegeneration))/im,
        ];
        for (const pattern of diseasePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                result.disease = match[1].trim().substring(0, 100);
                break;
            }
        }
        const symptomKeywords = [
            'fever', 'cough', 'fatigue', 'weakness', 'nausea', 'vomiting', 'diarrhea', 'headache',
            'dizziness', 'swelling', 'rash', 'bleeding', 'pain', 'ache', 'sore throat', 'congestion',
            'shortness of breath', 'chest pain', 'palpitations', 'numbness', 'tingling', 'numbness',
            'confusion', 'seizure', 'paralysis', 'tremor', 'stiffness', 'joint pain', 'muscle pain',
            'weight loss', 'weight gain', 'appetite loss', 'insomnia', 'anxiety', 'depression',
        ];
        const symptomPatterns = [
            /(?:symptoms?|signs?|clinical features?|presentation)[:\s]+([^\n]{10,200})/i,
            /(?:may include|includes?|presents with|characterized by)\s+([^\n]{10,200})/i,
        ];
        for (const pattern of symptomPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const symptomsText = match[1];
                const found = symptomKeywords.filter(s => symptomsText.toLowerCase().includes(s));
                if (found.length > 0) {
                    result.symptoms = [...new Set(found)].slice(0, 10);
                }
                break;
            }
        }
        const diagnosisKeywords = [
            'biopsy', 'blood test', 'imaging', 'mri', 'ct scan', 'x-ray', 'ultrasound', 'endoscopy',
            'colonoscopy', 'ecg', 'ekg', 'eeg', ' lumbar puncture', 'culture', 'sensitivity',
            'histopathology', 'cytology', 'serology', 'pcr', 'antigen test', 'antibody test',
            'physical examination', 'family history', 'medical history', 'laboratory test',
        ];
        const diagnosisPatterns = [
            /(?:diagnosis|diagnostic|confirmed by|identified by|detected by)\s+([^\n]{10,200})/i,
            /(?:diagnostic tests?|diagnostic criteria|diagnostic workup)[:\s]+([^\n]{10,200})/i,
        ];
        for (const pattern of diagnosisPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const diagnosisText = match[1];
                const found = diagnosisKeywords.filter(d => diagnosisText.toLowerCase().includes(d));
                if (found.length > 0) {
                    result.diagnosis = [...new Set(found)].slice(0, 10);
                }
                break;
            }
        }
        const treatmentKeywords = [
            'surgery', 'chemotherapy', 'radiation', 'immunotherapy', 'antibiotics', 'antiviral',
            'antifungal', 'antihypertensive', 'insulin', 'metformin', 'bronchodilator', 'corticosteroid',
            'dialysis', 'transplant', 'angioplasty', 'stenting', 'ablation', 'resection', 'biopsy',
            'lifestyle modification', 'diet', 'exercise', 'rehabilitation', 'physical therapy',
            'occupational therapy', 'speech therapy', 'counseling', 'psychotherapy', 'behavioral therapy',
        ];
        const treatmentPatterns = [
            /(?:treatment|management|therapy|intervention|approach)[:\s]+([^\n]{10,200})/i,
            /(?:treated with|managed with|treated by|managed by)\s+([^\n]{10,200})/i,
        ];
        for (const pattern of treatmentPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const treatmentText = match[1];
                const found = treatmentKeywords.filter(t => treatmentText.toLowerCase().includes(t));
                if (found.length > 0) {
                    result.treatment = [...new Set(found)].slice(0, 10);
                }
                break;
            }
        }
        const medicationPatterns = [
            /(?:medications?|drugs?|pharmacological|medicine)[:\s]+([^\n]{10,200})/i,
            /(?:prescribed|administered|given|treated with)\s+([^\n]{10,200})/i,
        ];
        const medicationKeywords = [
            'aspirin', 'ibuprofen', 'acetaminophen', 'paracetamol', 'morphine', 'fentanyl',
            'amoxicillin', 'penicillin', 'ciprofloxacin', 'azithromycin', 'vancomycin',
            'metformin', 'insulin', 'glipizide', 'januvia', 'ozempic', 'trulicity',
            'lisinopril', 'atenolol', 'metoprolol', 'amlodipine', 'hydrochlorothiazide',
            'atorvastatin', 'simvastatin', 'rosuvastatin', 'ezetimibe',
            'omeprazole', 'pantoprazole', 'ranitidine',
            'prednisone', 'dexamethasone', 'hydrocortisone',
            'albuterol', 'salbutamol', 'fluticasone', 'budesonide', 'montelukast',
            'warfarin', 'heparin', 'clopidogrel', 'ticagrelor', 'apixaban', 'rivaroxaban',
        ];
        for (const pattern of medicationPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const medicationText = match[1];
                const found = medicationKeywords.filter(m => medicationText.toLowerCase().includes(m));
                if (found.length > 0) {
                    result.medication = [...new Set(found)].slice(0, 10);
                }
                break;
            }
        }
        const preventionPatterns = [
            /(?:prevention|prevent|reduce risk|lower risk|avoid|avoidance|protection|vaccination|immunization)[:\s]+([^\n]{10,200})/i,
            /(?:recommended|advised|suggested|should)\s+(?:to\s+)?(?:avoid|prevent|reduce|lower)\s+([^\n]{10,200})/i,
        ];
        for (const pattern of preventionPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                result.prevention = [match[1].trim().substring(0, 200)];
                break;
            }
        }
        const icd10Pattern = /[A-Z]\d{2}(?:\.\d{1,4})?/g;
        const icd10Matches = text.match(icd10Pattern);
        if (icd10Matches && icd10Matches.length > 0) {
            result.icd10 = icd10Matches[0];
        }
        const snomedPattern = /SNOMED[:\s]+([^\n]+)/i;
        const snomedMatch = text.match(snomedPattern);
        if (snomedMatch) {
            result.snomed = snomedMatch[1].trim().substring(0, 100);
        }
        const meshPattern = /MeSH[:\s]+([^\n]+)/i;
        const meshMatch = text.match(meshPattern);
        if (meshMatch) {
            result.meshTerms = [meshMatch[1].trim().substring(0, 100)];
        }
        const meshHeadingPattern = /<MeshHeading>([\s\S]*?)<\/MeshHeading>/gi;
        let meshMatchIter;
        while ((meshMatchIter = meshHeadingPattern.exec(text)) !== null) {
            const descriptorName = meshMatchIter[1].match(/<DescriptorName>([^<]+)<\/DescriptorName>/i);
            if (descriptorName && descriptorName[1]) {
                if (!result.meshTerms) {
                    result.meshTerms = [];
                }
                result.meshTerms.push(descriptorName[1].trim());
            }
        }
        return result;
    }
    extractFromPDF(rawText) {
        const result = {
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
                    .map((a) => a.trim())
                    .filter((a) => a.length > 1 && a.length < 50);
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
    extractFromHTML(rawText) {
        const result = {
            authors: [],
        };
        const metaTagPattern = /<meta[^>]+name=["'](?:(?:citation_author)|(?:citation_journal_title)|(?:citation_publication_date)|(?:citation_doi)|(?:citation_title))["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
        let match;
        while ((match = metaTagPattern.exec(rawText)) !== null) {
            const content = match[1];
            const name = rawText.substring(match.index, match.index + 50);
            if (name.includes('citation_author') && content) {
                result.authors.push(content);
            }
            else if (name.includes('citation_journal_title')) {
                result.journal = content;
            }
            else if (name.includes('citation_publication_date')) {
                const yearMatch = content.match(/\d{4}/);
                if (yearMatch) {
                    result.publicationYear = parseInt(yearMatch[0], 10);
                }
            }
            else if (name.includes('citation_doi')) {
                result.doi = content;
            }
            else if (name.includes('citation_title')) {
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
                result.authors = authorMatches.map((m) => {
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
                if (y)
                    result.publicationYear = parseInt(y[0], 10);
            }
        }
        return result;
    }
    extractFromPubMed(rawText) {
        const result = {
            authors: [],
        };
        const titleMatch = rawText.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/i);
        if (titleMatch) {
            result.title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
        }
        const authorTags = rawText.match(/<Author>([\s\S]*?)<\/Author>/gi);
        if (authorTags) {
            result.authors = authorTags.map((tag) => {
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
    extractFromDocx(rawText) {
        const result = {
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
                .map((a) => a.trim())
                .filter((a) => a.length > 1);
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
    async saveMetadata(data) {
        await prisma_1.default.documentMetadata.upsert({
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
                disease: data.disease,
                symptoms: data.symptoms,
                diagnosis: data.diagnosis,
                treatment: data.treatment,
                medication: data.medication,
                prevention: data.prevention,
                icd10: data.icd10,
                snomed: data.snomed,
                meshTerms: data.meshTerms,
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
                disease: data.disease,
                symptoms: data.symptoms,
                diagnosis: data.diagnosis,
                treatment: data.treatment,
                medication: data.medication,
                prevention: data.prevention,
                icd10: data.icd10,
                snomed: data.snomed,
                meshTerms: data.meshTerms,
            },
        });
    }
    async getMetadata(documentId) {
        return prisma_1.default.documentMetadata.findUnique({
            where: { documentId },
        });
    }
    async getMetadataByDocumentIds(documentIds) {
        return prisma_1.default.documentMetadata.findMany({
            where: {
                documentId: {
                    in: documentIds,
                },
            },
        });
    }
}
exports.DocumentMetadataService = DocumentMetadataService;
//# sourceMappingURL=metadata.service.js.map