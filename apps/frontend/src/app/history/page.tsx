'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../lib/api';
import { Query } from '../../types';
import { Search } from 'lucide-react';

export default function HistoryPage() {
  const [search, setSearch] = React.useState('');
  const [queries, setQueries] = React.useState<Query[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getHistory();
      const formatted: Query[] = data.map((q: any) => ({
        id: q.id,
        question: q.questionText,
        category: q.category || 'General',
        status: q.aiResponse?.status || q.status || 'pending',
        createdAt: new Date(q.createdAt).toLocaleDateString(),
        updatedAt: new Date(q.updatedAt).toLocaleDateString(),
        userId: q.userId,
      }));
      setQueries(formatted);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredQueries = queries.filter(q => 
    q.question.toLowerCase().includes(search.toLowerCase()) ||
    q.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Query History</h1>
        <p className="text-slate-600 dark:text-slate-400">View all your previous medical queries</p>
      </motion.div>

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQueries.map((query) => (
                <TableRow key={query.id}>
                  <TableCell className="font-medium">{query.question}</TableCell>
                  <TableCell>{query.category}</TableCell>
                  <TableCell>
                    <Badge variant={query.status === 'approved' ? 'success' : query.status === 'pending' ? 'warning' : 'default'}>
                      {query.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{query.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}