export interface RagDebugInfo {
  query: string;
  normalizedQuery: string;
  expandedQuery?: string;
  matchedSynonym?: string | null;
  synonyms?: string[];
  resolvedAcronyms?: string[];
  hybridWeights?: { dense: number; keyword: number };
  dynamicWeights?: { dense: number; keyword: number };
  medicalDomain: boolean;
  embeddingProvider: string;
  embeddingDimensions: number;
  denseResults?: Array<{
    id: string;
    score: number;
    documentId?: string;
    chunkId?: string;
    chunkIndex?: number;
    title?: string;
    preview: string;
    metadata: Record<string, unknown>;
  }>;
  keywordResults?: Array<{
    id: string;
    score: number;
    documentId?: string;
    chunkId?: string;
    chunkIndex?: number;
    title?: string;
    preview: string;
    metadata: Record<string, unknown>;
  }>;
  mergedResults?: Array<{
    id: string;
    score: number;
    documentId?: string;
    chunkId?: string;
    chunkIndex?: number;
    title?: string;
    preview: string;
    metadata: Record<string, unknown>;
  }>;
  rerankedResults?: Array<{
    id: string;
    score: number;
    documentId?: string;
    chunkId?: string;
    chunkIndex?: number;
    title?: string;
    preview: string;
    metadata: Record<string, unknown>;
    originalScore: number;
  }>;
  pineconeMatches: Array<{
    id: string;
    score: number;
    documentId?: string;
    chunkId?: string;
    chunkIndex?: number;
    title?: string;
    preview: string;
    metadata: Record<string, unknown>;
  }>;
  filteredMatches: Array<{
    id: string;
    score: number;
    documentId?: string;
    chunkId?: string;
    chunkIndex?: number;
    title?: string;
    preview: string;
    metadata: Record<string, unknown>;
  }>;
  rejectedMatches: Array<{
    id: string;
    score: number;
    reason: string;
    documentId?: string;
    chunkId?: string;
    chunkIndex?: number;
    title?: string;
    preview: string;
    metadata: Record<string, unknown>;
  }>;
  finalContext: Array<{
    id: string;
    score: number;
    documentId?: string;
    chunkId?: string;
    chunkIndex?: number;
    title?: string;
    preview: string;
    metadata: Record<string, unknown>;
  }>;
  topScore: number | null;
  retrievedCount: number;
  minScore: number;
  minDocs: number;
  promptSize: number;
  completionTime: number;
  chunksSentToGroq: number;
  charactersSent: number;
  chunkIds: string[];
  rerankerScores?: number[];
  citationQualityScores?: number[];
  confidenceScore?: number;
  evidenceStrength?: string;
  retrievalQuality?: number;
  metadataCompleteness?: number;
  citationQuality?: number;
  chunkValidation?: {
    totalChunks: number;
    validChunks: number;
    rejectedChunks: number;
    rejectionReasons: string[];
  };
}
