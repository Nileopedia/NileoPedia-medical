'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Bookmark, Eye, Trash2, ChevronLeft, ChevronRight, Search, Loader2 } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../lib/api';
import { Query } from '../../types';

export default function SavedPage() {
  const [savedItems, setSavedItems] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchSaved();
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const result = await api.getSavedResponses({ page, limit: 10, search: search || undefined });
      const formatted: Query[] = result.questions.map((q) => ({
        id: q.id,
        question: q.question,
        category: q.category,
        status: q.status,
        createdAt: new Date(q.createdAt).toLocaleDateString(),
        updatedAt: new Date(q.updatedAt).toLocaleDateString(),
        userId: q.userId,
        isSaved: q.isSaved,
      }));
      setSavedItems(formatted);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (err) {
      if ((err as Error).message === 'Please sign in to continue') {
        router.push('/login');
      } else {
        addToast({ type: 'error', title: 'Failed to load saved responses' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    try {
      await api.unsaveResponse(questionId);
      setSavedItems((prev) => prev.filter((q) => q.id !== questionId));
      addToast({ type: 'success', title: 'Removed from saved responses' });
    } catch {
      addToast({ type: 'error', title: 'Failed to remove saved response' });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Saved Responses</h1>
          <p className="text-sm text-muted-foreground">Your bookmarked medical responses</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Bookmark size={18} className="text-blue-600" />
              Saved Items ({total})
            </CardTitle>
            <div className="mt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="Search saved responses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : savedItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No saved responses found</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-foreground max-w-xs truncate">{item.question}</TableCell>
                        <TableCell className="text-muted-foreground">{item.category}</TableCell>
                        <TableCell className="text-muted-foreground">{item.createdAt}</TableCell>
                        <TableCell className="text-center space-x-1.5 sm:space-x-2">
                          <button className="text-primary hover:text-primary/80" title="View" onClick={() => router.push(`/history/${item.id}`)}>
                            <Eye size={16} />
                          </button>
                          <button className="text-red-600 hover:text-red-700" title="Remove" onClick={() => handleDelete(item.id)}>
                            <Trash2 size={16} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-3 sm:mt-4">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50">
                      <ChevronLeft size={14} /> Previous
                    </button>
                    <span className="text-xs sm:text-sm text-muted-foreground">Page {page} of {totalPages} ({total} total)</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50">
                      Next <ChevronRight size={14} />
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
