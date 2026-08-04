"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChunkingService = void 0;
const embedding_service_1 = require("./embedding.service");
const MIN_CHUNK_SIZE = 250;
const MAX_CHUNK_SIZE = 1000;
const TARGET_CHUNK_SIZE = 700;
const OVERLAP_SIZE = 150;
function sha256(text) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(text).digest('hex');
}
function cosineSimilarity(a, b) {
    if (a.length !== b.length)
        return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
}
function splitIntoParagraphs(text) {
    return text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
}
function splitIntoSentences(text) {
    return text
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
}
function isTableLike(text) {
    const tableIndicators = ['|', '---', '===', 'TABLE', 'Table '];
    return tableIndicators.some((indicator) => text.includes(indicator));
}
function isFigureCaption(text) {
    return /^(Figure|Fig\.|Figure \d+)[:\s]/i.test(text.trim());
}
function isMedicationDosage(text) {
    return /\d+\s*(mg|mcg|g|ml|mg\/kg|mcg\/kg|units?|IU)/i.test(text);
}
function shouldKeepSmallChunk(text) {
    const trimmed = text.trim();
    if (isTableLike(trimmed))
        return true;
    if (isFigureCaption(trimmed))
        return true;
    if (isMedicationDosage(trimmed))
        return true;
    if (trimmed.length >= MIN_CHUNK_SIZE)
        return true;
    return false;
}
class ChunkingService {
    constructor() {
        this.embeddingService = new embedding_service_1.EmbeddingService();
    }
    chunkDocument(content, options = {}) {
        const paragraphs = splitIntoParagraphs(content);
        const chunks = [];
        let currentChunk = '';
        let chunkIndex = 0;
        const documentId = options.documentId || 'doc';
        const baseMetadata = {
            documentId,
            title: options.title || 'Unknown',
            source: options.source || 'Unknown',
            specialty: options.specialty || 'general',
            documentType: options.documentType || 'Unknown',
            publicationYear: options.publicationYear,
            authors: options.authors || [],
            journal: options.journal,
            publisher: options.publisher,
            doi: options.doi,
            isbn: options.isbn,
            pmid: options.pmid,
            pmcid: options.pmcid,
            institution: options.institution,
            country: options.country,
            keywords: options.keywords || [],
            language: options.language || 'en',
            sourceURL: options.sourceURL,
            pageNumber: options.pageNumber,
        };
        for (const paragraph of paragraphs) {
            const candidate = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;
            if (candidate.length > MAX_CHUNK_SIZE && currentChunk.length >= TARGET_CHUNK_SIZE) {
                if (shouldKeepSmallChunk(currentChunk)) {
                    const chunkId = `${documentId}_chunk_${chunkIndex}`;
                    chunks.push({
                        text: currentChunk.trim(),
                        chunkIndex,
                        chunkId,
                        metadata: {
                            ...baseMetadata,
                            chunkId,
                            chunkIndex,
                            text: currentChunk.trim(),
                        },
                    });
                    chunkIndex++;
                }
                const overlapText = currentChunk.slice(-OVERLAP_SIZE);
                currentChunk = `${overlapText}\n\n${paragraph}`;
            }
            else if (candidate.length <= MAX_CHUNK_SIZE) {
                currentChunk = candidate;
            }
            else {
                if (shouldKeepSmallChunk(currentChunk)) {
                    const chunkId = `${documentId}_chunk_${chunkIndex}`;
                    chunks.push({
                        text: currentChunk.trim(),
                        chunkIndex,
                        chunkId,
                        metadata: {
                            ...baseMetadata,
                            chunkId,
                            chunkIndex,
                            text: currentChunk.trim(),
                        },
                    });
                    chunkIndex++;
                }
                currentChunk = paragraph;
            }
        }
        if (currentChunk.trim() && shouldKeepSmallChunk(currentChunk)) {
            const chunkId = `${documentId}_chunk_${chunkIndex}`;
            chunks.push({
                text: currentChunk.trim(),
                chunkIndex,
                chunkId,
                metadata: {
                    ...baseMetadata,
                    chunkId,
                    chunkIndex,
                    text: currentChunk.trim(),
                },
            });
        }
        return chunks;
    }
    async generateEmbeddings(chunks) {
        const texts = chunks.map((c) => c.text);
        const embeddings = await this.embeddingService.generateBatchEmbeddings(texts);
        return embeddings.map((embedding, i) => ({
            embedding,
            chunk: chunks[i],
        }));
    }
    async deduplicateChunks(chunks, similarityThreshold = 0.97) {
        if (chunks.length <= 1)
            return chunks;
        const seenHashes = new Set();
        const uniqueChunks = [];
        const embeddings = await this.embeddingService.generateBatchEmbeddings(chunks.map((c) => c.text));
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const textHash = sha256(chunk.text);
            if (seenHashes.has(textHash)) {
                continue;
            }
            let isDuplicate = false;
            for (let j = 0; j < uniqueChunks.length; j++) {
                const existingChunk = chunks[chunks.indexOf(uniqueChunks[j])];
                if (existingChunk) {
                    const similarity = cosineSimilarity(embeddings[i], embeddings[chunks.indexOf(existingChunk)]);
                    if (similarity > similarityThreshold) {
                        isDuplicate = true;
                        break;
                    }
                }
            }
            if (!isDuplicate) {
                seenHashes.add(textHash);
                uniqueChunks.push(chunk);
            }
        }
        return uniqueChunks;
    }
}
exports.ChunkingService = ChunkingService;
//# sourceMappingURL=chunking.service.js.map