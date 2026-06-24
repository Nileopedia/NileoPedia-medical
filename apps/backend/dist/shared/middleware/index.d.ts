import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { validate } from './validation.middleware';
export declare const setupMiddleware: (app: express.Application) => void;
export declare const errorHandler: (err: Error, req: Request, res: Response, next: NextFunction) => void;
export { validate };
//# sourceMappingURL=index.d.ts.map