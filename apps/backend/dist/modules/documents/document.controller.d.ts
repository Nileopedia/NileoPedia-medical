import { Request, Response, NextFunction } from 'express';
export declare class DocumentController {
    private documentService;
    constructor();
    getAllDocuments(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDocumentById(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    uploadDocument(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    updateDocument(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteDocument(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    deleteAllDocuments(req: Request, res: Response, next: NextFunction): Promise<void>;
    verifyDocument(req: Request, res: Response, next: NextFunction): Promise<void>;
    getIngestionStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=document.controller.d.ts.map