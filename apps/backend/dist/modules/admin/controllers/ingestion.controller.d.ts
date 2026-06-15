import { Request, Response, NextFunction } from 'express';
export declare class IngestionController {
    runManualIngestion(req: Request, res: Response, next: NextFunction): Promise<void>;
    runIncrementalRefresh(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=ingestion.controller.d.ts.map