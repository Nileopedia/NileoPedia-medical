import { RagDebugInfo } from './rag-debug.types';

type DebugListener = (info: RagDebugInfo) => void;

class RagDebugService {
  private listeners: DebugListener[] = [];
  private latestDebug: RagDebugInfo | null = null;

  subscribe(listener: DebugListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  capture(info: RagDebugInfo) {
    this.latestDebug = info;
    this.listeners.forEach((listener) => {
      try {
        listener(info);
      } catch (e) {
        // ignore listener errors
      }
    });
  }

  getLatest(): RagDebugInfo | null {
    return this.latestDebug;
  }

  clear() {
    this.latestDebug = null;
  }
}

export const ragDebugService = new RagDebugService();
