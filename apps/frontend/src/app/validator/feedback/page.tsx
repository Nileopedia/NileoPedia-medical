'use client';

import React from 'react';
import { TextArea } from '../../../components/ui/Input';
import { AppLayout } from '../../../components/layout/AppLayout';

export default function ValidatorFeedbackPage() {
  const [feedback, setFeedback] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Feedback Reports</h1>
          <p className="text-slate-600 dark:text-slate-400">Submit feedback on validated responses</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Submit Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Your Feedback
              </label>
              <TextArea
                placeholder="Provide feedback on AI responses or validation process..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
                required
              />
            </div>
            <button type="submit" disabled={!feedback.trim()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {submitted ? 'Feedback Sent!' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}