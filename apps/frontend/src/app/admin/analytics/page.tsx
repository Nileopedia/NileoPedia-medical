'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { BarChart3, MessageCircleQuestion, Users, Brain, FileText } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { api } from '../../../lib/api';

interface AnalyticsData {
  totalUsers?: number;
  totalValidators?: number;
  totalDocuments?: number;
  totalResponses?: number;
  pendingReviews?: number;
  totalVectors?: number;
  queriesPerDay?: Record<string, number>;
  documentsPerDay?: Record<string, number>;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.request<{ success: boolean; data: AnalyticsData }>('/admin/analytics');
      setAnalytics(data.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4 sm:space-y-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Analytics</h1>
          <div className="text-center py-6 text-sm">Loading analytics...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Analytics</h1>
          <p className="text-sm text-muted-foreground">Platform analytics and metrics</p>
        </div>

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
                <MessageCircleQuestion size={18} className="text-amber-600" />
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
                <BarChart3 size={18} className="text-blue-600" />
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
                <Brain size={18} className="text-emerald-600" />
                Pinecone Vectors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{analytics?.totalVectors ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <BarChart3 size={18} className="text-blue-600" />
              Query Trends (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(analytics?.queriesPerDay || {}).map(([date, count]) => (
                <div key={date} className="flex items-center gap-2 sm:gap-4">
                  <span className="w-20 sm:w-24 text-muted-foreground text-sm">{date}</span>
                  <div className="flex-1 min-w-0">
                    <div className="h-2 bg-muted rounded">
                      <div className="h-full bg-blue-600 rounded" style={{ width: `${Math.min((count as number) * 10, 100)}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 inline-block">Queries: {count as number}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <FileText size={18} className="text-emerald-600" />
              Document Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(analytics?.documentsPerDay || {}).map(([date, count]) => (
                <div key={date} className="flex items-center gap-2 sm:gap-4">
                  <span className="w-20 sm:w-24 text-muted-foreground text-sm">{date}</span>
                  <div className="flex-1 min-w-0">
                    <div className="h-2 bg-muted rounded">
                      <div className="h-full bg-emerald-600 rounded" style={{ width: `${Math.min((count as number) * 20, 100)}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 inline-block">Documents: {count as number}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}