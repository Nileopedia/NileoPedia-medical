'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RefreshCw, CheckCircle, AlertCircle, RefreshCcw, WifiOff, Users, FileText, MessageCircle } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { api } from '../../lib/api';
import { useAppStore } from '../../store/appStore';
import { useRouter } from 'next/navigation';

interface AnalyticsData {
  totalUsers?: number;
  totalValidators?: number;
  totalDocuments?: number;
  totalResponses?: number;
  pendingReviews?: number;
  totalVectors?: number;
}

export default function AdminPage() {
  const [ingestionStatus, setIngestionStatus] = useState<{
    isRunning: boolean;
    isActive: boolean;
    sources: number;
  }>({ isRunning: false, isActive: false, sources: 9 });
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const user = useAppStore((state) => state.user);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStatus();
      fetchAnalytics();
    }
  }, [user]);

  const fetchStatus = async () => {
    try {
      const status = await api.getIngestionStatus();
      setIngestionStatus(status);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.message === 'Please sign in to continue') {
        router.push('/login');
      } else {
        setError(err instanceof Error ? err.message : 'Connection failed');
      }
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await api.request<{ success: boolean; data: AnalyticsData }>('/admin/analytics');
      setAnalytics(data.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const handleRunIngestion = async () => {
    setLoading(true);
    try {
      await api.runScheduledIngestion();
      await fetchStatus();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to run ingestion';
      if (msg === 'Please sign in to continue') {
        router.push('/login');
      } else {
        setError(msg);
      }
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
      const msg = error instanceof Error ? error.message : 'Failed to run incremental refresh';
      if (msg === 'Please sign in to continue') {
        router.push('/login');
      } else {
        setError(msg);
      }
    } finally {
      setRefreshLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-48 sm:h-64">
          <p className="text-muted-foreground text-sm">Access denied. Admin privileges required.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage system and monitor platform metrics</p>
        </div>

        {error && (
          <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-lg flex items-center gap-2">
            <WifiOff className="text-amber-600" size={16} />
            <p className="text-xs sm:text-sm text-amber-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Users size={18} className="text-blue-600" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{analytics?.totalUsers ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Users size={18} className="text-emerald-600" />
                Total Validators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{analytics?.totalValidators ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <FileText size={18} className="text-purple-600" />
                Total Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{analytics?.totalDocuments ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <MessageCircle size={18} className="text-amber-600" />
                Total AI Queries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{analytics?.totalResponses ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <AlertCircle size={18} className="text-red-600" />
                Pending Validations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{analytics?.pendingReviews ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <FileText size={18} className="text-blue-600" />
                Pinecone Vectors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{analytics?.totalVectors ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">Document Ingestion</h2>
              <div className="flex items-center gap-2">
                {ingestionStatus.isActive ? (
                  <CheckCircle className="text-emerald-500" size={18} />
                ) : (
                  <AlertCircle className="text-muted-foreground" size={18} />
                )}
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {ingestionStatus.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="grid gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              <p>Status: {ingestionStatus.isRunning ? 'Running' : 'Idle'}</p>
              <p>Data Sources: {ingestionStatus.sources} journals configured</p>
              <p>Schedule: Daily at 2 AM UTC (full), Sundays at 3 AM UTC (incremental)</p>
              <p className="text-xs text-muted-foreground/70">Note: Run ingestion to populate knowledge base with demo documents</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleRunIngestion}
                disabled={loading || ingestionStatus.isRunning}
                variant="primary"
                className="w-full sm:w-auto"
              >
                <RefreshCw size={16} className="mr-2" />
                {loading ? 'Running...' : 'Full Ingestion'}
              </Button>
              <Button
                onClick={handleIncrementalRefresh}
                disabled={refreshLoading || ingestionStatus.isRunning}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <RefreshCcw size={16} className="mr-2" />
                {refreshLoading ? 'Refreshing...' : 'Incremental Refresh'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-medium text-foreground mb-1.5 sm:mb-2 text-sm">Configured Sources</h3>
            <ul className="text-xs sm:text-sm text-muted-foreground space-y-0.5 sm:space-y-1">
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