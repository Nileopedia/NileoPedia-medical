'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { api } from '../../lib/api';

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  source: string;
  relevanceScore: number;
  specialty?: string;
}

type SearchResultResponse = {
  query: string;
  results: SearchResult[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  searchType: 'semantic' | 'keyword' | 'hybrid';
};

function SearchContent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'semantic' | 'keyword' | 'hybrid'>('hybrid');
  const searchParams = useSearchParams();

  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const response = await api.search(searchQuery, searchType, 10);
      setResults(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await performSearch(query);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Search</h1>
      <p className="text-slate-600 dark:text-slate-400">Search medical literature and responses</p>

      <form onSubmit={handleSearch} className="relative">
        <div className="flex gap-2 mb-3">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'semantic' | 'keyword' | 'hybrid')}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="hybrid">Hybrid Search</option>
            <option value="semantic">Semantic Only</option>
            <option value="keyword">Keyword Only</option>
          </select>
        </div>

        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search medical knowledge..."
          className="w-full pl-12 pr-32 py-4 border border-slate-300 dark:border-slate-600 rounded-xl text-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={loading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : null}
          Search
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {loading && results.length === 0 && (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-slate-500" size={32} />
        </div>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Search Results ({results.length})
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <h3 className="font-medium text-slate-900 dark:text-slate-50">{result.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{result.snippet}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{result.source}</span>
                    {result.specialty && (
                      <>
                        <span>•</span>
                        <span>{result.specialty}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{Math.round(result.relevanceScore * 100)}% relevance</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="text-center py-8 text-slate-500">Loading...</div>}>
        <SearchContent />
      </Suspense>
    </AppLayout>
  );
}