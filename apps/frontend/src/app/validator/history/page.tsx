'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Input } from '../../../components/ui/Input';
import { Clock, Search as SearchIcon, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { api, ValidationReview } from '../../../lib/api';

export default function ValidatorHistoryPage() {
  const [history, setHistory] = useState<ValidationReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, [search, dateFilter, page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params: { page?: number; limit?: number; startDate?: string } = { page, limit: 20 };
      if (dateFilter) params.startDate = dateFilter;
      const result = await api.request<{ success: boolean; data: { reviews: ValidationReview[]; pagination: { total: number; page: number; limit: number; totalPages: number } } }>(
        `/validation/history?page=${params.page}&limit=${params.limit}&search=${encodeURIComponent(search)}${dateFilter ? `&startDate=${dateFilter}` : ''}`
      );
      setHistory(result.data.reviews);
      setTotalPages(result.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch validation history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Validation History</h1>
          <p className="text-sm text-muted-foreground">Your validation activity log</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4"
            />
          </div>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full sm:w-auto"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Clock size={18} className="text-blue-600" />
              Activity Log ({history.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6 sm:py-8 text-sm">Loading history...</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Decision</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-foreground">
                          {item.aiResponse?.question?.questionText || item.aiResponse?.title || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.status === 'approved' ? 'success' : 'danger'} className="text-xs">
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(item.reviewedAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.score ?? '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-3 sm:mt-4">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <ChevronLeft size={14} />
                      Previous
                    </button>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      Next
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}