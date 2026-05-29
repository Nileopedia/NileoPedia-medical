import { Request, Response, NextFunction } from 'express';
export declare class QuestionsController {
    private questionsService;
    constructor();
    askQuestion(req: Request, res: Response, next: NextFunction): Promise<void>;
    getHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
    getQuestion(req: Request, res: Response, next: NextFunction): Promise<void>;
    saveResponse(req: Request, res: Response, next: NextFunction): Promise<void>;
    unsaveResponse(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=questions.controller.d.ts.map