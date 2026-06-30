'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { MessageSquare, Search as SearchIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { api } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../components/ui/Toast';

interface FeedbackReport {
  id: string;
  question: string;
  userFeedback: string;
  rating: number;
  reportedIssue: string;
  date: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
}

export default function ValidatorFeedbackPage() {
  const [feedbackReports, setFeedbackReports] = useState<FeedbackReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchFeedbackReports();
  }, [page, search]);

  const fetchFeedbackReports = async () => {
    setLoading(true);
    try {
      const response = await api.request<{ success: boolean; data: { reports: FeedbackReport[]; pagination: { total: number; page: number; limit: number; totalPages: number } } }>(
        `/validation/feedback?page=${page}&limit=20&search=${encodeURIComponent(search)}`
      );
      const reports = response.data?.reports ?? [];
      setFeedbackReports(reports);
      setTotalPages(response.data?.pagination?.totalPages ?? 1);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch feedback reports';
      if (msg === 'Please sign in to continue') {
        router.push('/login');
      } else {
        console.error('Failed to fetch feedback reports:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSeverity = async (reportId: string, severity: string) => {
    try {
      await api.request(`/validation/feedback/${reportId}`, {
        method: 'PATCH',
        body: JSON.stringify({ severity }),
      });
      addToast({ type: 'success', title: 'Severity updated' });
      fetchFeedbackReports();
    } catch {
      addToast({ type: 'error', title: 'Failed to update severity' });
    }
  };

  const handleUpdateStatus = async (reportId: string, status: string) => {
    try {
      await api.request(`/validation/feedback/${reportId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      addToast({ type: 'success', title: 'Status updated' });
      fetchFeedbackReports();
    } catch {
      addToast({ type: 'error', title: 'Failed to update status' });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Feedback Reports</h1>
          <p className="text-sm text-muted-foreground">Review user feedback on validated responses</p>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search feedback reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <MessageSquare size={18} className="text-blue-600" />
              Reports ({feedbackReports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6 sm:py-8 text-sm">Loading feedback reports...</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>User Feedback</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbackReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium text-foreground max-w-xs truncate">{report.question}</TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">{report.userFeedback}</TableCell>
                        <TableCell>
                          <span className="text-foreground font-medium">{report.rating}/5</span>
                        </TableCell>
                        <TableCell>
                          <select
                            value={report.severity}
                            onChange={(e) => handleUpdateSeverity(report.id, e.target.value)}
                            className="text-xs border border-border rounded px-2 py-1 bg-input text-foreground"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <select
                            value={report.status}
                            onChange={(e) => handleUpdateStatus(report.id, e.target.value)}
                            className="text-xs border border-border rounded px-2 py-1 bg-input text-foreground"
                          >
                            <option value="open">Open</option>
                            <option value="investigating">Investigating</option>
                            <option value="resolved">Resolved</option>
                            <option value="escalated">Escalated</option>
                          </select>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(report.date).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-3 sm:mt-4">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                      <ChevronLeft size={14} /> Previous
                    </Button>
                    <span className="text-xs sm:text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                      Next <ChevronRight size={14} />
                    </Button>
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