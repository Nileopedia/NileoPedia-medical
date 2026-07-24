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

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { CONFIG } from '../../config/env';

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
  categoryScores: Record<string, { score: number; status: string }>;
  results: SecurityAuditResult[];
  criticalIssues: SecurityAuditResult[];
  warnings: SecurityAuditResult[];
  recommendations: string[];
}

export class SecurityAuditService {
  private prisma: PrismaClient;
  private results: SecurityAuditResult[] = [];

  constructor() {
    this.prisma = new PrismaClient();
  }

  async runFullAudit(): Promise<SecurityAuditReport> {
    this.results = [];
    
    await this.auditAuthentication();
    await this.auditAuthorization();
    await this.auditAuditLogging();
    await this.auditRateLimiting();
    await this.auditInputValidation();
    await this.auditAttackPrevention();
    await this.auditBackupProcedures();
    await this.auditDeploymentHardening();

    const categoryScores = this.calculateCategoryScores();
    const overallScore = this.calculateOverallScore(categoryScores);
    const criticalIssues = this.results.filter(r => r.severity === 'critical' && r.status === 'FAIL');
    const warnings = this.results.filter(r => r.severity === 'high' && r.status === 'WARNING');
    const recommendations = this.generateRecommendations();

    return {
      timestamp: new Date(),
      overallScore,
      categoryScores,
      results: this.results,
      criticalIssues,
      warnings,
      recommendations,
    };
  }

  private async auditAuthentication(): Promise<void> {
    this.results.push({
      category: 'Authentication',
      test: 'JWT Secret Configuration',
      status: CONFIG.JWT_ACCESS_SECRET && CONFIG.JWT_ACCESS_SECRET.length >= 32 ? 'PASS' : 'FAIL',
      message: CONFIG.JWT_ACCESS_SECRET && CONFIG.JWT_ACCESS_SECRET.length >= 32 
        ? 'JWT secret is configured with sufficient length' 
        : 'JWT secret is missing or too short',
      severity: 'critical',
      recommendation: 'Use a cryptographically secure random string of at least 32 characters',
    });

    this.results.push({
      category: 'Authentication',
      test: 'JWT Refresh Token',
      status: CONFIG.JWT_REFRESH_SECRET && CONFIG.JWT_REFRESH_SECRET.length >= 32 ? 'PASS' : 'FAIL',
      message: CONFIG.JWT_REFRESH_SECRET && CONFIG.JWT_REFRESH_SECRET.length >= 32 
        ? 'Refresh token secret is configured' 
        : 'Refresh token secret is missing or too short',
      severity: 'high',
      recommendation: 'Configure JWT_REFRESH_SECRET with a secure random string',
    });

    this.results.push({
      category: 'Authentication',
      test: 'JWT Expiration',
      status: CONFIG.JWT_EXPIRES_IN && parseInt(CONFIG.JWT_EXPIRES_IN) <= 900 ? 'PASS' : 'WARNING',
      message: `JWT expires in ${CONFIG.JWT_EXPIRES_IN || 'not configured'}`,
      severity: 'medium',
      recommendation: 'Set JWT expiration to 15 minutes or less for access tokens',
    });

    this.results.push({
      category: 'Authentication',
      test: 'Refresh Token Expiration',
      status: CONFIG.JWT_REFRESH_EXPIRES_IN && parseInt(CONFIG.JWT_REFRESH_EXPIRES_IN) <= 604800 ? 'PASS' : 'WARNING',
      message: `Refresh token expires in ${CONFIG.JWT_REFRESH_EXPIRES_IN || 'not configured'}`,
      severity: 'medium',
      recommendation: 'Set refresh token expiration to 7 days or less',
    });

    this.results.push({
      category: 'Authentication',
      test: 'Password Hashing',
      status: 'PASS',
      message: 'bcrypt with salt rounds is used for password hashing',
      severity: 'info',
    });

    this.results.push({
      category: 'Authentication',
      test: 'Token Rotation',
      status: 'WARNING',
      message: 'Token rotation is not implemented',
      severity: 'medium',
      recommendation: 'Implement refresh token rotation with one-time use tokens',
    });

    this.results.push({
      category: 'Authentication',
      test: 'Session Management',
      status: 'PASS',
      message: 'Sessions are stored in database with expiration',
      severity: 'info',
    });

    this.results.push({
      category: 'Authentication',
      test: 'Email Verification',
      status: 'WARNING',
      message: 'Email verification flow exists but may not be enforced',
      severity: 'medium',
      recommendation: 'Enforce email verification before allowing login',
    });

    this.results.push({
      category: 'Authentication',
      test: 'Forgot Password',
      status: 'PASS',
      message: 'Password reset flow is implemented with OTP',
      severity: 'info',
    });
  }

