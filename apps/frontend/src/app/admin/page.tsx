'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RefreshCw, CheckCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { api } from '../../lib/api';
import { useAppStore } from '../../store/appStore';

export default function AdminPage() {
  const [ingestionStatus, setIngestionStatus] = useState<{
    isRunning: boolean;
    isActive: boolean;
    sources: number;
  }>({ isRunning: false, isActive: false, sources: 0 });
  const [loading, setLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const user = useAppStore((state) => state.user);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStatus();
    }
  }, [user]);

  const fetchStatus = async () => {
    try {
      const status = await api.getIngestionStatus();
      setIngestionStatus(status);
    } catch (error) {
      console.error('Failed to fetch ingestion status:', error);
    }
  };

  const handleRunIngestion = async () => {
    setLoading(true);
    try {
      await api.runScheduledIngestion();
      await fetchStatus();
    } catch (error) {
      console.error('Failed to run ingestion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrementalRefresh = async () => {
    setRefreshLoading(true);
    try {
      await api.runIncrementalRefresh();
      await fetchStatus();
    } catch (error) {
      console.error('Failed to run incremental refresh:', error);
    } finally {
      setRefreshLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Access denied. Admin privileges required.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage system ingestion and knowledge base</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Document Ingestion</h2>
              <div className="flex items-center gap-2">
                {ingestionStatus.isActive ? (
                  <CheckCircle className="text-green-500" size={20} />
                ) : (
                  <AlertCircle className="text-slate-400" size={20} />
                )}
                <span className="text-sm text-slate-500">
                  {ingestionStatus.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300 mb-4">
              <p>Status: {ingestionStatus.isRunning ? 'Running' : 'Idle'}</p>
              <p>Data Sources: {ingestionStatus.sources} journals configured</p>
              <p>Schedule: Daily at 2 AM UTC (full), Sundays at 3 AM UTC (incremental)</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleRunIngestion}
                disabled={loading || ingestionStatus.isRunning}
                variant="default"
              >
                <RefreshCw size={16} className="mr-2" />
                {loading ? 'Running...' : 'Full Ingestion'}
              </Button>
              <Button
                onClick={handleIncrementalRefresh}
                disabled={refreshLoading || ingestionStatus.isRunning}
                variant="outline"
              >
                <RefreshCcw size={16} className="mr-2" />
                {refreshLoading ? 'Refreshing...' : 'Incremental Refresh'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium text-slate-900 dark:text-slate-50 mb-2">Configured Sources</h3>
            <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
              <li>• PubMed Central (General)</li>
              <li>• NEJM (General)</li>
              <li>• The Lancet (General)</li>
              <li>• JAMA (General)</li>
              <li>• Circulation (Cardiology)</li>
              <li>• Diabetes Care (Endocrinology)</li>
              <li>• Journal of Clinical Oncology (Oncology)</li>
              <li>• Neurology (Neurology)</li>
              <li>• Gastroenterology (Gastroenterology)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}