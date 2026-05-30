'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TextArea } from '../../../components/ui/Input';
import { Send } from 'lucide-react';

export default function ValidatorFeedbackPage() {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Feedback Reports</h1>
        <p className="text-slate-600 dark:text-slate-400">Submit feedback on validated responses</p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
        </CardHeader>
        <CardContent>
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
            <Button type="submit" disabled={!feedback.trim()}>
              {submitted ? 'Feedback Sent!' : 'Submit Feedback'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}