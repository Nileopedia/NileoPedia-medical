'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';

export default function ValidatorFeedbackPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Feedback Reports</h1>
        <p className="text-slate-600 dark:text-slate-400">Submit feedback on validated responses</p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Feedback Form</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">Feedback functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}