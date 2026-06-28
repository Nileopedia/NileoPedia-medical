'use client';

import React, { useEffect, useState, use } from 'react';
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
    keyRecommendations?: string[];
    sections?: Record<string, string>;
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

export default function ValidatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const reviewId = resolvedParams.id;
  const [review, setReview] = useState<ValidationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const user = useAppStore((state) => state.user);

  useEffect(() => {
    if (user?.role === 'validator' || user?.role === 'admin') {
      fetchReview();
    }
  }, [user, reviewId]);

  const fetchReview = async () => {
    setLoading(true);
    try {
      // Try to get from history first
      const history = await api.getValidationHistory();
      const found = history.find((h) => h.id === reviewId);
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
      const pendingFound = pending.find((p) => p.aiResponseId === reviewId || p.id === reviewId);
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
        <div className="p-4 sm:p-6 text-sm sm:text-base">Loading review details...</div>
      </AppLayout>
    );
  }

  if (!review) {
    return (
      <AppLayout>
        <div className="p-4 sm:p-6 text-sm sm:text-base">Review not found</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => window.history.back()}
            className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground touch-target"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Review Details</h1>
            <p className="text-sm text-muted-foreground">AI-generated response awaiting validation</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Question</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-foreground">{review.aiResponse?.question?.questionText || 'Unknown query'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">AI Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-1.5 sm:mb-2 text-xs sm:text-sm">Summary</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">{review.aiResponse?.summary || 'No summary available'}</p>
              </div>

              {review.aiResponse?.keyRecommendations && review.aiResponse.keyRecommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-1.5 sm:mb-2 text-xs sm:text-sm">Key Recommendations</h4>
                  <ul className="list-disc list-inside space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-muted-foreground">
                    {review.aiResponse.keyRecommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {review.aiResponse?.sections && Object.entries(review.aiResponse.sections).filter(([, v]) => v && v.trim().length > 0).length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-1.5 sm:mb-2 text-xs sm:text-sm">Detailed Explanation</h4>
                  {Object.entries(review.aiResponse.sections).filter(([, v]) => v && v.trim().length > 0).map(([section, content]) => (
                    <div key={section} className="mb-2">
                      <h5 className="text-xs sm:text-sm font-medium text-foreground capitalize">{section.replace(/([A-Z])/g, ' $1').trim()}</h5>
                      <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>
                    </div>
                  ))}
                </div>
              )}

              {review.aiResponse?.citations && review.aiResponse.citations.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-1.5 sm:mb-2 text-xs sm:text-sm">Citations</h4>
                  <div className="space-y-1.5 sm:space-y-2">
                    {review.aiResponse.citations.map((citation, i) => (
                      <div key={i} className="p-2.5 sm:p-3 bg-muted rounded-lg">
                        <p className="font-medium text-foreground text-xs sm:text-sm">{citation.title}</p>
                        <p className="text-xs text-muted-foreground">{citation.authors} ({citation.year})</p>
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
              <CardTitle className="text-sm sm:text-base">Validation Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-2">
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
                  className="w-full sm:w-auto"
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
                  className="w-full sm:w-auto"
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
              <CardTitle className="text-sm sm:text-base">Review Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-xs sm:text-sm"><strong>Score:</strong> {review.score}/5</p>
                {review.feedback && <p className="text-xs sm:text-sm"><strong>Feedback:</strong> {review.feedback}</p>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}