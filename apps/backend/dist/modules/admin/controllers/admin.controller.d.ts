import { Request, Response, NextFunction } from 'express';
export declare class AdminController {
    private adminService;
    constructor();
    getUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    suspendUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    activateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
    testEmbeddings(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=admin.controller.d.ts.map