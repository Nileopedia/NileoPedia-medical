'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  const { user } = useAppStore();
  const [showResponse, setShowResponse] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);

  const handleSubmitQuery = async (query: string) => {
    setLoading(true);
    try {
      const result = await api.askQuestion(query);
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
    } catch (err) {
      console.error('Failed to submit query:', err);
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
          <p className="text-slate-600 dark:text-slate-400">Ask medical questions and get evidence-based answers validated by experts</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Queries" value={stats.totalQueries.toString()} icon={<MessageCircleQuestion size={20} className="text-blue-600" />} />
          <StatCard title="Pending Reviews" value={stats.pendingReviews.toString()} icon={<Clock size={20} className="text-amber-600" />} />
          <StatCard title="Saved Responses" value={stats.savedResponses.toString()} icon={<Bookmark size={20} className="text-emerald-600" />} />
          <StatCard title="Avg Response Time" value={stats.avgResponseTime} icon={<History size={20} className="text-purple-600" />} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <QueryInput onSubmit={handleSubmitQuery} loading={loading} />
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