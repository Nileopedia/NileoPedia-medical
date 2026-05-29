import { Request, Response, NextFunction } from 'express';
export declare class AuditController {
    private auditService;
    constructor();
    getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAuditLogById(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getUserActivityLogs(req: Request, res: Response, next: NextFunction): Promise<void>;
    getValidationActivity(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSecurityEvents(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=audit.controller.d.ts.map