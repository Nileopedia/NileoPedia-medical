import { RagDebugInfo } from './rag-debug.types';
type DebugListener = (info: RagDebugInfo) => void;
declare class RagDebugService {
    private listeners;
    private latestDebug;
    subscribe(listener: DebugListener): () => void;
    capture(info: RagDebugInfo): void;
    getLatest(): RagDebugInfo | null;
    clear(): void;
}
export declare const ragDebugService: RagDebugService;
export {};
//# sourceMappingURL=rag-debug.service.d.ts.map