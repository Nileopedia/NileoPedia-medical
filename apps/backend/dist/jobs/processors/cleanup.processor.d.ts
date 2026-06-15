import { CleanupJob } from '../types';
export declare function processCleanup(job: CleanupJob): Promise<{
    success: boolean;
    cleaned: number;
} | {
    success: boolean;
    archived: number;
}>;
//# sourceMappingURL=cleanup.processor.d.ts.map