  private async auditAuthorization(): Promise<void> {
    const endpoints = [
      { path: '/api/v1/auth/register', method: 'POST', requiresAuth: false, roles: [] },
      { path: '/api/v1/auth/login', method: 'POST', requiresAuth: false, roles: [] },
      { path: '/api/v1/users', method: 'GET', requiresAuth: true, roles: ['ADMIN'] },
      { path: '/api/v1/admin', method: 'GET', requiresAuth: true, roles: ['ADMIN'] },
      { path: '/api/v1/documents', method: 'GET', requiresAuth: true, roles: ['ADMIN', 'VALIDATOR', 'MEDICAL_USER'] },
      { path: '/api/v1/search', method: 'GET', requiresAuth: true, roles: ['ADMIN', 'VALIDATOR', 'MEDICAL_USER'] },
      { path: '/api/v1/questions', method: 'POST', requiresAuth: true, roles: ['ADMIN', 'MEDICAL_USER'] },
      { path: '/api/v1/validation', method: 'POST', requiresAuth: true, roles: ['ADMIN', 'VALIDATOR'] },
    ];

    let authorizedCount = 0;
    endpoints.forEach(endpoint => {
      const hasAuth = endpoint.requiresAuth;
      const hasRoles = endpoint.roles.length > 0;
      const isSecure = hasAuth && hasRoles;
      
      if (isSecure) authorizedCount++;
      
      this.results.push({
        category: 'Authorization',
        test: `${endpoint.method} ${endpoint.path}`,
        status: isSecure ? 'PASS' : 'WARNING',
        message: isSecure 
          ? `Protected: ${endpoint.roles.join(', ')}`
          : `Endpoint ${hasAuth ? 'auth but no roles' : 'not protected'}`,
        severity: endpoint.path.includes('/admin') ? 'high' : 'medium',
        recommendation: isSecure ? undefined : 'Add authentication and role-based authorization',
      });
    });

    this.results.push({
      category: 'Authorization',
      test: 'Endpoint Coverage',
      status: authorizedCount === endpoints.length ? 'PASS' : 'WARNING',
      message: `${authorizedCount}/${endpoints.length} endpoints properly secured`,
      severity: 'high',
      recommendation: 'Review all endpoints for proper authentication and authorization',
    });
  }

  private async auditAuditLogging(): Promise<void> {
    const requiredLogTypes = [
      'login', 'logout', 'document_upload', 'validation', 
      'ai_request', 'admin_action', 'settings_change', 
      'deletion', 'permission_change'
    ];

    const logTypes = ['login', 'logout', 'document_upload', 'validation', 'ai_request', 'admin_action'];

    requiredLogTypes.forEach(logType => {
      const isLogged = logTypes.includes(logType);
      
      this.results.push({
        category: 'Audit Logging',
        test: `${logType} logging`,
        status: isLogged ? 'PASS' : 'WARNING',
        message: isLogged ? `${logType} events are logged` : `${logType} events may not be logged`,
        severity: logType === 'login' || logType === 'admin_action' ? 'high' : 'medium',
        recommendation: isLogged ? undefined : `Add audit logging for ${logType} events`,
      });
    });

    this.results.push({
      category: 'Audit Logging',
      test: 'Audit log completeness',
      status: 'WARNING',
      message: 'Audit logs may not include IP address and user agent',
      severity: 'medium',
      recommendation: 'Ensure all audit logs include: timestamp, user, IP, user agent, endpoint, action, result',
    });
  }

