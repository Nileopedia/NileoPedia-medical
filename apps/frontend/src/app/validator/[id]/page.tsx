'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, X, ArrowLeft } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import type { ValidationReview } from '@/types';

interface ValidationDetail {
  id: string;
  aiResponseId: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  score?: number;
  feedback?: string;
  reviewedAt: string;
  aiResponse?: ValidationReview['aiResponse'] & {
    summary?: string;
    keyFindings?: string[];
    detailedExplanation?: string;
    citations?: Array<{
      id?: string;
      title: string;
      authors?: string;
      journal?: string;
      year?: number;
    }>;
    question?: {
      questionText: string;
    };
  };
}

export default function ValidatorDetailPage({ params }: { params: { id: string } }) {
  const [review, setReview] = useState<ValidationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const user = useAppStore((state) => state.user);

  useEffect(() => {
    if (user?.role === 'validator' || user?.role === 'admin') {
      fetchReview();
    }
  }, [user, params.id]);

  const fetchReview = async () => {
    setLoading(true);
    try {
      // Try to get from history first
      const history = await api.getValidationHistory();
      const found = history.find((h) => h.id === params.id);
      if (found) {
        setReview({
          ...found,
          aiResponseId: found.aiResponseId,
          status: found.status.toUpperCase() as 'APPROVED' | 'REJECTED' | 'PENDING',
        });
        return;
      }

      // If not found in history, try to get from pending reviews
      const pending = await api.getPendingReviews();
      const pendingFound = pending.find((p) => p.aiResponseId === params.id || p.id === params.id);
      if (pendingFound) {
        setReview({
          id: pendingFound.id,
          aiResponseId: pendingFound.aiResponseId || pendingFound.id,
          status: 'PENDING',
          reviewedAt: pendingFound.submittedAt,
          aiResponse: {
            title: pendingFound.title,
            question: {
              questionText: pendingFound.title,
            },
          },
        });
      }
    } catch (error) {
      console.error('Failed to fetch review:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">Loading review details...</div>
      </AppLayout>
    );
  }

  if (!review) {
    return (
      <AppLayout>
        <div className="p-6">Review not found</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Review Details</h1>
            <p className="text-muted-foreground">AI-generated response awaiting validation</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Question</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">{review.aiResponse?.question?.questionText || 'Unknown query'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">Summary</h4>
                <p className="text-muted-foreground">{review.aiResponse?.summary || 'No summary available'}</p>
              </div>

              {review.aiResponse?.keyFindings && review.aiResponse.keyFindings.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Key Findings</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {review.aiResponse.keyFindings.map((finding, i) => (
                      <li key={i}>{finding}</li>
                    ))}
                  </ul>
                </div>
              )}

              {review.aiResponse?.detailedExplanation && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Detailed Explanation</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{review.aiResponse.detailedExplanation}</p>
                </div>
              )}

              {review.aiResponse?.citations && review.aiResponse.citations.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Citations</h4>
                  <div className="space-y-2">
                    {review.aiResponse.citations.map((citation, i) => (
                      <div key={i} className="p-3 bg-muted rounded-lg">
                        <p className="font-medium text-foreground">{citation.title}</p>
                        <p className="text-sm text-muted-foreground">{citation.authors} ({citation.year})</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {review.status === 'PENDING' && (
          <Card>
            <CardHeader>
              <CardTitle>Validation Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  variant="success"
                  onClick={async () => {
                    setActionLoading(true);
                    try {
                      await api.approveReview(review.aiResponseId, 5, 'Approved');
                      window.history.back();
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  disabled={actionLoading}
                >
                  <Check size={16} className="mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    setActionLoading(true);
                    try {
                      await api.rejectReview(review.aiResponseId, 'Rejected during review');
                      window.history.back();
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  disabled={actionLoading}
                >
                  <X size={16} className="mr-2" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {review.score !== undefined && (
          <Card>
            <CardHeader>
              <CardTitle>Review Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Score:</strong> {review.score}/5</p>
                {review.feedback && <p><strong>Feedback:</strong> {review.feedback}</p>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}