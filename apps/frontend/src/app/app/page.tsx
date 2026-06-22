'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '../../components/layout/AppLayout';
import { QueryInput } from '../../components/query/QueryInput';
import { ResponseViewer } from '../../components/query/ResponseViewer';
import { StatCard } from '../../components/dashboard/StatCard';
import { TopCategories } from '../../components/dashboard/TopCategories';
import { RecentActivity } from '../../components/dashboard/RecentActivity';
import { useAppStore } from '../../store/appStore';
import { mockCategoryStats, mockActivities } from '../../data/mockData';
import { MessageCircleQuestion, History, Bookmark, Clock } from 'lucide-react';
import { api } from '../../lib/api';
import { AIResponse } from '../../types';

export default function AppPage() {
  const user = useAppStore((state) => state.user);
  const [showResponse, setShowResponse] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmitQuery = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.askQuestion(query);
      if (!result || !result.questionId) throw new Error('Invalid response from AI service');

      const aiResponse: AIResponse = {
        id: `resp-${result.questionId}`,
        queryId: result.questionId,
        title: query,
        summary: 'Your question is being processed by our AI system.',
        keyFindings: ['Response will be available shortly', 'Check back in a few moments'],
        detailedExplanation: '',
        citations: [],
        status: 'pending',
        confidenceScore: 0,
        model: 'Processing',
        generatedAt: new Date().toISOString(),
        tags: [],
      };
      setResponse(aiResponse);
      setShowResponse(true);

      // Integrate actual content from the AI service by polling for the full response
      const pollForFullResponse = async (questionId: string) => {
        let attempts = 0;
        const maxAttempts = 60; // Poll for up to 2 minutes

        const check = async () => {
          try {
            const data = await api.getQuestion(questionId);
            
            // If the status is no longer 'pending', update the response state with rich content
            if (data.aiResponse && data.aiResponse.status !== 'pending') {
              setResponse(data.aiResponse);
            } else if (attempts < maxAttempts) {
              attempts++;
              setTimeout(check, 2000); // Check every 2 seconds
            } else {
              setError('AI processing is taking longer than usual. Please check back in history later.');
            }
          } catch {
            // On transient network errors, retry slightly later
            if (attempts < maxAttempts) {
              attempts++;
              setTimeout(check, 3000);
            }
          }
        };
        setTimeout(check, 2000);
      };

      pollForFullResponse(result.questionId);
    } catch (err) {
      console.error('Failed to submit query:', err);
      setError(err instanceof Error ? err.message : 'Failed to reach AI service');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalQueries: 128,
    pendingReviews: 14,
    savedResponses: 24,
    avgResponseTime: '2.4s',
  };

  if (!mounted) return null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
          <p className="text-muted-foreground">Ask medical questions and get evidence-based answers validated by experts</p>
        </div>

        {user?.role === 'admin' && (
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700">
            <p className="font-semibold">Admin Dashboard Access:</p>
            <p>As an administrator, you have elevated privileges. Access admin-specific tools and reports here.</p>
            <Link href="/admin" className="text-red-600 hover:underline mt-2 block">Go to Admin Panel</Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Queries" value={stats.totalQueries.toString()} icon={<MessageCircleQuestion size={20} className="text-blue-600" />} />
          <StatCard title="Pending Reviews" value={stats.pendingReviews.toString()} icon={<Clock size={20} className="text-amber-600" />} />
          <StatCard title="Saved Responses" value={stats.savedResponses.toString()} icon={<Bookmark size={20} className="text-emerald-600" />} />
          <StatCard title="Avg Response Time" value={stats.avgResponseTime} icon={<History size={20} className="text-purple-600" />} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <QueryInput onSubmit={handleSubmitQuery} loading={loading} />
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
            {showResponse && response && <ResponseViewer response={response} />}
          </div>
          <div className="space-y-6">
            <TopCategories categories={mockCategoryStats} />
            <RecentActivity activities={mockActivities} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
