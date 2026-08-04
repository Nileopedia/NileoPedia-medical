/**
 * Security Audit Framework
 *
 * Comprehensive security validation:
 * - Authentication
 * - Authorization
 * - Audit Logging
 * - Rate Limiting
 * - Input Validation
 * - Attack Prevention
 * - Backup Verification
 * - Deployment Hardening
 */
export interface SecurityAuditResult {
    category: string;
    test: string;
    status: 'PASS' | 'FAIL' | 'WARNING';
    message: string;
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    recommendation?: string;
}
export interface SecurityAuditReport {
    timestamp: Date;
    overallScore: number;
    categoryScores: Record<string, {
        score: number;
        status: string;
    }>;
    results: SecurityAuditResult[];
    criticalIssues: SecurityAuditResult[];
    warnings: SecurityAuditResult[];
    recommendations: string[];
}
export declare class SecurityAuditService {
    private prisma;
    private results;
    constructor();
    runFullAudit(): Promise<SecurityAuditReport>;
    private auditAuthentication;
    private auditAuthorization;
    private auditAuditLogging;
    private auditRateLimiting;
    private auditInputValidation;
    private auditAttackPrevention;
    private auditBackupProcedures;
    private auditDeploymentHardening;
    private calculateCategoryScores;
    private calculateOverallScore;
    private generateRecommendations;
}
export declare const securityAuditService: SecurityAuditService;
//# sourceMappingURL=security-audit.service.d.ts.map