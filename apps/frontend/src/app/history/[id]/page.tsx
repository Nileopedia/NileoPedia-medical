'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { AppLayout } from '../../../components/layout/AppLayout';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { useToast } from '../../../components/ui/Toast';
import { ResponseViewer } from '../../../components/query/ResponseViewer';

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<any>(null);

  const questionId = params.id as string;

  useEffect(() => {
    if (!questionId) return;
    fetchQuestion();
  }, [questionId]);

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const data = await api.getQuestion(questionId);
      setQuestion(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load question';
      if (msg === 'Please sign in to continue') {
        router.push('/login');
      } else {
        addToast({ type: 'error', title: 'Failed to load question details' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!question || !question.aiResponse) {
    return (
      <AppLayout>
        <div className="space-y-4 sm:space-y-6">
          <button onClick={() => router.back()} className="flex items-center text-primary hover:text-primary/80">
            <ArrowLeft size={16} className="mr-2" /> Back
          </button>
          <p className="text-sm text-muted-foreground">No response found for this question.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <button onClick={() => router.back()} className="flex items-center text-primary hover:text-primary/80">
          <ArrowLeft size={16} className="mr-2" /> Back to History
        </button>

        <Card>
          <CardHeader>
            <CardTitle>Question</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">{question.questionText}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(question.createdAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <ResponseViewer response={question.aiResponse} />
      </div>
    </AppLayout>
  );
}
