export declare class DocumentService {
    private ingestionService;
    constructor();
    getDocuments(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        source: string | null;
        title: string;
        category: string | null;
        content: string;
        uploadedBy: string | null;
        isVerified: boolean;
        version: number;
    }[]>;
    verifyDocument(documentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        source: string | null;
        title: string;
        category: string | null;
        content: string;
        uploadedBy: string | null;
        isVerified: boolean;
        version: number;
    }>;
}
//# sourceMappingURL=document.service.d.ts.map