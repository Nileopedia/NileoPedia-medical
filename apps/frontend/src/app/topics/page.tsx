'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '../../components/layout/AppLayout';
import { api } from '../../lib/api';
import { Search, Loader2, ArrowRight, BookOpen } from 'lucide-react';

export default function TopicsPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [topics, setTopics] = useState<Array<{ name: string; category: string; documentCount: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = async (nextQuery = query, nextSpecialty = specialty) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getMedicalTopics(nextQuery, nextSpecialty === 'All' ? undefined : nextSpecialty);
      setTopics(response.topics || []);
      setSpecialties(response.specialties || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medical topics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTopics();
  }, []);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    await fetchTopics(query, specialty);
  };

  const handleTopicClick = (topicName: string) => {
    router.push(`/ask?q=${encodeURIComponent(topicName)}`);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Medical Topics</h1>
            <p className="text-sm text-muted-foreground">Browse evidence-backed specialties and conditions from the NileoPedia knowledge base.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 text-sm text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
            <BookOpen className="h-4 w-4" />
            {topics.length} topics
          </div>
        </div>

        <form onSubmit={handleSearch} className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search conditions, treatments, or topics..."
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <select
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
              className="w-full px-3 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="All">All specialties</option>
              {specialties.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <button
              type="submit"
              className="px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 text-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading topics...
          </div>
        ) : topics.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
            No topics match the current search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {topics.map((topic) => (
              <button
                key={`${topic.name}-${topic.category}`}
                type="button"
                onClick={() => handleTopicClick(topic.name)}
                className="group rounded-xl border border-border bg-card p-4 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md text-foreground"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{topic.name}</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mt-1">{topic.category}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-500 transition group-hover:translate-x-1" />
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span>{topic.documentCount} documents</span>
                  <span className="text-blue-600 dark:text-blue-300">Ask AI</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
