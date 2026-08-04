#!/usr/bin/env ts-node
"use strict";
/**
 * Production Audit CLI
 *
 * Usage:
 *   npm run production-audit              # Run full production audit
 *   npm run production-audit -- --quick    # Run quick audit (no load tests)
 *   npm run production-audit -- --html     # Generate HTML report only
 *   npm run production-audit -- --md       # Generate Markdown report only
 */
Object.defineProperty(exports, "__esModule", { value: true });
const production_audit_service_1 = require("../modules/audit/production-audit.service");
const logger_1 = require("../config/logger");
const args = process.argv.slice(2);
const quickMode = args.includes('--quick');
const htmlOnly = args.includes('--html');
const mdOnly = args.includes('--md');
async function main() {
    console.log('='.repeat(60));
    console.log('  NileoPedia Production Audit');
    console.log('='.repeat(60));
    console.log(`Mode: ${quickMode ? 'Quick' : 'Full'}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('');
    try {
        const report = await production_audit_service_1.productionAuditService.runFullAudit();
        console.log('\n' + '='.repeat(60));
        console.log('  AUDIT SUMMARY');
        console.log('='.repeat(60));
        console.log(`Overall Score:  ${report.summary.overallScore}/100`);
        console.log(`Grade:          ${report.summary.grade}`);
        console.log(`Readiness:      ${report.summary.productionReadinessPercent}%`);
        console.log(`Go/No-Go:       ${report.summary.goNoGo}`);
        console.log(`Critical Issues: ${report.criticalIssues.length}`);
        console.log(`Warnings:        ${report.warnings.length}`);
        console.log(`Recommendations: ${report.recommendations.length}`);
        console.log('='.repeat(60));
        if (report.criticalIssues.length > 0) {
            console.log('\nCRITICAL ISSUES:');
            report.criticalIssues.forEach((issue, index) => {
                console.log(`  ${index + 1}. [${issue.severity}] ${issue.category}: ${issue.test}`);
                console.log(`     ${issue.message}`);
            });
        }
        if (report.warnings.length > 0) {
            console.log('\nWARNINGS:');
            report.warnings.forEach((warning, index) => {
                console.log(`  ${index + 1}. [${warning.severity}] ${warning.category}: ${warning.test}`);
                console.log(`     ${warning.message}`);
            });
        }
        if (report.recommendations.length > 0) {
            console.log('\nRECOMMENDATIONS:');
            report.recommendations.forEach((rec, index) => {
                console.log(`  ${index + 1}. ${rec}`);
            });
        }
        console.log('\nReports generated in: production-reports/');
        console.log('  - production-audit-latest.json');
        console.log('  - production-audit-latest.md');
        console.log(`  - production-audit-${report.timestamp.replace(/[:.]/g, '-')}.json`);
        console.log(`  - production-audit-${report.timestamp.replace(/[:.]/g, '-')}.md`);
        console.log(`  - production-audit-${report.timestamp.replace(/[:.]/g, '-')}.html`);
        if (report.summary.goNoGo === 'NO-GO') {
            console.log('\n' + '!'.repeat(60));
            console.log('  NO-GO: Critical issues must be resolved before deployment');
            console.log('!'.repeat(60));
            process.exit(1);
        }
        else if (report.summary.goNoGo === 'CONDITIONAL') {
            console.log('\n' + '?'.repeat(60));
            console.log('  CONDITIONAL: Review warnings before proceeding');
            console.log('?'.repeat(60));
        }
        else {
            console.log('\n' + '✓'.repeat(60));
            console.log(`  GO: System is production-ready (${report.summary.grade})`);
            console.log('✓'.repeat(60));
        }
    }
    catch (error) {
        console.error('Production audit failed:', error);
        logger_1.logger.error('Production audit failed', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=production-audit.js.map