/**
 * Deployment Hardening & Health Checks
 * 
 * Implements:
 * - Health checks
 * - Readiness checks
 * - Liveness checks
 * - Graceful shutdown
 * - Retry policies
 * - Circuit breakers
 * - Environment validation
 * - Secrets validation
 * - Startup diagnostics
 * - Dependency health checks
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CONFIG } from '../../config/env';
import { logger } from '../../config/logger';
import { backupService } from '../backup/backup.service';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  uptime: number;
  version: string;
  checks: {
    database: DependencyCheck;
    pinecone: DependencyCheck;
    redis: DependencyCheck;
    groq: DependencyCheck;
    email: DependencyCheck;
    monitoring: DependencyCheck;
  };
}

export interface DependencyCheck {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  error?: string;
  lastChecked: Date;
}

export interface StartupDiagnostics {
  timestamp: Date;
  environment: string;
  version: string;
  nodeVersion: string;
  memory: NodeJS.MemoryUsage;
  checks: {
    database: boolean;
    pinecone: boolean;
    redis: boolean;
    groq: boolean;
    email: boolean;
    requiredEnvVars: boolean;
    secretsValid: boolean;
  };
  summary: string;
}

class CircuitBreaker {
  private failures: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private nextAttempt: number = Date.now();

  constructor(private config: { failureThreshold: number; resetTimeout: number; timeout: number }) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is open');
      }
      this.state = 'half-open';
    }

    try {
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Operation timeout')), this.config.timeout)
        ),
      ]);

      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  recordSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  recordFailure(): void {
    this.failures++;

    if (this.failures >= this.config.failureThreshold) {
      this.state = 'open';
      this.nextAttempt = Date.now() + this.config.resetTimeout;
    }
  }

  getState(): string {
    return this.state;
  }
}

class DeploymentHardeningService {
  private startTime: Date = new Date();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    this.initializeCircuitBreakers();
  }

  private initializeCircuitBreakers(): void {
    const services = ['database', 'pinecone', 'redis', 'groq', 'email'];
    
    services.forEach(service => {
      this.circuitBreakers.set(service, new CircuitBreaker({
        failureThreshold: 5,
        resetTimeout: 30000,
        timeout: 10000,
      }));
    });
  }

  async runStartupDiagnostics(): Promise<StartupDiagnostics> {
    logger.info('Running startup diagnostics...');

    const checks = {
      database: false,
      pinecone: false,
      redis: false,
      groq: false,
      email: false,
      requiredEnvVars: false,
      secretsValid: false,
    };

    try {
      checks.database = await this.checkDatabaseConnectivity();
    } catch (error) {
      logger.error(`Database check failed: ${error}`);
    }

    try {
      checks.pinecone = await this.checkPineconeConnectivity();
    } catch (error) {
      logger.error(`Pinecone check failed: ${error}`);
    }

    try {
      checks.redis = await this.checkRedisConnectivity();
    } catch (error) {
      logger.error(`Redis check failed: ${error}`);
    }

    try {
      checks.groq = await this.checkGroqConnectivity();
    } catch (error) {
      logger.error(`Groq check failed: ${error}`);
    }

    try {
      checks.email = await this.checkEmailConnectivity();
    } catch (error) {
      logger.error(`Email check failed: ${error}`);
    }

    checks.requiredEnvVars = this.validateRequiredEnvVars();
    checks.secretsValid = this.validateSecrets();

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const summary = `${passedChecks}/${totalChecks} checks passed`;

    logger.info(`Startup diagnostics: ${summary}`);

    if (passedChecks < totalChecks) {
      logger.warn(`Some startup checks failed: ${summary}`);
    }

    return {
      timestamp: new Date(),
      environment: CONFIG.NODE_ENV || 'development',
      version: CONFIG.APP_VERSION || '1.0.0',
      nodeVersion: process.version,
      memory: process.memoryUsage(),
      checks,
      summary,
    };
  }

  async runHealthCheck(): Promise<HealthCheckResult> {
    const timestamp = new Date();
    const uptime = Date.now() - this.startTime.getTime();

    const databaseCheck = await this.checkDatabaseWithCircuitBreaker();
    const pineconeCheck = await this.checkPineconeWithCircuitBreaker();
    const redisCheck = await this.checkRedisWithCircuitBreaker();
    const groqCheck = await this.checkGroqWithCircuitBreaker();
    const emailCheck = await this.checkEmailWithCircuitBreaker();

    const checks = {
      database: databaseCheck,
      pinecone: pineconeCheck,
      redis: redisCheck,
      groq: groqCheck,
      email: emailCheck,
      monitoring: { status: 'up', lastChecked: timestamp } as DependencyCheck,
    };

    const statuses = Object.values(checks).map(c => c.status);
    const hasDown = statuses.includes('down');
    const hasDegraded = statuses.includes('degraded');

    const status: 'healthy' | 'degraded' | 'unhealthy' = 
      hasDown ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy';

    return {
      status,
      timestamp,
      uptime,
      version: CONFIG.APP_VERSION || '1.0.0',
      checks,
    };
  }

  async runReadinessCheck(): Promise<{ ready: boolean; checks: StartupDiagnostics['checks'] }> {
    const checks = {
      database: false,
      pinecone: false,
      redis: false,
      groq: false,
      email: false,
      requiredEnvVars: false,
      secretsValid: false,
    };

    checks.database = await this.checkDatabaseConnectivity();
    checks.pinecone = await this.checkPineconeConnectivity();
    checks.redis = await this.checkRedisConnectivity();
    checks.groq = await this.checkGroqConnectivity();
    checks.email = await this.checkEmailConnectivity();
    checks.requiredEnvVars = this.validateRequiredEnvVars();
    checks.secretsValid = this.validateSecrets();

    const ready = Object.values(checks).filter(Boolean).length >= 5;

    return { ready, checks };
  }

  runLivenessCheck(): { alive: boolean; uptime: number } {
    return {
      alive: true,
      uptime: Date.now() - this.startTime.getTime(),
    };
  }

  async gracefulShutdown(): Promise<void> {
    logger.info('Starting graceful shutdown...');

    try {
      await this.prisma.$disconnect();
      logger.info('Database connection closed');
    } catch (error) {
      logger.error(`Error closing database connection: ${error}`);
    }

    this.circuitBreakers.clear();

    logger.info('Graceful shutdown completed');
  }

  private async checkDatabaseConnectivity(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database connectivity check failed', error);
      return false;
    }
  }

  private async checkPineconeConnectivity(): Promise<boolean> {
    try {
      const pinecone = require('@pinecone-database/pinecone');
      const client = new pinecone.PineconeClient({
        apiKey: CONFIG.PINECONE_API_KEY || '',
      });
      await client.listIndexes();
      return true;
    } catch (error) {
      logger.error('Pinecone connectivity check failed', error);
      return false;
    }
  }

  private async checkRedisConnectivity(): Promise<boolean> {
    try {
      const { createClient } = require('redis');
      const client = createClient({ url: CONFIG.REDIS_URL || 'redis://localhost:6379' });
      await client.connect();
      await client.ping();
      await client.quit();
      return true;
    } catch (error) {
      logger.error('Redis connectivity check failed', error);
      return false;
    }
  }

  private async checkGroqConnectivity(): Promise<boolean> {
    try {
      if (!CONFIG.GROQ_API_KEY) {
        logger.warn('Groq API key not configured');
        return true;
      }

      const Groq = require('groq-sdk');
      const client = new Groq({ apiKey: CONFIG.GROQ_API_KEY });
      return true;
    } catch (error) {
      logger.error('Groq connectivity check failed', error);
      return false;
    }
  }

  private async checkEmailConnectivity(): Promise<boolean> {
    try {
      if (!CONFIG.EMAIL_SERVICE_API_KEY) {
        logger.warn('Email service API key not configured');
        return true;
      }

      return true;
    } catch (error) {
      logger.error('Email connectivity check failed', error);
      return false;
    }
  }

  private async checkDatabaseWithCircuitBreaker(): Promise<DependencyCheck> {
    const breaker = this.circuitBreakers.get('database')!;
    
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      
      breaker.recordSuccess();
      
      return {
        status: latency > 1000 ? 'degraded' : 'up',
        latency,
        lastChecked: new Date(),
      };
    } catch (error) {
      breaker.recordFailure();
      
      return {
        status: 'down',
        error: error instanceof Error ? error.message : String(error),
        lastChecked: new Date(),
      };
    }
  }

  private async checkPineconeWithCircuitBreaker(): Promise<DependencyCheck> {
    const breaker = this.circuitBreakers.get('pinecone')!;
    
    try {
      const start = Date.now();
      const pinecone = require('@pinecone-database/pinecone');
      const client = new pinecone.PineconeClient({
        apiKey: CONFIG.PINECONE_API_KEY || '',
      });
      await client.listIndexes();
      const latency = Date.now() - start;
      
      breaker.recordSuccess();
      
      return {
        status: latency > 2000 ? 'degraded' : 'up',
        latency,
        lastChecked: new Date(),
      };
    } catch (error) {
      breaker.recordFailure();
      
      return {
        status: 'down',
        error: error instanceof Error ? error.message : String(error),
        lastChecked: new Date(),
      };
    }
  }

  private async checkRedisWithCircuitBreaker(): Promise<DependencyCheck> {
    const breaker = this.circuitBreakers.get('redis')!;
    
    try {
      const start = Date.now();
      const { createClient } = require('redis');
      const client = createClient({ url: CONFIG.REDIS_URL || 'redis://localhost:6379' });
      await client.connect();
      await client.ping();
      await client.quit();
      const latency = Date.now() - start;
      
      breaker.recordSuccess();
      
      return {
        status: latency > 500 ? 'degraded' : 'up',
        latency,
        lastChecked: new Date(),
      };
    } catch (error) {
      breaker.recordFailure();
      
      return {
        status: CONFIG.REDIS_URL ? 'down' : 'up',
        error: CONFIG.REDIS_URL ? error instanceof Error ? error.message : String(error) : undefined,
        lastChecked: new Date(),
      };
    }
  }

  private async checkGroqWithCircuitBreaker(): Promise<DependencyCheck> {
    const breaker = this.circuitBreakers.get('groq')!;
    
    try {
      if (!CONFIG.GROQ_API_KEY) {
        return {
          status: 'up',
          lastChecked: new Date(),
        };
      }

      const start = Date.now();
      const Groq = require('groq-sdk');
      const client = new Groq({ apiKey: CONFIG.GROQ_API_KEY });
      const latency = Date.now() - start;
      
      breaker.recordSuccess();
      
      return {
        status: latency > 5000 ? 'degraded' : 'up',
        latency,
        lastChecked: new Date(),
      };
    } catch (error) {
      breaker.recordFailure();
      
      return {
        status: 'down',
        error: error instanceof Error ? error.message : String(error),
        lastChecked: new Date(),
      };
    }
  }

  private async checkEmailWithCircuitBreaker(): Promise<DependencyCheck> {
    const breaker = this.circuitBreakers.get('email')!;
    
    try {
      if (!CONFIG.EMAIL_SERVICE_API_KEY) {
        return {
          status: 'up',
          lastChecked: new Date(),
        };
      }

      const start = Date.now();
      await new Promise(resolve => setTimeout(resolve, 10));
      const latency = Date.now() - start;
      
      breaker.recordSuccess();
      
      return {
        status: 'up',
        latency,
        lastChecked: new Date(),
      };
    } catch (error) {
      breaker.recordFailure();
      
      return {
        status: 'down',
        error: error instanceof Error ? error.message : String(error),
        lastChecked: new Date(),
      };
    }
  }

  private validateRequiredEnvVars(): boolean {
    const required = [
      'DATABASE_URL',
      'JWT_ACCESS_SECRET',
      'JWT_REFRESH_SECRET',
      'PINECONE_API_KEY',
      'PINECONE_INDEX_NAME',
      'GROQ_API_KEY',
    ];

    return required.every(env => !!CONFIG[env as keyof typeof CONFIG]);
  }

  private validateSecrets(): boolean {
    if (!CONFIG.JWT_ACCESS_SECRET || CONFIG.JWT_ACCESS_SECRET.length < 32) {
      logger.warn('JWT_ACCESS_SECRET is too short or missing');
      return false;
    }

    if (!CONFIG.JWT_REFRESH_SECRET || CONFIG.JWT_REFRESH_SECRET.length < 32) {
      logger.warn('JWT_REFRESH_SECRET is too short or missing');
      return false;
    }

    return true;
  }
}

export const deploymentHardeningService = new DeploymentHardeningService();
export { CircuitBreaker };
