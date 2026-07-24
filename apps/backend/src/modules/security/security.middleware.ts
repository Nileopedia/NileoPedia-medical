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
import { storage } from '../../config/multer';
import { validate } from './input-validation.service';
import { sanitize } from './input-sanitization.service';
import { CONFIG } from '../../config/env';
import { securityAuditService } from './security-audit.service';

export function applySecurityMiddleware(app: any): void {
  app.use(securityHeaders());
  app.use(requestLogging());
  app.use(inputSanitization());
  app.use(fileUploadValidation());
  app.use(strictRateLimiting());
  app.use(corsConfiguration());
}

function securityHeaders() {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none';");
    next();
  };
}

function requestLogging() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        userId: (req as any).user?.id || 'anonymous',
      }));
    });
    
    next();
  };
}

function inputSanitization() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
      req.body = sanitize(req.body);
    }
    if (req.query) {
      req.query = sanitize(req.query);
    }
    if (req.params) {
      req.params = sanitize(req.params);
    }
    next();
  };
}

function fileUploadValidation() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/html',
        'text/plain',
        'application/xml',
        'text/xml',
        'application/zip',
        'application/octet-stream'
      ];

      const allowedExtensions = ['.pdf', '.docx', '.doc', '.html', '.htm', '.txt', '.xml'];
      const maxFileSize = 50 * 1024 * 1024;

      const fileExtension = req.file.originalname.toLowerCase().substring(req.file.originalname.lastIndexOf('.'));
      
      if (!allowedTypes.includes(req.file.mimetype) && !allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({ 
          success: false, 
          message: `File type not allowed. Allowed types: ${allowedExtensions.join(', ')}` 
        });
      }

      if (req.file.size > maxFileSize) {
        return res.status(400).json({ 
          success: false, 
          message: `File size exceeds maximum of ${maxFileSize / 1024 / 1024}MB` 
        });
      }
    }
    
    next();
  };
}

function strictRateLimiting() {
  const strictLimits = new Map<string, { windowMs: number; max: number }>([
    ['/api/v1/auth/login', { windowMs: 15 * 60 * 1000, max: 5 }],
    ['/api/v1/auth/register', { windowMs: 60 * 60 * 1000, max: 3 }],
    ['/api/v1/auth/forgot-password', { windowMs: 60 * 60 * 1000, max: 3 }],
    ['/api/v1/auth/reset-password', { windowMs: 60 * 60 * 1000, max: 5 }],
    ['/api/v1/admin', { windowMs: 15 * 60 * 1000, max: 100 }],
    ['/api/v1/documents', { windowMs: 15 * 60 * 1000, max: 20 }],
    ['/api/v1/questions', { windowMs: 15 * 60 * 1000, max: 50 }],
    ['/api/v1/search', { windowMs: 15 * 60 * 1000, max: 100 }],
  ]);

  return (req: Request, res: Response, next: NextFunction) => {
    const path = req.path;
    const limit = strictLimits.get(path);
    
    if (limit) {
      const key = `${req.ip}-${path}`;
      const now = Date.now();
      
      if (!(global as any).rateLimitStore) {
        (global as any).rateLimitStore = new Map();
      }
      
      const store = (global as any).rateLimitStore as Map<string, { count: number; resetTime: number }>;
      const record = store.get(key);
      
      if (!record || now > record.resetTime) {
        store.set(key, { count: 1, resetTime: now + limit.windowMs });
      } else {
        record.count++;
        if (record.count > limit.max) {
          return res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil((record.resetTime - now) / 1000),
          });
        }
      }
    }
    
    next();
  };
}

function corsConfiguration() {
  return (req: Request, res: Response, next: NextFunction) => {
    const allowedOrigins = CONFIG.CORS_ORIGIN ? CONFIG.CORS_ORIGIN.split(',') : [];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin!) || !origin) {
      res.header('Access-Control-Allow-Origin', origin || '*');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    
    if (req.method === 'OPTIONS') {
      return res.status(204).send();
    }
    
    next();
  };
}

export function validateInput(schema: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await validate(req.body, schema);
      req.body = validated;
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error instanceof Error ? [error.message] : ['Invalid input'],
      });
    }
  };
}
