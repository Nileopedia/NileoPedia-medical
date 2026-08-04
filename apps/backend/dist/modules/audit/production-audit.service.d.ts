/**
 * Production Audit Service
 *
 * One command that executes all production readiness checks:
 * - Knowledge Audit
 * - Security Audit
 * - Performance Audit
 * - Retrieval Audit
 * - Citation Audit
 * - Evaluation Benchmark
 * - Load Test
 * - Health Check
 * - Dependency Check
 * - Environment Validation
 * - Configuration Validation
 * - Database Validation
 * - Pinecone Validation
 * - Redis Validation
 * - Groq Validation
 * - Email Validation
 *
 * Produces:
 * - production-report.html
 * - production-report.json
 * - production-report.md
 */
export interface ProductionAuditReport {
    timestamp: string;
    summary: {
        overallScore: number;
        grade: 'A+' | 'A' | 'B' | 'C' | 'D';
        productionReadinessPercent: number;
        goNoGo: 'GO' | 'NO-GO' | 'CONDITIONAL';
    };
    sections: {
        knowledgeAudit: any;
        securityAudit: any;
        performanceAudit: any;
        retrievalAudit: any;
        citationAudit: any;
        evaluationBenchmark: any;
        healthCheck: any;
        dependencyCheck: any;
        environmentValidation: any;
        configurationValidation: any;
        databaseValidation: any;
        pineconeValidation: any;
        redisValidation: any;
        groqValidation: any;
        emailValidation: any;
    };
    criticalIssues: any[];
    warnings: any[];
    recommendations: string[];
    deploymentChecklist: DeploymentChecklist[];
}
export interface DeploymentChecklist {
    category: string;
    items: CheckItem[];
}
export interface CheckItem {
    label: string;
    status: 'PASS' | 'FAIL' | 'WARNING';
    details?: string;
}
export declare class ProductionAuditService {
    private prisma;
    private reportsDir;
    constructor();
    runFullAudit(): Promise<ProductionAuditReport>;
    private validateEnvironment;
    private validateConfiguration;
    private validateDatabase;
    private validatePinecone;
    private validateRedis;
    private validateGroq;
    private validateEmail;
    private extractCriticalIssues;
    private extractWarnings;
    private generateRecommendations;
    private buildDeploymentChecklist;
    private calculateOverallScore;
    private calculateGrade;
    private calculateProductionReadiness;
    private calculateGoNoGo;
    private writeReports;
    private generateMarkdownReport;
    private generateHTMLReport;
}
export declare const productionAuditService: ProductionAuditService;
//# sourceMappingURL=production-audit.service.d.ts.map