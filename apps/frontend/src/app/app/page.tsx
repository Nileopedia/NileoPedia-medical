'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/appStore';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { MessageCircleQuestion, Bookmark, Brain, Clock } from 'lucide-react';

export default function AppPage() {
  const user = useAppStore((state) => state.user);
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<{
    totalQueries: number;
    savedResponses: number;
    aiResponsesGenerated: number;
    pendingResponses: number;
    approvedResponses: number;
    avgResponseTime: string;
    topCategories: Array<{ name: string; count: number }>;
    dailyTrends: Record<string, number>;
    activities: Array<{ id: string; type: string; title: string; description: string; status: string; timestamp: string }>;
    recentQueries: Array<{ id: string; question: string; category: string; status: string; createdAt: string; updatedAt: string; isSaved: boolean; confidenceScore: number | null; responseTime: number | null }>;
  } | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardAnalytics();
      setAnalytics(data);
    } catch (err) {
      if ((err as Error).message === 'Please sign in to continue') {
        router.push('/login');
        return;
      }
      addToast({ type: 'error', title: 'Failed to load dashboard statistics' });
    } finally {
      setLoading(false);
    }
  };

  const categoryChartData = analytics?.topCategories?.map((cat, i) => ({
    name: cat.name,
    value: cat.count,
    color: ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'][i % 5],
  })) || [];

  const trendData = analytics?.dailyTrends
    ? Object.entries(analytics.dailyTrends).map(([date, count]) => ({ date: date.slice(5), count }))
    : [];

  const recentActivities = analytics?.activities?.map((a) => ({
    id: a.id,
    type: 'query_submitted' as const,
    title: a.title,
    description: a.description,
    status: (a.status === 'approved' ? 'approved' : a.status === 'rejected' ? 'rejected' : 'pending') as 'pending' | 'approved' | 'rejected' | 'info',
    timestamp: a.timestamp,
  })) || [];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!analytics) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </AppLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
          <p className="text-sm text-muted-foreground">Your medical AI assistant dashboard</p>
        </div>

        {user?.role === 'admin' && (
          <div className="bg-red-50 dark:bg-red-900/30 p-3 sm:p-4 rounded-lg border border-red-200 dark:border-red-700">
            <p className="font-semibold text-sm sm:text-base text-red-800 dark:text-red-200">Admin Dashboard Access:</p>
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-300">As an administrator, you have elevated privileges.</p>
            <a href="/admin" className="text-red-600 dark:text-red-400 hover:underline mt-1.5 sm:mt-2 inline-block text-sm">Go to Admin Panel</a>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title="Total Queries" value={analytics.totalQueries.toString()} icon={<MessageCircleQuestion size={20} className="text-blue-600" />} />
          <StatCard title="AI Responses Generated" value={analytics.aiResponsesGenerated.toString()} icon={<Brain size={20} className="text-emerald-600" />} />
          <StatCard title="Saved Responses" value={analytics.savedResponses.toString()} icon={<Bookmark size={20} className="text-purple-600" />} />
          <StatCard title="Avg Response Time" value={analytics.avgResponseTime} icon={<Clock size={20} className="text-amber-600" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Queries Over Time (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                        {getStatusBadge(activity.status)}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Queries</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.recentQueries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No queries yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.recentQueries.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium text-foreground max-w-xs truncate">{q.question}</TableCell>
                      <TableCell className="text-muted-foreground">{q.category}</TableCell>
                      <TableCell>{getStatusBadge(q.status)}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(q.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-muted-foreground">{q.confidenceScore ? `${(q.confidenceScore * 100).toFixed(0)}%` : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
