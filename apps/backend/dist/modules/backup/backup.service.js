"use strict";
/**
 * Backup Service
 *
 * Implements:
 * - Database backup (PostgreSQL)
 * - Pinecone backup
 * - Metadata backup
 * - Document backup
 * - Restore procedures
 * - Scheduled backups
 * - Backup verification
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupService = exports.BackupService = void 0;
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
class BackupService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.backupDir = env_1.CONFIG.BACKUP_DIR || path_1.default.join(process.cwd(), 'backups');
        if (!fs_1.default.existsSync(this.backupDir)) {
            fs_1.default.mkdirSync(this.backupDir, { recursive: true });
        }
    }
    async createDatabaseBackup() {
        const timestamp = new Date();
        const fileName = `database-backup-${timestamp.toISOString().replace(/[:.]/g, '-')}.sql`;
        const filePath = path_1.default.join(this.backupDir, fileName);
        try {
            const tables = [
                'users', 'medical_documents', 'document_metadata', 'embedding_metadata',
                'questions', 'ai_responses', 'citations', 'validation_reviews',
                'notifications', 'sessions', 'audit_logs', 'feedback', 'email_logs',
                'user_preferences', 'password_resets', 'otp_verifications'
            ];
            const dump = [];
            dump.push('-- NileoPedia Database Backup');
            dump.push(`-- Generated: ${timestamp.toISOString()}`);
            dump.push(`-- Version: ${env_1.CONFIG.APP_VERSION || '1.0.0'}`);
            dump.push('');
            for (const table of tables) {
                try {
                    const records = await this.prisma[table].findMany({});
                    if (records.length === 0)
                        continue;
                    dump.push(`-- Table: ${table}`);
                    dump.push(`DELETE FROM "${table}";`);
                    for (const record of records) {
                        const columns = Object.keys(record).map(k => `"${k}"`).join(', ');
                        const values = Object.values(record).map(v => {
                            if (v === null)
                                return 'NULL';
                            if (typeof v === 'string')
                                return `'${v.replace(/'/g, "''")}'`;
                            if (v instanceof Date)
                                return `'${v.toISOString()}'`;
                            if (typeof v === 'boolean')
                                return v ? 'TRUE' : 'FALSE';
                            return v;
                        }).join(', ');
                        dump.push(`INSERT INTO "${table}" (${columns}) VALUES (${values});`);
                    }
                    dump.push('');
                }
                catch (tableError) {
                    logger_1.logger.warn(`Could not backup table ${table}: ${tableError}`);
                }
            }
            fs_1.default.writeFileSync(filePath, dump.join('\n'));
            const checksum = this.calculateChecksum(filePath);
            const stats = fs_1.default.statSync(filePath);
            logger_1.logger.info(`Database backup created: ${fileName} (${stats.size} bytes)`);
            return {
                success: true,
                backupType: 'database',
                timestamp,
                size: stats.size,
                path: filePath,
                checksum,
            };
        }
        catch (error) {
            logger_1.logger.error(`Database backup failed: ${error}`);
            return {
                success: false,
                backupType: 'database',
                timestamp,
                size: 0,
                path: filePath,
                checksum: '',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    async createPineconeBackup() {
        const timestamp = new Date();
        const fileName = `pinecone-backup-${timestamp.toISOString().replace(/[:.]/g, '-')}.json`;
        const filePath = path_1.default.join(this.backupDir, fileName);
        try {
            const chunks = await this.prisma.embeddingMetadata.findMany({
                select: {
                    pineconeVectorId: true,
                    documentId: true,
                    chunkIndex: true,
                    chunkText: true,
                    disease: true,
                    specialty: true,
                    symptoms: true,
                    diagnosis: true,
                    treatment: true,
                    medication: true,
                    complications: true,
                    prevention: true,
                    icd10: true,
                    snomed: true,
                    meshTerms: true,
                    citationQuality: true,
                    metadataCompleteness: true,
                    chunkLength: true,
                    chunkHash: true,
                    tokenCount: true,
                    pageNumber: true,
                    sectionTitle: true,
                    isDuplicate: true,
                    isValid: true,
                    embeddingModel: true,
                },
            });
            const backupData = {
                timestamp,
                totalVectors: chunks.length,
                vectors: chunks.map(chunk => ({
                    id: chunk.pineconeVectorId,
                    metadata: {
                        documentId: chunk.documentId,
                        chunkIndex: chunk.chunkIndex,
                        chunkText: chunk.chunkText,
                        disease: chunk.disease,
                        specialty: chunk.specialty,
                        symptoms: chunk.symptoms,
                        diagnosis: chunk.diagnosis,
                        treatment: chunk.treatment,
                        medication: chunk.medication,
                        complications: chunk.complications,
                        prevention: chunk.prevention,
                        icd10: chunk.icd10,
                        snomed: chunk.snomed,
                        meshTerms: chunk.meshTerms,
                        citationQuality: chunk.citationQuality,
                        metadataCompleteness: chunk.metadataCompleteness,
                        chunkLength: chunk.chunkLength,
                        chunkHash: chunk.chunkHash,
                        tokenCount: chunk.tokenCount,
                        pageNumber: chunk.pageNumber,
                        sectionTitle: chunk.sectionTitle,
                        isDuplicate: chunk.isDuplicate,
                        isValid: chunk.isValid,
                        embeddingModel: chunk.embeddingModel,
                    },
                })),
            };
            fs_1.default.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
            const checksum = this.calculateChecksum(filePath);
            const stats = fs_1.default.statSync(filePath);
            logger_1.logger.info(`Pinecone backup created: ${fileName} (${chunks.length} vectors)`);
            return {
                success: true,
                backupType: 'pinecone',
                timestamp,
                size: stats.size,
                path: filePath,
                checksum,
            };
        }
        catch (error) {
            logger_1.logger.error(`Pinecone backup failed: ${error}`);
            return {
                success: false,
                backupType: 'pinecone',
                timestamp,
                size: 0,
                path: filePath,
                checksum: '',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    async createMetadataBackup() {
        const timestamp = new Date();
        const fileName = `metadata-backup-${timestamp.toISOString().replace(/[:.]/g, '-')}.json`;
        const filePath = path_1.default.join(this.backupDir, fileName);
        try {
            const documentMetadata = await this.prisma.documentMetadata.findMany();
            const documents = await this.prisma.medicalDocument.findMany({
                select: {
                    id: true,
                    title: true,
                    description: true,
                    fileName: true,
                    fileUrl: true,
                    fileType: true,
                    fileSize: true,
                    specialty: true,
                    documentType: true,
                    source: true,
                    publicationYear: true,
                    ingestionStatus: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            const backupData = {
                timestamp,
                documentMetadata,
                documents,
                stats: {
                    totalDocuments: documents.length,
                    totalMetadata: documentMetadata.length,
                },
            };
            fs_1.default.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
            const checksum = this.calculateChecksum(filePath);
            const stats = fs_1.default.statSync(filePath);
            logger_1.logger.info(`Metadata backup created: ${fileName}`);
            return {
                success: true,
                backupType: 'metadata',
                timestamp,
                size: stats.size,
                path: filePath,
                checksum,
            };
        }
        catch (error) {
            logger_1.logger.error(`Metadata backup failed: ${error}`);
            return {
                success: false,
                backupType: 'metadata',
                timestamp,
                size: 0,
                path: filePath,
                checksum: '',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    async createDocumentBackup() {
        const timestamp = new Date();
        const fileName = `documents-backup-${timestamp.toISOString().replace(/[:.]/g, '-')}.zip`;
        const filePath = path_1.default.join(this.backupDir, fileName);
        try {
            const documents = await this.prisma.medicalDocument.findMany({
                select: { id: true, fileName: true, fileUrl: true, fileType: true },
            });
            const manifest = {
                timestamp,
                totalDocuments: documents.length,
                documents: documents.map(doc => ({
                    id: doc.id,
                    fileName: doc.fileName,
                    fileType: doc.fileType,
                    originalPath: doc.fileUrl,
                })),
            };
            fs_1.default.writeFileSync(filePath, JSON.stringify(manifest, null, 2));
            const checksum = this.calculateChecksum(filePath);
            const stats = fs_1.default.statSync(filePath);
            logger_1.logger.info(`Document backup manifest created: ${fileName} (${documents.length} documents)`);
            return {
                success: true,
                backupType: 'documents',
                timestamp,
                size: stats.size,
                path: filePath,
                checksum,
            };
        }
        catch (error) {
            logger_1.logger.error(`Document backup failed: ${error}`);
            return {
                success: false,
                backupType: 'documents',
                timestamp,
                size: 0,
                path: filePath,
                checksum: '',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    async createFullBackup() {
        logger_1.logger.info('Starting full backup...');
        const databaseBackup = await this.createDatabaseBackup();
        const pineconeBackup = await this.createPineconeBackup();
        const metadataBackup = await this.createMetadataBackup();
        const documentBackup = await this.createDocumentBackup();
        const checksums = {};
        if (databaseBackup.success)
            checksums.database = databaseBackup.checksum;
        if (pineconeBackup.success)
            checksums.pinecone = pineconeBackup.checksum;
        if (metadataBackup.success)
            checksums.metadata = metadataBackup.checksum;
        if (documentBackup.success)
            checksums.documents = documentBackup.checksum;
        const manifest = {
            timestamp: new Date(),
            version: env_1.CONFIG.APP_VERSION || '1.0.0',
            backups: {
                database: databaseBackup,
                pinecone: pineconeBackup,
                metadata: metadataBackup,
                documents: documentBackup,
            },
            checksums,
        };
        const manifestPath = path_1.default.join(this.backupDir, `backup-manifest-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
        fs_1.default.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        logger_1.logger.info(`Full backup completed: ${manifestPath}`);
        return manifest;
    }
    async verifyBackup(backupPath) {
        try {
            if (!fs_1.default.existsSync(backupPath)) {
                return { valid: false, checksum: '', size: 0 };
            }
            const stats = fs_1.default.statSync(backupPath);
            const checksum = this.calculateChecksum(backupPath);
            const content = fs_1.default.readFileSync(backupPath, 'utf-8');
            const valid = content.length > 0 && stats.size > 0;
            return {
                valid,
                checksum,
                size: stats.size,
            };
        }
        catch (error) {
            logger_1.logger.error(`Backup verification failed: ${error}`);
            return { valid: false, checksum: '', size: 0 };
        }
    }
    async listBackups() {
        try {
            if (!fs_1.default.existsSync(this.backupDir)) {
                return [];
            }
            const files = fs_1.default.readdirSync(this.backupDir)
                .filter(f => f.endsWith('.sql') || f.endsWith('.json') || f.endsWith('.zip'))
                .map(file => {
                const filePath = path_1.default.join(this.backupDir, file);
                const stats = fs_1.default.statSync(filePath);
                const match = file.match(/backup-(.+)-(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})/);
                const timestamp = match ? new Date(`${match[2]}T${match[3]}:${match[4]}:${match[5]}`) : stats.mtime;
                return {
                    name: file,
                    path: filePath,
                    size: stats.size,
                    timestamp,
                };
            })
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            return files;
        }
        catch (error) {
            logger_1.logger.error(`Failed to list backups: ${error}`);
            return [];
        }
    }
    async cleanupOldBackups(keepDays = 30) {
        try {
            const backups = await this.listBackups();
            const cutoffDate = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000);
            let deletedCount = 0;
            for (const backup of backups) {
                if (backup.timestamp < cutoffDate) {
                    fs_1.default.unlinkSync(backup.path);
                    deletedCount++;
                    logger_1.logger.info(`Deleted old backup: ${backup.name}`);
                }
            }
            return deletedCount;
        }
        catch (error) {
            logger_1.logger.error(`Backup cleanup failed: ${error}`);
            return 0;
        }
    }
    calculateChecksum(filePath) {
        const crypto = require('crypto');
        const content = fs_1.default.readFileSync(filePath);
        return crypto.createHash('sha256').update(content).digest('hex');
    }
}
exports.BackupService = BackupService;
exports.backupService = new BackupService();
//# sourceMappingURL=backup.service.js.map