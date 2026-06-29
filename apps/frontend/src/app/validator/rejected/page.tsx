'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { XCircle, Search as SearchIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { api } from '../../../lib/api';
import { useRouter } from 'next/navigation';

interface RejectedResponse {
  id: string;
  question: string;
  reason: string;
  validator: string;
  date: string;
}

export default function ValidatorRejectedPage() {
  const router = useRouter();
  const [rejected, setRejected] = useState<RejectedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRejected();
  }, [page, search]);

  const fetchRejected = async () => {
    setLoading(true);
    try {
      const response = await api.request<{ success: boolean; data: { reviews: RejectedResponse[]; pagination: { total: number; page: number; limit: number; totalPages: number } } }>(
        `/validation/rejected?page=${page}&limit=20&search=${encodeURIComponent(search)}`
      );
      setRejected(response.data?.reviews || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error) {
      if (error instanceof Error && error.message === 'Please sign in to continue') {
        router.push('/login');
      } else {
        console.error('Failed to fetch rejected responses:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Rejected Responses</h1>
          <p className="text-sm text-muted-foreground">Previously rejected responses</p>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search rejected responses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <XCircle size={18} className="text-red-600" />
              Rejected Items ({rejected.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6 sm:py-8 text-sm">Loading...</div>
            ) : (
              <>
                <div className="space-y-2.5 sm:space-y-4">
                  {rejected.map((item) => (
                    <div key={item.id} className="p-3.5 sm:p-4 border border-border rounded-lg">
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <XCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm sm:text-base font-medium text-foreground">{item.question}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{item.validator}</p>
                          <p className="text-xs text-red-600 mt-1">Reason: {item.reason}</p>
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {new Date(item.date).toLocaleString()}
                          </span>
                        </div>
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