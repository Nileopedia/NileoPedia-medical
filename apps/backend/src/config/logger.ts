import winston from 'winston';
import { CONFIG } from './env';

const { combine, timestamp, label, printf, errors } = winston.format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

export const logger = winston.createLogger({
  level: CONFIG.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    errors({ stack: true }),
    label({ label: 'nileopedia-backend' }),
    timestamp(),
    loggerFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});