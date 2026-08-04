"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ragDebugService = void 0;
class RagDebugService {
    constructor() {
        this.listeners = [];
        this.latestDebug = null;
    }
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }
    capture(info) {
        this.latestDebug = info;
        this.listeners.forEach((listener) => {
            try {
                listener(info);
            }
            catch (e) {
                // ignore listener errors
            }
        });
    }
    getLatest() {
        return this.latestDebug;
    }
    clear() {
        this.latestDebug = null;
    }
}
exports.ragDebugService = new RagDebugService();
//# sourceMappingURL=rag-debug.service.js.map