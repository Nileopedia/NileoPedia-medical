import { Request, Response, NextFunction } from 'express';
export declare class AnalyticsController {
    private analyticsService;
    constructor();
    getDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
    getValidationMetrics(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=analytics.controller.d.ts.map