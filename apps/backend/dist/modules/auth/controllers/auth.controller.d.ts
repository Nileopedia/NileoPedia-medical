import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    private authService;
    constructor();
    register(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    login(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    refreshToken(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    logout(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=auth.controller.d.ts.map