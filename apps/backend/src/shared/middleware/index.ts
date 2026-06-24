import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { validate } from './validation.middleware';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { CONFIG } from '../../config/env';
import { logger } from '../../config/logger';

export const setupMiddleware = (app: express.Application) => {
  // Security middleware
  app.use(helmet());
  
  // CORS middleware
  app.use(cors({
    origin: CONFIG.CORS_ORIGIN,
    credentials: true,
  }));
  
  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Logging middleware
  app.use(morgan('combined'));
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: CONFIG.RATE_LIMIT_WINDOW_MS,
    max: CONFIG.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
  
  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path} - ${req.ip}`);
    next();
  });
};

// Global error handler middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error handler caught:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
};

// Export validation middleware
export { validate };