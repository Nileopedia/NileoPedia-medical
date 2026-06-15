export declare function refreshKnowledgeBase(isIncremental?: boolean): Promise<{
    processed: number;
    updated: number;
    total: number;
}>;
export declare function processDocumentIngestion(job: any): Promise<{
    count: number;
} | {
    success: boolean;
}>;
//# sourceMappingURL=document.processor.d.ts.map