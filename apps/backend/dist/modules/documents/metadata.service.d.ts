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
export declare class DocumentMetadataService {
    extractMetadata(params: {
        rawText: string;
        fileName: string;
        fileType: string;
        sourceURL?: string;
        doctype?: string;
    }): Promise<ExtractedMetadata>;
    private extractFromPDF;
    private extractFromHTML;
    private extractFromPubMed;
    private extractFromDocx;
    saveMetadata(data: {
        documentId: string;
        title?: string;
        authors: string[];
        journal?: string;
        publisher?: string;
        publicationYear?: number;
        doi?: string;
        sourceURL?: string;
        documentType?: string;
    }): Promise<void>;
    getMetadata(documentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        publicationYear: number | null;
        title: string | null;
        documentType: string | null;
        documentId: string;
        authors: string[];
        journal: string | null;
        publisher: string | null;
        doi: string | null;
        sourceURL: string | null;
    } | null>;
    getMetadataByDocumentIds(documentIds: string[]): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        publicationYear: number | null;
        title: string | null;
        documentType: string | null;
        documentId: string;
        authors: string[];
        journal: string | null;
        publisher: string | null;
        doi: string | null;
        sourceURL: string | null;
    }[]>;
}
//# sourceMappingURL=metadata.service.d.ts.map