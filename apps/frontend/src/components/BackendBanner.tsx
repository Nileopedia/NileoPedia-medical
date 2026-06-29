'use client';

import { useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { api } from '../lib/api';

export default function BackendBanner() {
  const backendAvailable = useAppStore((state) => state.backendAvailable);
  const setBackendAvailable = useAppStore((state) => state.setBackendAvailable);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await api.checkHealth();
        setBackendAvailable(true);
      } catch {
        setBackendAvailable(false);
      }
    };
    checkBackend();
  }, [setBackendAvailable]);

  if (backendAvailable) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-sm flex items-center justify-center gap-2">
      <WifiOff size={14} />
      Backend service unavailable
    </div>
  );
}
