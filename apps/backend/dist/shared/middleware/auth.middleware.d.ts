import { Request, Response, NextFunction } from 'express';
interface JwtPayload {
    id: string;
    email: string;
    role: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export declare const authenticate: {
    (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    optional(req: Request, res: Response, next: NextFunction): Promise<void>;
};
export declare const authorize: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=auth.middleware.d.ts.map