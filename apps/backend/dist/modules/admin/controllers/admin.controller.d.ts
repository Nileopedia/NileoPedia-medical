import { Request, Response, NextFunction } from 'express';
export declare class AdminController {
    private adminService;
    constructor();
    getUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    suspendUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    activateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    getValidators(req: Request, res: Response, next: NextFunction): Promise<void>;
    addValidator(req: Request, res: Response, next: NextFunction): Promise<void>;
    removeValidator(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
    testEmbeddings(req: Request, res: Response, next: NextFunction): Promise<void>;
    retrievalTest(req: Request, res: Response, next: NextFunction): Promise<void>;
    ragDebug(req: Request, res: Response, next: NextFunction): Promise<void>;
    performanceTest(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSystemStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRecentValidations(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAiActivity(req: Request, res: Response, next: NextFunction): Promise<void>;
    private testEmbeddingAvailability;
    private testPineconeAvailability;
    private getDocumentsCount;
    private getVectorsCount;
    private testRedisAvailability;
    documentDebug(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    queryDebug(req: Request, res: Response, next: NextFunction): Promise<void>;
    aiProcess(req: Request, res: Response, next: NextFunction): Promise<void>;
    seedMockIndex(req: Request, res: Response, next: NextFunction): Promise<void>;
    knowledgeAudit(req: Request, res: Response, next: NextFunction): Promise<void>;
    coverageReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    monitoringDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
    knowledgeGaps(req: Request, res: Response, next: NextFunction): Promise<void>;
    runEvaluation(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=admin.controller.d.ts.map