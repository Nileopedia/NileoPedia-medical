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
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Feedback Reports</h1>
          <p className="text-sm text-muted-foreground">Submit feedback on validated responses</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Submit Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                Your Feedback
              </label>
              <TextArea
                placeholder="Provide feedback on AI responses or validation process..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                required
              />
            </div>
            <button type="submit" disabled={!feedback.trim()} className="flex items-center gap-2 px-4 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto">
              {submitted ? 'Feedback Sent!' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}