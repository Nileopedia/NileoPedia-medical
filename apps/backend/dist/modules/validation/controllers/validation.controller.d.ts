import { Request, Response, NextFunction } from 'express';
export declare class ValidationController {
    private validationService;
    constructor();
    getPending(req: Request, res: Response, next: NextFunction): Promise<void>;
    approve(req: Request, res: Response, next: NextFunction): Promise<void>;
    reject(req: Request, res: Response, next: NextFunction): Promise<void>;
    getHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReview(req: Request, res: Response, next: NextFunction): Promise<void>;
    getApproved(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRejected(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFeedbackReports(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateFeedbackReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=validation.controller.d.ts.map