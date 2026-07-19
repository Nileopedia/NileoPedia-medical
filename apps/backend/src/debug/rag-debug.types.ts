export interface RagDebugInfo {
  query: string;
  normalizedQuery: string;
  medicalDomain: boolean;
  embeddingProvider: string;
  embeddingDimensions: number;
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
}
