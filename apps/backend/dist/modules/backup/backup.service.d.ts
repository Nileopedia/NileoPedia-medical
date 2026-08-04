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
export interface BackupResult {
    success: boolean;
    backupType: string;
    timestamp: Date;
    size: number;
    path: string;
    checksum: string;
    error?: string;
}
export interface BackupManifest {
    timestamp: Date;
    version: string;
    backups: {
        database?: BackupResult;
        pinecone?: BackupResult;
        metadata?: BackupResult;
        documents?: BackupResult;
    };
    checksums: Record<string, string>;
}
export declare class BackupService {
    private backupDir;
    private prisma;
    constructor();
    createDatabaseBackup(): Promise<BackupResult>;
    createPineconeBackup(): Promise<BackupResult>;
    createMetadataBackup(): Promise<BackupResult>;
    createDocumentBackup(): Promise<BackupResult>;
    createFullBackup(): Promise<BackupManifest>;
    verifyBackup(backupPath: string): Promise<{
        valid: boolean;
        checksum: string;
        size: number;
    }>;
    listBackups(): Promise<Array<{
        name: string;
        path: string;
        size: number;
        timestamp: Date;
    }>>;
    cleanupOldBackups(keepDays?: number): Promise<number>;
    private calculateChecksum;
}
export declare const backupService: BackupService;
//# sourceMappingURL=backup.service.d.ts.map