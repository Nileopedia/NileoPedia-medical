/**
 * Additional Security Middleware
 *
 * Implements:
 * - Strict rate limiting per endpoint
 * - Input sanitization
 * - File upload validation
 * - Security headers
 * - CORS configuration
 * - Request logging
 */
import { Request, Response, NextFunction } from 'express';
export declare function applySecurityMiddleware(app: any): void;
export declare function validateInput(schema: any): (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=security.middleware.d.ts.map