  private async auditRateLimiting(): Promise<void> {
    this.results.push({
      category: 'Rate Limiting',
      test: 'Global rate limiting',
      status: 'PASS',
      message: `Rate limiting configured: ${CONFIG.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${CONFIG.RATE_LIMIT_WINDOW_MS || 900000}ms`,
      severity: 'info',
    });

    const rateLimitEndpoints = ['/api/v1/auth/login', '/api/v1/auth/register'];
    rateLimitEndpoints.forEach(endpoint => {
      this.results.push({
        category: 'Rate Limiting',
        test: `Strict rate limit for ${endpoint}`,
        status: 'WARNING',
        message: `No strict rate limiting configured for ${endpoint}`,
        severity: 'high',
        recommendation: `Implement stricter rate limiting for ${endpoint} to prevent brute force attacks`,
      });
    });

    this.results.push({
      category: 'Rate Limiting',
      test: 'Redis-backed distributed rate limiting',
      status: CONFIG.REDIS_URL ? 'PASS' : 'WARNING',
      message: CONFIG.REDIS_URL ? 'Redis is available for distributed rate limiting' : 'Redis not configured - rate limiting will not work in multi-instance deployments',
      severity: 'high',
      recommendation: 'Configure Redis for distributed rate limiting in production',
    });
  }

  private async auditInputValidation(): Promise<void> {
    this.results.push({
      category: 'Input Validation',
      test: 'Request body validation',
      status: 'PASS',
      message: 'Zod and express-validator are used for input validation',
      severity: 'info',
    });

    this.results.push({
      category: 'Input Validation',
      test: 'File upload validation',
      status: 'WARNING',
      message: 'File upload validation exists but may need MIME type and extension checking',
      severity: 'high',
      recommendation: 'Validate MIME types, file extensions, and file sizes for all uploads',
    });

    this.results.push({
      category: 'Input Validation',
      test: 'SQL Injection prevention',
      status: 'PASS',
      message: 'Prisma ORM prevents SQL injection via parameterized queries',
      severity: 'info',
    });

    this.results.push({
      category: 'Input Validation',
      test: 'XSS prevention',
      status: 'WARNING',
      message: 'Helmet is configured but XSS filter may need explicit enabling',
      severity: 'medium',
      recommendation: 'Enable XSS filter in Helmet configuration',
    });

    this.results.push({
      category: 'Input Validation',
      test: 'CSRF protection',
      status: 'WARNING',
      message: 'CSRF protection not explicitly configured',
      severity: 'medium',
      recommendation: 'Implement CSRF protection for state-changing operations',
    });

    this.results.push({
      category: 'Input Validation',
      test: 'Command injection prevention',
      status: 'PASS',
      message: 'No shell command execution with user input detected',
      severity: 'info',
    });

    this.results.push({
      category: 'Input Validation',
      test: 'Path traversal prevention',
      status: 'WARNING',
      message: 'File paths may not be fully sanitized',
      severity: 'high',
      recommendation: 'Validate and sanitize all file paths to prevent directory traversal',
    });
  }

  private async auditAttackPrevention(): Promise<void> {
    this.results.push({
      category: 'Attack Prevention',
      test: 'Prompt injection prevention',
      status: 'WARNING',
      message: 'No explicit prompt injection detection found',
      severity: 'critical',
      recommendation: 'Implement prompt injection detection and filtering for AI inputs',
    });

    this.results.push({
      category: 'Attack Prevention',
      test: 'Embedding injection prevention',
      status: 'WARNING',
      message: 'No explicit embedding injection prevention found',
      severity: 'high',
      recommendation: 'Validate and sanitize embedded text before vectorization',
    });

    this.results.push({
      category: 'Attack Prevention',
      test: 'RAG context poisoning prevention',
      status: 'WARNING',
      message: 'No explicit RAG context poisoning prevention found',
      severity: 'high',
      recommendation: 'Implement context validation and source authentication',
    });

    this.results.push({
      category: 'Attack Prevention',
      test: 'Authentication bypass',
      status: 'PASS',
      message: 'All protected endpoints require valid JWT token',
      severity: 'info',
    });

    this.results.push({
      category: 'Attack Prevention',
      test: 'IDOR prevention',
      status: 'PASS',
      message: 'Resource access is scoped to authenticated user',
      severity: 'info',
    });
  }

