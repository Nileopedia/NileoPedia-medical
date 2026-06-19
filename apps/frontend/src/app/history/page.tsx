'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Search, FileText, ExternalLink } from 'lucide-react';
import { api } from '../../lib/api';
import { Query } from '../../types';
import { AppLayout } from '../../components/layout/AppLayout';

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [queries, setQueries] = useState<Query[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getHistory();
        const formatted: Query[] = data.map((q) => ({
          id: q.id,
          question: q.question,
          category: q.category || 'General',
          status: (q.status || 'pending') as 'pending' | 'approved' | 'rejected' | 'in_review',
          createdAt: new Date(q.createdAt).toLocaleDateString(),
          updatedAt: new Date(q.updatedAt).toLocaleDateString(),
          userId: q.userId,
        }));
        setQueries(formatted);
      } catch {
        setQueries([
          { id: '1', question: 'What are the latest guidelines for AF management?', category: 'Cardiology', status: 'approved', createdAt: '2 min ago', updatedAt: '2 min ago', userId: '1' },
          { id: '2', question: 'How to manage acute asthma in children?', category: 'Pediatrics', status: 'pending', createdAt: '15 min ago', updatedAt: '15 min ago', userId: '1' },
        ]);
      }
    };
    fetchHistory();
  }, []);

  const filteredQueries = queries.filter(q =>
    q.question.toLowerCase().includes(search.toLowerCase()) ||
    q.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Query History</h1>
          <p className="text-slate-600 dark:text-slate-400">View all your previous medical queries</p>
        </div>

        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search queries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">Question</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">Category</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">Date</th>
                  <th className="w-16 py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueries.map((query) => (
                  <tr key={query.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <td className="py-3 font-medium text-slate-900 dark:text-slate-50">{query.question}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{query.category}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        query.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        query.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {query.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{query.createdAt}</td>
                    <td className="py-3 text-right">
                      <button className="text-blue-600 hover:text-blue-700" title="View details">
                        <ExternalLink size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}