'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { TextArea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Send, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { AIResponse } from '../../types';

export default function AskPage() {
  const [question, setQuestion] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [response, setResponse] = React.useState<AIResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

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
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Ask AI</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Submit your medical question for AI-powered evidence-based response</p>
      </motion.div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>New Question</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {response && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>AI Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{response.summary}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}