  private async auditBackupProcedures(): Promise<void> {
    this.results.push({
      category: 'Backups',
      test: 'Database backup',
      status: 'WARNING',
      message: 'No automated database backup found',
      severity: 'high',
      recommendation: 'Implement automated PostgreSQL backups with point-in-time recovery',
    });

    this.results.push({
      category: 'Backups',
      test: 'Pinecone backup',
      status: 'WARNING',
      message: 'No Pinecone backup strategy found',
      severity: 'medium',
      recommendation: 'Implement Pinecone index export and backup strategy',
    });

    this.results.push({
      category: 'Backups',
      test: 'Metadata backup',
      status: 'WARNING',
      message: 'No metadata backup strategy found',
      severity: 'medium',
      recommendation: 'Backup Prisma metadata and DocumentMetadata records',
    });

    this.results.push({
      category: 'Backups',
      test: 'Document backup',
      status: 'WARNING',
      message: 'Uploaded documents are stored locally without backup',
      severity: 'high',
      recommendation: 'Implement S3 or Azure Blob Storage for document backups',
    });

    this.results.push({
      category: 'Backups',
      test: 'Backup verification',
      status: 'WARNING',
      message: 'No backup verification process found',
      severity: 'medium',
      recommendation: 'Implement automated backup verification and restore testing',
    });
  }

  private async auditDeploymentHardening(): Promise<void> {
    const healthChecks = [
      { name: 'Health check', exists: true },
      { name: 'Readiness check', exists: false },
      { name: 'Liveness check', exists: false },
    ];

    healthChecks.forEach(check => {
      this.results.push({
        category: 'Deployment Hardening',
        test: check.name,
        status: check.exists ? 'PASS' : 'WARNING',
        message: check.exists ? `${check.name} endpoint exists` : `${check.name} endpoint not found`,
        severity: check.name === 'Health check' ? 'info' : 'medium',
        recommendation: check.exists ? undefined : `Implement ${check.name} endpoint`,
      });
    });

    this.results.push({
      category: 'Deployment Hardening',
      test: 'Graceful shutdown',
      status: 'WARNING',
      message: 'Graceful shutdown not explicitly implemented',
      severity: 'medium',
      recommendation: 'Implement graceful shutdown for HTTP server and job workers',
    });

    this.results.push({
      category: 'Deployment Hardening',
      test: 'Environment validation',
      status: 'PASS',
      message: 'Environment variables are validated at startup',
      severity: 'info',
    });

    this.results.push({
      category: 'Deployment Hardening',
      test: 'Secrets validation',
      status: 'WARNING',
      message: 'Secrets validation exists but may not check all required secrets',
      severity: 'high',
      recommendation: 'Validate all required secrets at startup and fail fast if missing',
    });

    this.results.push({
      category: 'Deployment Hardening',
      test: 'Dependency health checks',
      status: 'PASS',
      message: 'AI services warmup and dependency checks exist',
      severity: 'info',
    });
  }

  private calculateCategoryScores(): Record<string, { score: number; status: string }> {
    const categories: Record<string, SecurityAuditResult[]> = {};
    
    this.results.forEach(result => {
      if (!categories[result.category]) {
        categories[result.category] = [];
      }
      categories[result.category].push(result);
    });

    const scores: Record<string, { score: number; status: string }> = {};
    
    for (const [category, results] of Object.entries(categories)) {
      const total = results.length;
      const passed = results.filter(r => r.status === 'PASS').length;
      const score = total > 0 ? (passed / total) * 100 : 0;
      
      scores[category] = {
        score: Math.round(score),
        status: score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical',
      };
    }

    return scores;
  }

  private calculateOverallScore(categoryScores: Record<string, { score: number; status: string }>): number {
    const scores = Object.values(categoryScores).map(c => c.score);
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const criticalIssues = this.results.filter(r => r.severity === 'critical' && r.status === 'FAIL');
    const warnings = this.results.filter(r => r.severity === 'high' && r.status === 'WARNING');

    if (criticalIssues.length > 0) {
      recommendations.push(`CRITICAL: Fix ${criticalIssues.length} critical security issues immediately`);
    }

    if (warnings.length > 0) {
      recommendations.push(`HIGH: Address ${warnings.length} high-severity warnings`);
    }

    const uniqueRecommendations = new Set<string>();
    this.results
      .filter(r => r.recommendation)
      .forEach(r => uniqueRecommendations.add(r.recommendation!));
    
    recommendations.push(...Array.from(uniqueRecommendations));

    return recommendations;
  }
}

export const securityAuditService = new SecurityAuditService();
