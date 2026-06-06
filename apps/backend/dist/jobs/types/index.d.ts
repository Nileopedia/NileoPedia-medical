export interface DocumentIngestionJob {
    documentId: string;
    fileUrl: string;
    fileType: string;
    fileName: string;
    title: string;
    specialty?: string;
    documentType?: string;
    uploadedById: string;
    source?: string;
    publicationYear?: number;
}
export interface EmbeddingJob {
    documentId: string;
    chunks: Array<{
        id: string;
        text: string;
    }>;
    specialty?: string;
}
export interface AiGenerationJob {
    questionId: string;
    query: string;
    userId: string;
    topK?: number;
    specialty?: string;
}
export interface EmailJob {
    to: string;
    subject: string;
    template?: string;
    data?: Record<string, unknown>;
    html?: string;
}
export interface NotificationJob {
    userId: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'VALIDATION' | 'SYSTEM';
    metadata?: Record<string, unknown>;
}
export interface AuditJob {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
}
export interface CleanupJob {
    type: 'expired_tokens' | 'failed_jobs' | 'temp_files' | 'audit_logs';
}
//# sourceMappingURL=index.d.ts.map