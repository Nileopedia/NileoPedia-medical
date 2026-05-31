'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Clock } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';

const history = [
  { id: '1', title: 'Hypertension guidelines', action: 'approved', date: '2 days ago' },
  { id: '2', title: 'Diabetes management', action: 'approved', date: '1 week ago' },
];

export default function ValidatorHistoryPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Validation History</h1>
          <p className="text-slate-600 dark:text-slate-400">Your validation activity log</p>
        </motion.div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
            <Clock size={20} className="text-blue-600" />
            Activity Log
          </h2>
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span className="text-slate-700 dark:text-slate-300">{item.title}</span>
                <Badge variant={item.action === 'approved' ? 'success' : 'default'} className="text-xs">
                  {item.action}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}