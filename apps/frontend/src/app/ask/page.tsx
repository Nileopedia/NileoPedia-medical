'use client';

import React, { useState } from 'react';
import { TextArea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Send, Loader2 } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { api } from '../../lib/api';
import { AIResponse } from '../../types';

export default function AskPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await api.askQuestion(question.trim());
      setResponse({
        id: `resp-${result.questionId}`,
        queryId: result.questionId,
        title: question,
        summary: `Your question has been submitted for processing.`,
        keyFindings: ['Question submitted successfully', 'Response will be generated shortly'],
        detailedExplanation: '',
        citations: [],
        status: 'pending',
        confidenceScore: 0,
        model: 'Processing',
        generatedAt: new Date().toISOString(),
        tags: [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Ask AI</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Submit your medical question for AI-powered evidence-based response</p>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">New Question</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Medical Question
                </label>
                <TextArea
                  placeholder="Enter your medical question... (e.g., What are the latest guidelines for hypertension management in elderly patients?)"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" disabled={loading || !question.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Response...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Query
                  </>
                )}
              </Button>
            </form>
          </div>

          {response && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">AI Response</h2>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{response.summary}</p>
            </div>
          )}

          {error && (
            <div className="bg-white rounded-xl border border-red-200 p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}