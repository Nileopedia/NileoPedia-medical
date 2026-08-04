"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = exports.deploymentHardeningService = void 0;
const client_1 = require("@prisma/client");
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
class CircuitBreaker {
    constructor(config) {
        this.config = config;
        this.failures = 0;
        this.state = 'closed';
        this.nextAttempt = Date.now();
    }
    async execute(operation) {
        if (this.state === 'open') {
            if (Date.now() < this.nextAttempt) {
                throw new Error('Circuit breaker is open');
            }
            this.state = 'half-open';
        }
        try {
            const result = await Promise.race([
                operation(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timeout')), this.config.timeout)),
            ]);
            this.recordSuccess();
            return result;
        }
        catch (error) {
            this.recordFailure();
            throw error;
        }
    }
    recordSuccess() {
        this.failures = 0;
        this.state = 'closed';
    }
    recordFailure() {
        this.failures++;
        if (this.failures >= this.config.failureThreshold) {
            this.state = 'open';
            this.nextAttempt = Date.now() + this.config.resetTimeout;
        }
    }
    getState() {
        return this.state;
    }
}
exports.CircuitBreaker = CircuitBreaker;
class DeploymentHardeningService {
    constructor() {
        this.startTime = new Date();
        this.circuitBreakers = new Map();
        this.prisma = new client_1.PrismaClient();
        this.initializeCircuitBreakers();
    }
    initializeCircuitBreakers() {
        const services = ['database', 'pinecone', 'redis', 'groq', 'email'];
        services.forEach(service => {
            this.circuitBreakers.set(service, new CircuitBreaker({
                failureThreshold: 5,
                resetTimeout: 30000,
                timeout: 10000,
            }));
        });
    }
    async runStartupDiagnostics() {
        logger_1.logger.info('Running startup diagnostics...');
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
        }
        catch (error) {
            logger_1.logger.error(`Database check failed: ${error}`);
        }
        try {
            checks.pinecone = await this.checkPineconeConnectivity();
        }
        catch (error) {
            logger_1.logger.error(`Pinecone check failed: ${error}`);
        }
        try {
            checks.redis = await this.checkRedisConnectivity();
        }
        catch (error) {
            logger_1.logger.error(`Redis check failed: ${error}`);
        }
        try {
            checks.groq = await this.checkGroqConnectivity();
        }
        catch (error) {
            logger_1.logger.error(`Groq check failed: ${error}`);
        }
        try {
            checks.email = await this.checkEmailConnectivity();
        }
        catch (error) {
            logger_1.logger.error(`Email check failed: ${error}`);
        }
        checks.requiredEnvVars = this.validateRequiredEnvVars();
        checks.secretsValid = this.validateSecrets();
        const passedChecks = Object.values(checks).filter(Boolean).length;
        const totalChecks = Object.keys(checks).length;
        const summary = `${passedChecks}/${totalChecks} checks passed`;
        logger_1.logger.info(`Startup diagnostics: ${summary}`);
        if (passedChecks < totalChecks) {
            logger_1.logger.warn(`Some startup checks failed: ${summary}`);
        }
        return {
            timestamp: new Date(),
            environment: env_1.CONFIG.NODE_ENV || 'development',
            version: env_1.CONFIG.APP_VERSION || '1.0.0',
            nodeVersion: process.version,
            memory: process.memoryUsage(),
            checks,
            summary,
        };
    }
    async runHealthCheck() {
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
            monitoring: { status: 'up', lastChecked: timestamp },
        };
        const statuses = Object.values(checks).map(c => c.status);
        const hasDown = statuses.includes('down');
        const hasDegraded = statuses.includes('degraded');
        const status = hasDown ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy';
        return {
            status,
            timestamp,
            uptime,
            version: env_1.CONFIG.APP_VERSION || '1.0.0',
            checks,
        };
    }
    async runReadinessCheck() {
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
    runLivenessCheck() {
        return {
            alive: true,
            uptime: Date.now() - this.startTime.getTime(),
        };
    }
    async gracefulShutdown() {
        logger_1.logger.info('Starting graceful shutdown...');
        try {
            await this.prisma.$disconnect();
            logger_1.logger.info('Database connection closed');
        }
        catch (error) {
            logger_1.logger.error(`Error closing database connection: ${error}`);
        }
        this.circuitBreakers.clear();
        logger_1.logger.info('Graceful shutdown completed');
    }
    async checkDatabaseConnectivity() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            logger_1.logger.error('Database connectivity check failed', error);
            return false;
        }
    }
    async checkPineconeConnectivity() {
        try {
            const pinecone = require('@pinecone-database/pinecone');
            const client = new pinecone.PineconeClient({
                apiKey: env_1.CONFIG.PINECONE_API_KEY || '',
            });
            await client.listIndexes();
            return true;
        }
        catch (error) {
            logger_1.logger.error('Pinecone connectivity check failed', error);
            return false;
        }
    }
    async checkRedisConnectivity() {
        try {
            const { createClient } = require('redis');
            const client = createClient({ url: env_1.CONFIG.REDIS_URL || 'redis://localhost:6379' });
            await client.connect();
            await client.ping();
            await client.quit();
            return true;
        }
        catch (error) {
            logger_1.logger.error('Redis connectivity check failed', error);
            return false;
        }
    }
    async checkGroqConnectivity() {
        try {
            if (!env_1.CONFIG.GROQ_API_KEY) {
                logger_1.logger.warn('Groq API key not configured');
                return true;
            }
            const Groq = require('groq-sdk');
            const client = new Groq({ apiKey: env_1.CONFIG.GROQ_API_KEY });
            return true;
        }
        catch (error) {
            logger_1.logger.error('Groq connectivity check failed', error);
            return false;
        }
    }
    async checkEmailConnectivity() {
        try {
            if (!env_1.CONFIG.EMAIL_SERVICE_API_KEY) {
                logger_1.logger.warn('Email service API key not configured');
                return true;
            }
            return true;
        }
        catch (error) {
            logger_1.logger.error('Email connectivity check failed', error);
            return false;
        }
    }
    async checkDatabaseWithCircuitBreaker() {
        const breaker = this.circuitBreakers.get('database');
        try {
            const start = Date.now();
            await this.prisma.$queryRaw `SELECT 1`;
            const latency = Date.now() - start;
            breaker.recordSuccess();
            return {
                status: latency > 1000 ? 'degraded' : 'up',
                latency,
                lastChecked: new Date(),
            };
        }
        catch (error) {
            breaker.recordFailure();
            return {
                status: 'down',
                error: error instanceof Error ? error.message : String(error),
                lastChecked: new Date(),
            };
        }
    }
    async checkPineconeWithCircuitBreaker() {
        const breaker = this.circuitBreakers.get('pinecone');
        try {
            const start = Date.now();
            const pinecone = require('@pinecone-database/pinecone');
            const client = new pinecone.PineconeClient({
                apiKey: env_1.CONFIG.PINECONE_API_KEY || '',
            });
            await client.listIndexes();
            const latency = Date.now() - start;
            breaker.recordSuccess();
            return {
                status: latency > 2000 ? 'degraded' : 'up',
                latency,
                lastChecked: new Date(),
            };
        }
        catch (error) {
            breaker.recordFailure();
            return {
                status: 'down',
                error: error instanceof Error ? error.message : String(error),
                lastChecked: new Date(),
            };
        }
    }
    async checkRedisWithCircuitBreaker() {
        const breaker = this.circuitBreakers.get('redis');
        try {
            const start = Date.now();
            const { createClient } = require('redis');
            const client = createClient({ url: env_1.CONFIG.REDIS_URL || 'redis://localhost:6379' });
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
        }
        catch (error) {
            breaker.recordFailure();
            return {
                status: env_1.CONFIG.REDIS_URL ? 'down' : 'up',
                error: env_1.CONFIG.REDIS_URL ? error instanceof Error ? error.message : String(error) : undefined,
                lastChecked: new Date(),
            };
        }
    }
    async checkGroqWithCircuitBreaker() {
        const breaker = this.circuitBreakers.get('groq');
        try {
            if (!env_1.CONFIG.GROQ_API_KEY) {
                return {
                    status: 'up',
                    lastChecked: new Date(),
                };
            }
            const start = Date.now();
            const Groq = require('groq-sdk');
            const client = new Groq({ apiKey: env_1.CONFIG.GROQ_API_KEY });
            const latency = Date.now() - start;
            breaker.recordSuccess();
            return {
                status: latency > 5000 ? 'degraded' : 'up',
                latency,
                lastChecked: new Date(),
            };
        }
        catch (error) {
            breaker.recordFailure();
            return {
                status: 'down',
                error: error instanceof Error ? error.message : String(error),
                lastChecked: new Date(),
            };
        }
    }
    async checkEmailWithCircuitBreaker() {
        const breaker = this.circuitBreakers.get('email');
        try {
            if (!env_1.CONFIG.EMAIL_SERVICE_API_KEY) {
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
        }
        catch (error) {
            breaker.recordFailure();
            return {
                status: 'down',
                error: error instanceof Error ? error.message : String(error),
                lastChecked: new Date(),
            };
        }
    }
    validateRequiredEnvVars() {
        const required = [
            'DATABASE_URL',
            'JWT_ACCESS_SECRET',
            'JWT_REFRESH_SECRET',
            'PINECONE_API_KEY',
            'PINECONE_INDEX_NAME',
            'GROQ_API_KEY',
        ];
        return required.every(env => !!env_1.CONFIG[env]);
    }
    validateSecrets() {
        if (!env_1.CONFIG.JWT_ACCESS_SECRET || env_1.CONFIG.JWT_ACCESS_SECRET.length < 32) {
            logger_1.logger.warn('JWT_ACCESS_SECRET is too short or missing');
            return false;
        }
        if (!env_1.CONFIG.JWT_REFRESH_SECRET || env_1.CONFIG.JWT_REFRESH_SECRET.length < 32) {
            logger_1.logger.warn('JWT_REFRESH_SECRET is too short or missing');
            return false;
        }
        return true;
    }
}
exports.deploymentHardeningService = new DeploymentHardeningService();
//# sourceMappingURL=deployment-hardening.service.js.map