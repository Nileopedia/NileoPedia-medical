'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';

export default function ValidatorHistoryPage() {
  const history = [
    { id: '1', title: 'Hypertension guidelines', action: 'approved', date: '2 days ago' },
    { id: '2', title: 'Diabetes management', action: 'approved', date: '1 week ago' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Validation History</h1>
        <p className="text-slate-600 dark:text-slate-400">Your validation activity log</p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300">{item.title}</span>
                <span className={`text-xs px-2 py-1 rounded ${item.action === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {item.action}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}