import { Request, Response, NextFunction } from 'express';
export declare class CitationController {
    private citationService;
    constructor();
    getCitationsForResponse(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCitationById(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    searchCitations(req: Request, res: Response, next: NextFunction): Promise<void>;
    createCitation(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateCitation(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteCitation(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=citation.controller.d.ts.map