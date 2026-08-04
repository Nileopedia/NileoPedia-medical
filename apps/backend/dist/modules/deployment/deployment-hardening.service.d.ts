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
/// <reference types="node" />
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
declare class CircuitBreaker {
    private config;
    private failures;
    private state;
    private nextAttempt;
    constructor(config: {
        failureThreshold: number;
        resetTimeout: number;
        timeout: number;
    });
    execute<T>(operation: () => Promise<T>): Promise<T>;
    recordSuccess(): void;
    recordFailure(): void;
    getState(): string;
}
declare class DeploymentHardeningService {
    private startTime;
    private circuitBreakers;
    private prisma;
    constructor();
    private initializeCircuitBreakers;
    runStartupDiagnostics(): Promise<StartupDiagnostics>;
    runHealthCheck(): Promise<HealthCheckResult>;
    runReadinessCheck(): Promise<{
        ready: boolean;
        checks: StartupDiagnostics['checks'];
    }>;
    runLivenessCheck(): {
        alive: boolean;
        uptime: number;
    };
    gracefulShutdown(): Promise<void>;
    private checkDatabaseConnectivity;
    private checkPineconeConnectivity;
    private checkRedisConnectivity;
    private checkGroqConnectivity;
    private checkEmailConnectivity;
    private checkDatabaseWithCircuitBreaker;
    private checkPineconeWithCircuitBreaker;
    private checkRedisWithCircuitBreaker;
    private checkGroqWithCircuitBreaker;
    private checkEmailWithCircuitBreaker;
    private validateRequiredEnvVars;
    private validateSecrets;
}
export declare const deploymentHardeningService: DeploymentHardeningService;
export { CircuitBreaker };
//# sourceMappingURL=deployment-hardening.service.d.ts.map