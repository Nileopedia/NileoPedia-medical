import { Request, Response, NextFunction } from 'express';
export declare class SearchController {
    private searchService;
    constructor();
    globalSearch(req: Request, res: Response, next: NextFunction): Promise<void>;
    semanticSearch(req: Request, res: Response, next: NextFunction): Promise<void>;
    keywordSearch(req: Request, res: Response, next: NextFunction): Promise<void>;
    hybridSearch(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchDocuments(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchCitations(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=search.controller.d.ts.map