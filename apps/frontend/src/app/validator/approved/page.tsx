'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Input } from '../../../components/ui/Input';
import { ClipboardCheck, Search as SearchIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { api } from '../../../lib/api';

interface ApprovedResponse {
  id: string;
  question: string;
  response: string;
  validator: string;
  date: string;
}

export default function ValidatorApprovedPage() {
  const [approved, setApproved] = useState<ApprovedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchApproved();
  }, [page, search]);

  const fetchApproved = async () => {
    setLoading(true);
    try {
      const response = await api.request<{ success: boolean; data: { reviews: ApprovedResponse[]; pagination: { total: number; page: number; limit: number; totalPages: number } } }>(
        `/validation/approved?page=${page}&limit=20&search=${encodeURIComponent(search)}`
      );
      setApproved(response.data.reviews);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch approved responses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Approved Responses</h1>
          <p className="text-sm text-muted-foreground">Previously validated responses</p>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search approved responses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <ClipboardCheck size={18} className="text-blue-600" />
              Approved Items ({approved.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6 sm:py-8 text-sm">Loading...</div>
            ) : (
              <>
                <div className="space-y-2.5 sm:space-y-4">
                  {approved.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 sm:p-4 border border-border rounded-lg gap-2">
                      <div>
                        <p className="text-sm sm:text-base font-medium text-foreground">{item.question}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{item.validator}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="success" className="text-xs">
                          approved
                        </Badge>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {new Date(item.date).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

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