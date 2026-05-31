'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search as SearchIcon } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Search</h1>
          <p className="text-slate-600 dark:text-slate-400">Search medical literature and responses</p>
        </motion.div>

        <form onSubmit={handleSearch} className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medical knowledge..."
            className="w-full pl-12 pr-32 py-4 border border-slate-300 dark:border-slate-600 rounded-xl text-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
            Search
          </Button>
        </form>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
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