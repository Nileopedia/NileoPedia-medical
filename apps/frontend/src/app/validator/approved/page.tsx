'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CheckCircle2 } from 'lucide-react';

export default function ValidatorApprovedPage() {
  const approvedItems = [
    { id: '1', title: 'Hypertension Guidelines 2024', category: 'Cardiology', approvedAt: '2 hours ago' },
    { id: '2', title: 'Type 2 Diabetes Management', category: 'Endocrinology', approvedAt: '1 day ago' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Approved Responses</h1>
        <p className="text-slate-600 dark:text-slate-400">Previously validated responses</p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Approved Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {approvedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-50">{item.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span className="text-sm text-slate-500">{item.approvedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}