/**
 * Legacy Knowledge Base Migration Script
 *
 * Migrates all existing documents through the enhanced ingestion pipeline:
 * - Deletes old Pinecone vectors and EmbeddingMetadata
 * - Re-extracts text from original uploaded files
 * - Runs enhanced chunking (700-1000 chars, 150 overlap, paragraph/sentence-aware)
 * - Extracts complete metadata and medical taxonomy via AI
 * - Generates SHA256 hashes and removes duplicates
 * - Calculates chunkLength, tokenCount, pageNumber, sectionTitle
 * - Uploads to Pinecone with enhanced metadata schema
 * - Rebuilds BM25 index
 * - Runs knowledge audit
 * - Produces migration report
 *
 * Features:
 * - Idempotent: safe to run multiple times
 * - Resumable: tracks progress in database
 * - Transactional: each document is atomic
 */
export {};
//# sourceMappingURL=migrate-legacy-knowledge-base.d.ts.map