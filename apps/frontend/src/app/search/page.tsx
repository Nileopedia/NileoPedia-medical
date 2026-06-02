'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Search as SearchIcon } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setResults([
      { id: '1', title: 'Diabetes Management Guidelines', snippet: 'Evidence-based approach to Type 2 diabetes...' },
      { id: '2', title: 'Hypertension Treatment', snippet: 'Latest AHA guidelines for blood pressure control...' },
    ]);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Search</h1>
        <p className="text-slate-600 dark:text-slate-400">Search medical literature and responses</p>

        <form onSubmit={handleSearch} className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medical knowledge..."
            className="w-full pl-12 pr-32 py-4 border border-slate-300 dark:border-slate-600 rounded-xl text-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Search
          </button>
        </form>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Search Results</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result) => (
                  <div key={result.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <h3 className="font-medium text-slate-900 dark:text-slate-50">{result.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{result.snippet}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}