'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Activity, Database, CheckCircle, XCircle } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { api } from '../../../lib/api';

interface SystemStatus {
  embeddings: boolean;
  pinecone: boolean;
  groq: boolean;
  redis: boolean;
  totalDocuments: number;
  totalVectors: number;
  timestamp?: string;
}

export default function AdminSystemHealthPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await api.getSystemStatus();
      setStatus(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const ServiceCard = ({ name, available }: { name: string; available: boolean | undefined }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {available ? (
            <CheckCircle size={20} className="text-emerald-600" />
          ) : (
            <XCircle size={20} className="text-red-600" />
          )}
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {available ? (
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
            Connected
          </span>
        ) : (
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
            Disconnected
          </span>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">System Health</h1>
          <p className="text-muted-foreground">Monitor service status and performance (refreshes every 30 seconds)</p>
          {lastChecked && (
            <p className="text-xs text-muted-foreground mt-2">Last checked: {lastChecked}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ServiceCard name="Embeddings" available={status?.embeddings} />
          <ServiceCard name="Pinecone" available={status?.pinecone} />
          <ServiceCard name="Groq" available={status?.groq} />
          <ServiceCard name="Redis" available={status?.redis} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database size={20} className="text-blue-600" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-foreground">{status?.totalDocuments ?? 0}</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity size={20} className="text-blue-600" />
                Vectors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-foreground">{status?.totalVectors ?? 0}</span>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}